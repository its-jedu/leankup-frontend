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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import axiosInstance from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import { Search, MapPin, DollarSign, Clock, Filter, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { Task } from '@/types'
import { showToast } from '@/lib/toast'

const MyTasks = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')

  // Fetch user's tasks
  const { data: tasksResponse, isLoading, refetch } = useQuery({
    queryKey: ['my-tasks', searchTerm, category, status],
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
    enabled: !!user,
  })

  const tasks = Array.isArray(tasksResponse) ? tasksResponse : []

  const categories = ['all', 'cleaning', 'delivery', 'moving', 'repair', 'tutoring', 'other']
  const statuses = ['all', 'open', 'in_progress', 'completed', 'cancelled']

  const handleDelete = async (taskId: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await axiosInstance.delete(`/tasks/${taskId}/`)
        showToast.success('Task deleted successfully')
        refetch()
      } catch (error) {
        showToast.error('Failed to delete task')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/10 text-green-700'
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-700'
      case 'completed':
        return 'bg-gray-500/10 text-gray-700'
      case 'cancelled':
        return 'bg-red-500/10 text-red-700'
      default:
        return 'bg-gray-500/10 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return '🟢'
      case 'in_progress':
        return '🔵'
      case 'completed':
        return '✅'
      case 'cancelled':
        return '❌'
      default:
        return '📋'
    }
  }

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
          <p className="text-muted-foreground">Manage and track tasks you've posted</p>
        </div>
        <Link to="/tasks/create">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Post New Task
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'open').length}</p>
            <p className="text-xs text-muted-foreground">Open Tasks</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === 'in_progress').length}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-gray-600">{tasks.filter(t => t.status === 'completed').length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
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
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      {tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((task: Task) => (
            <Card key={task.id} className="border-border hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Task Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)} {task.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Posted {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{task.title}</h3>
                    <p className="text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{task.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-primary">₦{task.budget?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span className="capitalize">{task.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link to={`/tasks/${task.id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link to={`/tasks/${task.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Applications Count */}
                {task.applications_count > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {task.applications_count} application{task.applications_count !== 1 ? 's' : ''}
                      </span>
                      <Link to={`/tasks/${task.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary">
                          View Applications →
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
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No tasks found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || category !== 'all' || status !== 'all' 
              ? 'Try adjusting your filters' 
              : 'You haven\'t posted any tasks yet'}
          </p>
          <Link to="/tasks/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Post Your First Task
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default MyTasks