import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
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
import { Task, Application } from '../../types'
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
  Send
} from 'lucide-react'

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [applyMessage, setApplyMessage] = useState('')
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const { data: task, isLoading } = useQuery<{ data: Task }>({
    queryKey: ['task', id],
    queryFn: () => axiosInstance.get(`/tasks/${id}/`),
  })

  const { data: applications } = useQuery<{ data: Application[] }>({
    queryKey: ['task-applications', id],
    queryFn: () => axiosInstance.get(`/tasks/${id}/applications/`),
    enabled: !!user && task?.data?.creator?.id === user?.id,
  })

  const applyMutation = useMutation({
    mutationFn: (data: { message: string }) =>
      axiosInstance.post(`/tasks/${id}/apply/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      setIsApplyOpen(false)
      setApplyMessage('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => axiosInstance.delete(`/tasks/${id}/`),
    onSuccess: () => {
      navigate('/tasks')
    },
  })

  const handleApply = () => {
    applyMutation.mutate({ message: applyMessage })
  }

  const handleDelete = () => {
    deleteMutation.mutate()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-700'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-gray-100 text-gray-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!task?.data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Task not found</h2>
        <Link to="/tasks">
          <Button>Back to Tasks</Button>
        </Link>
      </div>
    )
  }

  const isCreator = user?.id === task.data.creator.id
  const hasApplied = task.data.applications?.some((app: any) => app.applicant === user?.id)

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/tasks" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition">
        <ArrowLeft className="h-4 w-4" />
        Back to Tasks
      </Link>

      {/* Main content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column - Task details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{task.data.title}</CardTitle>
                <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(task.data.status)}`}>
                  {task.data.status.replace('_', ' ')}
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
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Task</DialogTitle>
                        <DialogDescription>
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
              <p className="text-gray-700">{task.data.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-semibold text-primary">${task.data.budget}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold">{task.data.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-gray-500">Posted</p>
                    <p className="font-semibold">{new Date(task.data.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-semibold capitalize">{task.data.category}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications section - only visible to creator */}
          {isCreator && applications?.data && applications.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Applications ({applications.data.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {applications.data.map((application) => (
                  <div key={application.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{application.applicant.username}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        application.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {application.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{application.message}</p>
                    {application.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Accept
                        </Button>
                        <Button size="sm" variant="destructive">
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Creator info and actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Posted by</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{task.data.creator.username}</p>
                  <p className="text-sm text-gray-500">Member since {new Date(task.data.creator.date_joined || '').getFullYear()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isCreator && task.data.status === 'open' && !hasApplied && (
            <Card>
              <CardContent className="p-6">
                <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      <Send className="h-4 w-4 mr-2" />
                      Apply for this Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply for Task</DialogTitle>
                      <DialogDescription>
                        Send a message to the task creator explaining why you're the best fit for this task.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Textarea
                        placeholder="Write your application message here..."
                        value={applyMessage}
                        onChange={(e) => setApplyMessage(e.target.value)}
                        rows={5}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsApplyOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleApply} disabled={!applyMessage.trim()}>
                        Submit Application
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskDetail