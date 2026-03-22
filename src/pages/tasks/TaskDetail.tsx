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
  Star
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import PosterProfileModal from '@/components/poster/PosterProfileModal'
import ChatRoom from '@/components/chat/ChatRoom'
import PaymentProofUpload from '@/components/tasks/PaymentProofUpload'
import PaymentProofList from '@/components/tasks/PaymentProofList'
import EscrowManager from '@/components/tasks/EscrowManager'

interface Application {
  id: number
  applicant: number
  applicant_username: string
  message: string
  status: string
  created_at: string
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

  // Fetch task details
  const { data: taskResponse, isLoading } = useQuery({
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
      return response.data?.results || response.data || []
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
      showToast.error('Application Failed', {
        description: error.response?.data?.detail || 'Failed to submit application'
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => axiosInstance.delete(`/tasks/${id}/`),
    onSuccess: () => {
      showToast.success('Task Deleted', {
        description: 'Task has been deleted successfully.'
      })
      navigate('/tasks')
    },
  })

  const acceptApplicationMutation = useMutation({
    mutationFn: (applicationId: number) =>
      axiosInstance.post(`/tasks/applications/${applicationId}/accept/`),
    onSuccess: (_, applicationId) => {
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['task-applications', id] })
      const acceptedApp = applications.find((a: any) => a.id === applicationId)
      showToast.success('Application Accepted', {
        description: `You have accepted ${acceptedApp?.applicant_username}'s application. They have been notified.`
      })
      refetchApplications()
    },
  })

  const rejectApplicationMutation = useMutation({
    mutationFn: (applicationId: number) =>
      axiosInstance.post(`/tasks/applications/${applicationId}/reject/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['task-applications', id] })
      showToast.info('Application Rejected')
      refetchApplications()
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

  const isCreator = user?.id === task.creator?.id

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
                <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              {isCreator && (
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
            </CardContent>
          </Card>

          {/* Applications section - only visible to creator */}
          {isCreator && applications.length > 0 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Applications ({applications.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {applications.map((application: any) => (
                  <div key={application.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
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
                    {application.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => acceptApplicationMutation.mutate(application.id)}
                          disabled={acceptApplicationMutation.isPending}
                        >
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => rejectApplicationMutation.mutate(application.id)}
                          disabled={rejectApplicationMutation.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {application.status === 'accepted' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedApplication(application)
                          setShowChatRoom(true)
                        }}
                        className="mt-2"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Start Chat
                      </Button>
                    )}
                  </div>
                ))}
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
          {!isCreator && task.status === 'open' && !hasApplied && (
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
          {!isCreator && hasApplied && !isApplicationAccepted && (
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
          {!isCreator && isApplicationAccepted && (
            <Card className="border-border bg-green-500/10">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Application Accepted!</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Great news! Your application has been accepted.
                </p>
                <Button 
                  onClick={() => setShowChatRoom(true)}
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Open Chat
                </Button>
                <a
                  href={`https://wa.me/?text=I'm interested in the task: ${task.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-3"
                >
                  Continue on WhatsApp
                </a>
              </CardContent>
            </Card>
          )}

          {/* Payment Proof Upload - Only show when task is in progress */}
          {task.status === 'in_progress' && (
            <PaymentProofUpload
              taskId={parseInt(id!)}
              taskTitle={task.title}
              taskBudget={task.budget}
              isPoster={isCreator}
              isAcceptedApplicant={isApplicationAccepted}
            />
          )}

          {/* Escrow Manager */}
          <EscrowManager
            taskId={parseInt(id!)}
            taskTitle={task.title}
            taskBudget={task.budget}
            taskStatus={task.status}
            isPoster={isCreator}
            isAcceptedApplicant={isApplicationAccepted}
          />

          {/* Payment Proofs List */}
          <PaymentProofList
            taskId={parseInt(id!)}
            taskTitle={task.title}
            isPoster={isCreator}
            isAcceptedApplicant={isApplicationAccepted}
          />

          {/* Task Status Messages */}
          {task.status !== 'open' && !isCreator && !hasApplied && (
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

      {/* Poster Profile Modal */}
      <PosterProfileModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        userId={task.creator?.id}
        username={task.creator?.username}
      />

      {/* Chat Room */}
      {showChatRoom && (
        <ChatRoom
          taskId={parseInt(id!)}
          taskTitle={task.title}
          otherUserId={isCreator ? (userApplication?.applicant || 0) : task.creator?.id}
          otherUsername={isCreator ? (userApplication?.applicant_username || '') : task.creator?.username}
          onClose={() => setShowChatRoom(false)}
        />
      )}
    </div>
  )
}

export default TaskDetail