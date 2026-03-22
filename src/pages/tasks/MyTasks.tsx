import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import axiosInstance from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import { Search, MapPin, DollarSign, Clock, Filter, Plus, Edit, Trash2, Eye, Briefcase, FileText, CheckCircle, XCircle, Clock as ClockIcon, MessageCircle, Send } from 'lucide-react'
import { Task } from '@/types'
import { showToast } from '@/lib/toast'

interface Message {
  id: number
  sender: number
  sender_username: string
  receiver: number
  content: string
  is_read: boolean
  created_at: string
}

interface ExtendedTask extends Task {
  application_status?: 'pending' | 'accepted' | 'rejected'
  application_id?: number
  applied_at?: string
  application_message?: string
  messages?: Message[]
  unread_count?: number
}

const MyTasks = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'posted' | 'applied'>('posted')
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [selectedTask, setSelectedTask] = useState<ExtendedTask | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  // Fetch tasks posted by user
  const { data: postedTasksData, isLoading: postedLoading, refetch: refetchPosted } = useQuery({
    queryKey: ['my-posted-tasks', searchTerm, category, status, user?.id],
    queryFn: async () => {
      let url = '/tasks/?'
      const params: string[] = [`creator=${user?.id}`]
      if (searchTerm) params.push(`search=${searchTerm}`)
      if (category && category !== 'all') params.push(`category=${category}`)
      if (status && status !== 'all') params.push(`status=${status}`)
      url += params.join('&')
      const response = await axiosInstance.get(url)
      return response.data?.results || response.data || []
    },
    enabled: !!user && activeTab === 'posted',
  })

  // Fetch tasks user applied for
  const { data: appliedTasksData, isLoading: appliedLoading, refetch: refetchApplied } = useQuery({
    queryKey: ['my-applied-tasks', user?.id],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/tasks/my-applications/')
        return response.data || []
      } catch (error) {
        console.error('Error fetching applied tasks:', error)
        return []
      }
    },
    enabled: !!user && activeTab === 'applied',
  })

  const postedTasks = Array.isArray(postedTasksData) ? postedTasksData : []
  const appliedTasks = Array.isArray(appliedTasksData) ? appliedTasksData : []

  const categories = ['all', 'cleaning', 'delivery', 'moving', 'repair', 'tutoring', 'other']
  const statuses = ['all', 'open', 'in_progress', 'completed', 'cancelled']

  const handleDelete = async (taskId: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await axiosInstance.delete(`/tasks/${taskId}/`)
        showToast.success('Task deleted successfully')
        refetchPosted()
      } catch (error) {
        showToast.error('Failed to delete task')
      }
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTask) return
    
    setSendingMessage(true)
    try {
      await axiosInstance.post(`/tasks/${selectedTask.id}/send-message/`, {
        content: newMessage
      })
      showToast.success('Message sent')
      setNewMessage('')
      refetchApplied()
    } catch (error: any) {
      console.error('Send message error:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Failed to send message'
      showToast.error('Failed to send message', {
        description: errorMessage
      })
    } finally {
      setSendingMessage(false)
    }
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

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
      case 'accepted':
        return 'bg-green-500/10 text-green-700 dark:text-green-400'
      case 'rejected':
        return 'bg-red-500/10 text-red-700 dark:text-red-400'
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
    }
  }

  const getApplicationStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-3 w-3" />
      case 'accepted':
        return <CheckCircle className="h-3 w-3" />
      case 'rejected':
        return <XCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  const isLoading = (activeTab === 'posted' && postedLoading) || (activeTab === 'applied' && appliedLoading)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">My Tasks</h1>
          <p className="text-muted-foreground">Manage tasks you've posted and track your applications</p>
        </div>
        <Link to="/tasks/create">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Post New Task
          </Button>
        </Link>
      </div>

      {/* Modern Tab Bar */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('posted')}
            className={`pb-3 px-1 text-sm font-medium transition-all duration-200 relative ${
              activeTab === 'posted'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Posted Tasks</span>
              <Badge variant="secondary" className="ml-1 bg-muted">
                {postedTasks.length}
              </Badge>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('applied')}
            className={`pb-3 px-1 text-sm font-medium transition-all duration-200 relative ${
              activeTab === 'applied'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Applied Tasks</span>
              <Badge variant="secondary" className="ml-1 bg-muted">
                {appliedTasks.length}
              </Badge>
            </div>
          </button>
        </div>
      </div>

      {/* Filters - Only show for Posted Tasks */}
      {activeTab === 'posted' && (
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your tasks..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((stat) => (
                    <SelectItem key={stat} value={stat}>
                      {stat.charAt(0).toUpperCase() + stat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2" onClick={() => {
                setSearchTerm('')
                setCategory('all')
                setStatus('all')
              }}>
                <Filter className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posted Tasks Section */}
      {activeTab === 'posted' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-foreground">{postedTasks.length}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-green-600">{postedTasks.filter(t => t.status === 'open').length}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-blue-600">{postedTasks.filter(t => t.status === 'in_progress').length}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-gray-600">{postedTasks.filter(t => t.status === 'completed').length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Tasks List */}
          {postedTasks.length > 0 ? (
            <div className="space-y-4">
              {postedTasks.map((task: Task) => (
                <Card key={task.id} className="border-border hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Posted {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-foreground">{task.title}</h3>
                        <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{task.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{task.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="font-semibold text-primary">₦{task.budget?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="capitalize">{task.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/tasks/${task.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        </Link>
                        <Link to={`/tasks/${task.id}/edit`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    {(task as any).applications_count > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {(task as any).applications_count} application{(task as any).applications_count !== 1 ? 's' : ''}
                          </span>
                          <Link to={`/tasks/${task.id}`}>
                            <Button variant="ghost" size="sm" className="text-primary">
                              View →
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">No tasks posted yet</h3>
              <p className="text-muted-foreground mb-4">Start by posting your first task</p>
              <Link to="/tasks/create">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Post Your First Task
                </Button>
              </Link>
            </div>
          )}
        </>
      )}

      {/* Applied Tasks Section */}
      {activeTab === 'applied' && (
        <>
          {appliedTasks.length > 0 ? (
            <div className="space-y-4">
              {appliedTasks.map((task: ExtendedTask) => (
                <Card key={task.id} className="border-border hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                            {task.status?.replace('_', ' ')}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getApplicationStatusColor(task.application_status || 'pending')}`}>
                            {getApplicationStatusIcon(task.application_status || 'pending')}
                            {task.application_status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Applied {new Date(task.applied_at || '').toLocaleDateString()}
                          </span>
                          {task.unread_count && task.unread_count > 0 && (
                            <Badge className="bg-primary text-white text-xs">
                              {task.unread_count} new
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-foreground">{task.title}</h3>
                        <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{task.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{task.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="font-semibold text-primary">₦{task.budget?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="capitalize">{task.category}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <span>Posted by {task.creator?.username}</span>
                          </div>
                        </div>
                        
                        {/* Application Message */}
                        {task.application_message && (
                          <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Your application:</p>
                            <p className="text-sm text-foreground">{task.application_message}</p>
                          </div>
                        )}
                        
                        {/* Messages Section */}
                        {task.messages && task.messages.length > 0 && task.application_status === 'accepted' && (
                          <div className="mt-4 pt-3 border-t border-border">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-muted-foreground">Messages</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-primary h-7 px-2"
                                onClick={() => {
                                  setSelectedTask(task)
                                  setIsChatOpen(true)
                                }}
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                View All ({task.messages.length})
                              </Button>
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {task.messages.slice(-3).map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[80%] rounded-lg px-3 py-1.5 ${
                                    msg.sender === user?.id 
                                      ? 'bg-primary text-white' 
                                      : 'bg-muted text-foreground'
                                  }`}>
                                    <p className="text-xs">{msg.content}</p>
                                    <p className="text-[10px] opacity-70 mt-0.5">
                                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {task.application_status === 'accepted' && (
                              <div className="mt-2 flex gap-2">
                                <Input
                                  placeholder="Type a message..."
                                  value={selectedTask?.id === task.id ? newMessage : ''}
                                  onChange={(e) => {
                                    setSelectedTask(task)
                                    setNewMessage(e.target.value)
                                  }}
                                  onKeyPress={(e) => e.key === 'Enter' && selectedTask?.id === task.id && handleSendMessage()}
                                  className="flex-1 h-8 text-sm"
                                />
                                <Button 
                                  size="sm" 
                                  className="h-8 px-3"
                                  onClick={() => {
                                    setSelectedTask(task)
                                    handleSendMessage()
                                  }}
                                  disabled={!newMessage.trim() || sendingMessage}
                                >
                                  <Send className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/tasks/${task.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        </Link>
                        {task.application_status === 'accepted' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1 text-primary border-primary"
                            onClick={() => {
                              setSelectedTask(task)
                              setIsChatOpen(true)
                            }}
                          >
                            <MessageCircle className="h-3 w-3" />
                            Chat
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">No applications yet</h3>
              <p className="text-muted-foreground mb-4">Browse tasks and apply to get started</p>
              <Link to="/tasks">
                <Button className="bg-primary hover:bg-primary/90">
                  Browse Tasks
                </Button>
              </Link>
            </div>
          )}
        </>
      )}

      {/* Full Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Chat about: {selectedTask?.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Communicate with {selectedTask?.creator?.username} about this task
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="h-80 overflow-y-auto space-y-3 p-2 border border-border rounded-lg">
              {selectedTask?.messages && selectedTask.messages.length > 0 ? (
                selectedTask.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      msg.sender === user?.id 
                        ? 'bg-primary text-white' 
                        : 'bg-muted text-foreground'
                    }`}>
                      <p className="text-sm break-words">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs">Start the conversation!</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || sendingMessage}
              >
                {sendingMessage ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <p className="text-xs text-muted-foreground">
              Tip: You can also continue on WhatsApp by sharing your number in chat
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MyTasks