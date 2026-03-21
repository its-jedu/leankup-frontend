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
import axiosInstance from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import { Search, MapPin, DollarSign, Clock, Filter, Plus } from 'lucide-react'
import { Task } from '@/types'

const Tasks = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')

  // Fetch tasks
  const { data: tasksResponse, isLoading } = useQuery({
    queryKey: ['tasks', searchTerm, category, status],
    queryFn: async () => {
      let url = '/tasks/?'
      const params: string[] = []
      if (searchTerm) params.push(`search=${searchTerm}`)
      if (category && category !== 'all') params.push(`category=${category}`)
      if (status && status !== 'all') params.push(`status=${status}`)
      url += params.join('&')
      const response = await axiosInstance.get(url)
      // Handle both paginated and non-paginated responses
      return response.data?.results || response.data || []
    },
  })

  // Ensure tasks is always an array
  const tasks = Array.isArray(tasksResponse) ? tasksResponse : []

  const categories = ['all', 'cleaning', 'delivery', 'moving', 'repair', 'tutoring', 'other']
  const statuses = ['all', 'open', 'in_progress', 'completed']

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
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-muted-foreground">Find local tasks or post your own</p>
        </div>
        {user && (
          <Link to="/tasks/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Post a Task
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
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
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      {tasks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task: Task) => (
            <Link to={`/tasks/${task.id}`} key={task.id}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full border-border">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'open' ? 'bg-green-500/10 text-green-700' :
                      task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-700' :
                      task.status === 'completed' ? 'bg-gray-500/10 text-gray-700' :
                      'bg-red-500/10 text-red-700'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-2 text-foreground">{task.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{task.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{task.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-primary">₦{task.budget}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="capitalize">{task.category}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {task.creator?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">{task.creator?.username}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2 text-foreground">No tasks found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or post a new task</p>
          {user && (
            <Link to="/tasks/create" className="inline-block mt-4">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Post a Task
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default Tasks