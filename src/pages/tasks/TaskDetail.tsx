import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Textarea } from '../../components/ui/textarea'
import { Input } from '../../components/ui/input'
import { useAuth } from '../../hooks/useAuth'
import axiosInstance from '../../lib/axios'
import { Task } from '../../types'
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  Briefcase,
  MessageCircle,
  Star,
  Key,
  Users,
  Wallet
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import PosterProfileModal from '@/components/poster/PosterProfileModal'
import ChatRoom from '@/components/chat/ChatRoom'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface Application {
  id: number
  applicant: number
  applicant_username: string
  message: string
  status: string
  created_at: string
  applicant_profile?: any
  applicant_stats?: any
}

interface EscrowInfo {
  has_escrow: boolean
  id?: number
  amount?: string
  status?: string
  funded_at?: string
  released_at?: string
  completion_key?: string
  poster_completed?: boolean
  worker_completed?: boolean
  can_complete?: boolean
}

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [applyMessage, setApplyMessage] = useState('')
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showChatRoom, setShowChatRoom] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [completionKey, setCompletionKey] = useState('')
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [selectedApplicants, setSelectedApplicants] = useState<number[]>([])
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false)

  // Fetch task details
  const { data: taskResponse, isLoading, refetch: refetchTask } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/tasks/${id}/`)
      return response.data
    },
  })

  // Fetch applications
  const { data: applicationsResponse, refetch: refetchApplications } = useQuery({
    queryKey: ['task-applications', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/tasks/${id}/applications/`)
      return response.data || []
    },
    enabled: !!user && taskResponse?.creator?.id === user?.id,
  })

  // Fetch escrow info
  const { data: escrowInfo, refetch: refetchEscrow } = useQuery({
    queryKey: ['task-escrow', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/tasks/${id}/escrow_info/`)
      return response.data as EscrowInfo
    },
    enabled: !!user && taskResponse?.creator?.id === user?.id,
  })

  // Fetch user stats for poster
  const { data: userStats } = useQuery({
    queryKey: ['user-stats', taskResponse?.creator?.id],
    queryFn: async () => {
      const tasksRes = await axiosInstance.get('/tasks/', { params: { creator: taskResponse?.creator?.id } })
      const tasks = tasksRes.data?.results || tasksRes.data || []
      return {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t: any) => t.status === 'completed').length,
      }
    },
    enabled: !!taskResponse?.creator?.id,
  })

  const task = taskResponse
  const applications = Array.isArray(applicationsResponse) ? applicationsResponse : []

  // Check if user has already applied
  const userApplication = applications.find((app: any) => app.applicant === user?.id)
  const hasApplied = !!userApplication
  const isApplicationAccepted = userApplication?.status === 'accepted'
  const isPoster = user?.id === task?.creator?.id

  const applyMutation = useMutation({
    mutationFn: (data: { message: string }) =>
      axiosInstance.post(`/tasks/${id}/apply/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['task-applications', id] })
      setIsApplyOpen(false)
      setApplyMessage('')
      showToast.success('Application Submitted!', {
        description: 'Your application has been sent. The task creator will be notified.'
      })
    },
    onError: (error: any) => {
      if (error.response?.data?.already_applied) {
        showToast.error('Already Applied', {
          description: 'You have already applied to this task.'
        })
      } else {
        showToast.error('Application Failed', {
          description: error.response?.data?.detail || 'Failed to submit application'
        })
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => axiosInstance.delete(`/tasks/${id}/delete_task/`),
    onSuccess: () => {
      showToast.success('Task Deleted', {
        description: 'Task has been deleted successfully.'
      })
      navigate('/my-tasks')
    },
    onError: (error: any) => {
      showToast.error('Delete Failed', {
        description: error.response?.data?.error || 'Failed to delete task'
      })
    },
  })

  const acceptApplicationsMutation = useMutation({
    mutationFn: (applicationIds: number[]) =>
      axiosInstance.post(`/tasks/${id}/accept_applications/`, { application_ids: applicationIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['task-applications', id] })
      setIsAcceptDialogOpen(false)
      setSelectedApplicants([])
      showToast.success('Applications Accepted', {
        description: `Accepted ${selectedApplicants.length} application(s). Task is now in progress.`
      })
      refetchApplications()
      refetchTask()
    },
    onError: (error: any) => {
      showToast.error('Accept Failed', {
        description: error.response?.data?.error || 'Failed to accept applications'
      })
    },
  })

  const completeTaskMutation = useMutation({
    mutationFn: (key: string) =>
      axiosInstance.post(`/tasks/${id}/mark_complete/`, { completion_key: key }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['task-escrow', id] })
      setIsCompleteDialogOpen(false)
      setCompletionKey('')
      
      if (response.data.poster_completed && response.data.worker_completed) {
        showToast.success('Task Fully Completed!', {
          description: 'Both parties have confirmed. Escrow has been released to the worker(s)!'
        })
      } else if (response.data.poster_completed) {
        showToast.success('Task Marked Complete', {
          description: 'You have marked this task as complete. Waiting for worker confirmation to release funds.'
        })
      } else if (response.data.worker_completed) {
        showToast.success('Task Marked Complete', {
          description: 'You have marked this task as complete. Waiting for poster confirmation to release funds.'
        })
      }
      
      refetchTask()
      refetchEscrow()
    },
    onError: (error: any) => {
      showToast.error('Completion Failed', {
        description: error.response?.data?.error || 'Failed to mark task as complete'
      })
    },
  })

  const handleApply = () => {
    if (!applyMessage.trim()) {
      showToast.error('Message Required', {
        description: 'Please write a message explaining why you are a good fit.'
      })
      return
    }
    applyMutation.mutate({ message: applyMessage })
  }

  const handleDelete = () => {
    deleteMutation.mutate()
  }

  const handleAcceptApplications = () => {
    if (selectedApplicants.length === 0) {
      showToast.error('No Applications Selected', {
        description: 'Please select at least one application to accept.'
      })
      return
    }
    acceptApplicationsMutation.mutate(selectedApplicants)
  }

  const handleCompleteTask = () => {
    if (!completionKey.trim()) {
      showToast.error('Completion Key Required', {
        description: 'Please enter the completion key to mark this task as complete.'
      })
      return
    }
    completeTaskMutation.mutate(completionKey)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/10 text-green-700 dark:text-green-400'
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
      case 'completed':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
      case 'cancelled':
        return 'bg-red-500/10 text-red-700 dark:text-red-400'
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
    }
  }

  // Check if both parties have completed
  const bothCompleted = escrowInfo?.poster_completed && escrowInfo?.worker_completed
  const waitingForOther = (isPoster && escrowInfo?.poster_completed && !escrowInfo?.worker_completed) ||
    (!isPoster && isApplicationAccepted && escrowInfo?.worker_completed && !escrowInfo?.poster_completed)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Task not found</h2>
        <Link to="/tasks">
          <Button>Back to Tasks</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/tasks" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition">
        <ArrowLeft className="h-4 w-4" />
        Back to Tasks
      </Link>

      {/* Main content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column - Task details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2 text-foreground">{task.title}</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  {escrowInfo?.poster_completed && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Poster Confirmed
                    </Badge>
                  )}
                  {escrowInfo?.worker_completed && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Worker Confirmed
                    </Badge>
                  )}
                </div>
              </div>
              {isPoster && task.status === 'open' && (
                <div className="flex gap-2">
                  <Link to={`/tasks/${id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Delete Task</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Are you sure you want to delete this task? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">{task.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-semibold text-primary">₦{task.budget?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold text-foreground">{task.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Posted</p>
                    <p className="font-semibold text-foreground">{new Date(task.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-semibold text-foreground capitalize">{task.category}</p>
                  </div>
                </div>
              </div>

              {/* Completion Progress Bar */}
              {task.status === 'in_progress' && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Completion Status</span>
                    <span className="text-sm text-muted-foreground">
                      {escrowInfo?.poster_completed && escrowInfo?.worker_completed ? '100%' :
                       (escrowInfo?.poster_completed || escrowInfo?.worker_completed) ? '50%' : '0%'}
                    </span>
                  </div>
                  <Progress 
                    value={(escrowInfo?.poster_completed ? 50 : 0) + (escrowInfo?.worker_completed ? 50 : 0)} 
                    className="h-2" 
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Poster {escrowInfo?.poster_completed ? '✓' : 'Pending'}</span>
                    <span>Worker {escrowInfo?.worker_completed ? '✓' : 'Pending'}</span>
                  </div>
                  {waitingForOther && (
                    <p className="text-sm text-amber-600 mt-2 text-center">
                      Waiting for {escrowInfo?.poster_completed ? 'worker' : 'poster'} to confirm completion...
                    </p>
                  )}
                  {bothCompleted && (
                    <p className="text-sm text-green-600 mt-2 text-center">
                      Both parties have confirmed! Funds have been released to the worker(s).
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applications section - only visible to creator */}
          {isPoster && task.status === 'open' && applications.length > 0 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Applications ({applications.length})</CardTitle>
                <p className="text-sm text-muted-foreground">Select applicants to accept for this task</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {applications.map((application: any) => (
                  <div key={application.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedApplicants.includes(application.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedApplicants([...selectedApplicants, application.id])
                            } else {
                              setSelectedApplicants(selectedApplicants.filter(id => id !== application.id))
                            }
                          }}
                          className="w-4 h-4 rounded border-border"
                        />
                        <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{application.applicant_username}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        application.status === 'pending' ? 'bg-yellow-500/10 text-yellow-700' :
                        application.status === 'accepted' ? 'bg-green-500/10 text-green-700' :
                        'bg-red-500/10 text-red-700'
                      }`}>
                        {application.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{application.message}</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedApplication(application)
                        setShowProfileModal(true)
                      }}
                    >
                      <User className="h-3 w-3 mr-1" />
                      View Profile
                    </Button>
                  </div>
                ))}
                {selectedApplicants.length > 0 && (
                  <Button 
                    onClick={() => setIsAcceptDialogOpen(true)}
                    className="w-full mt-4"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Accept Selected ({selectedApplicants.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Creator info and actions */}
        <div className="space-y-6">
          <Card className="border-border cursor-pointer hover:shadow-lg transition" onClick={() => setShowProfileModal(true)}>
            <CardHeader>
              <CardTitle className="text-foreground">Posted by</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{task.creator?.username}</p>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(task.creator?.date_joined || '').getFullYear()}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{userStats?.totalTasks || 0} tasks posted</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{userStats?.completedTasks || 0} completed</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                <Star className="h-3 w-3" />
                <span>Click to view full profile</span>
              </div>
            </CardContent>
          </Card>

          {/* Apply Button - For non-creators */}
          {!isPoster && task.status === 'open' && !hasApplied && (
            <Card className="border-border">
              <CardContent className="p-6">
                <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      <Send className="h-4 w-4 mr-2" />
                      Apply for this Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Apply for Task</DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Send a message to the task creator explaining why you're the best fit for this task.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Textarea
                        placeholder="Write your application message here..."
                        value={applyMessage}
                        onChange={(e) => setApplyMessage(e.target.value)}
                        rows={5}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsApplyOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleApply} 
                        disabled={!applyMessage.trim() || applyMutation.isPending}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Already Applied State */}
          {!isPoster && hasApplied && !isApplicationAccepted && (
            <Card className="border-border bg-yellow-500/10">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Application Submitted!</h3>
                <p className="text-sm text-muted-foreground">
                  Your application is pending review. The task creator will notify you once a decision is made.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Application Accepted State */}
          {!isPoster && isApplicationAccepted && task.status === 'in_progress' && (
            <Card className="border-border bg-green-500/10">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Application Accepted!</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Great news! Your application has been accepted. You can now start working on this task.
                </p>
                <Button 
                  onClick={() => setShowChatRoom(true)}
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Open Chat
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Completion Key Dialog - For both parties */}
          {task.status === 'in_progress' && ((isPoster && !escrowInfo?.poster_completed) || (isApplicationAccepted && !escrowInfo?.worker_completed)) && (
            <Card className="border-border">
              <CardContent className="p-6">
                <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                      <Key className="h-4 w-4" />
                      Mark Task as Complete
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Complete Task</DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Enter the completion key to mark this task as complete.
                        {isPoster && escrowInfo?.completion_key && (
                          <span className="block mt-2 text-sm text-amber-600">
                            Your completion key: <span className="font-mono">{escrowInfo.completion_key}</span>
                          </span>
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <label className="text-sm font-medium text-foreground mb-2 block">Completion Key</label>
                      <Input
                        placeholder="Enter completion key"
                        value={completionKey}
                        onChange={(e) => setCompletionKey(e.target.value)}
                        className="bg-background border-border text-foreground font-mono"
                      />
                      {!isPoster && (
                        <p className="text-xs text-muted-foreground mt-2">
                          The completion key will be provided by the task poster when the work is done.
                        </p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCompleteTask} 
                        disabled={!completionKey.trim() || completeTaskMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {completeTaskMutation.isPending ? 'Processing...' : 'Mark Complete'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Already Completed by this user */}
          {(isPoster && escrowInfo?.poster_completed) || (isApplicationAccepted && escrowInfo?.worker_completed) && (
            <Card className="border-border bg-green-500/10">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Task Completed!</h3>
                <p className="text-sm text-muted-foreground">
                  You have marked this task as complete. 
                  {waitingForOther ? ' Waiting for the other party to confirm.' : 
                   bothCompleted ? ' Funds have been released to the worker(s)!' : ''}
                </p>
                {bothCompleted && (
                  <div className="mt-3 p-3 bg-green-500/20 rounded-lg">
                    <Wallet className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <p className="text-sm font-medium text-green-700">Payment Released!</p>
                    <p className="text-xs text-green-600">Funds have been sent to the worker's wallet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Escrow Info Card - For Poster Only */}
          {isPoster && escrowInfo?.has_escrow && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Escrow Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount in Escrow:</span>
                  <span className="font-semibold text-primary">₦{parseFloat(escrowInfo.amount || '0').toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${
                    escrowInfo.status === 'funded' ? 'text-green-600' :
                    escrowInfo.status === 'released' ? 'text-blue-600' :
                    'text-yellow-600'
                  }`}>
                    {escrowInfo.status?.toUpperCase()}
                  </span>
                </div>
                {escrowInfo.funded_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Funded:</span>
                    <span className="text-sm">{new Date(escrowInfo.funded_at).toLocaleDateString()}</span>
                  </div>
                )}
                {escrowInfo.released_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Released:</span>
                    <span className="text-sm">{new Date(escrowInfo.released_at).toLocaleDateString()}</span>
                  </div>
                )}
                {escrowInfo.completion_key && (
                  <div className="mt-2 p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Completion Key:</p>
                    <code className="text-xs font-mono break-all">{escrowInfo.completion_key}</code>
                    <p className="text-xs text-amber-600 mt-1">
                      Share this key with the worker when the task is done to mark it as complete.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Task Status Messages */}
          {task.status !== 'open' && !isPoster && !hasApplied && (
            <Card className="border-border bg-muted">
              <CardContent className="p-6 text-center">
                {task.status === 'in_progress' ? (
                  <>
                    <Clock className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">Task In Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      This task is currently being worked on and is not accepting new applications.
                    </p>
                  </>
                ) : task.status === 'completed' ? (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">Task Completed</h3>
                    <p className="text-sm text-muted-foreground">
                      This task has been completed and is no longer accepting applications.
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">Task Cancelled</h3>
                    <p className="text-sm text-muted-foreground">
                      This task has been cancelled and is no longer available.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Accept Applications Dialog */}
      <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Accept Applications</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You are about to accept {selectedApplicants.length} application(s). Once accepted:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>The task will be marked as "In Progress"</li>
              <li>The selected applicants will be notified</li>
              <li>Other applications will be automatically rejected</li>
              <li>The escrow funds will be distributed equally among accepted workers upon completion</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAcceptApplications} 
              disabled={acceptApplicationsMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {acceptApplicationsMutation.isPending ? 'Processing...' : 'Confirm Acceptance'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Poster Profile Modal */}
      <PosterProfileModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        userId={selectedApplication?.applicant || task.creator?.id}
        username={selectedApplication?.applicant_username || task.creator?.username}
      />

      {/* Chat Room */}
      {showChatRoom && (
        <ChatRoom
          taskId={parseInt(id!)}
          taskTitle={task.title}
          otherUserId={isPoster ? (userApplication?.applicant || 0) : task.creator?.id}
          otherUsername={isPoster ? (userApplication?.applicant_username || '') : task.creator?.username}
          onClose={() => setShowChatRoom(false)}
        />
      )}
    </div>
  )
}

export default TaskDetail