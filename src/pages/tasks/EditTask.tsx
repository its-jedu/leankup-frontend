import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import axiosInstance from '@/lib/axios'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { useAuth } from '@/hooks/useAuth'

const taskSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(['cleaning', 'delivery', 'moving', 'repair', 'tutoring', 'other']),
  budget: z.number().min(1, 'Budget must be greater than 0'),
  location: z.string().min(3, 'Location is required'),
})

type TaskFormData = z.infer<typeof taskSchema>

const EditTask = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  // Fetch task data
  const { data: taskResponse, isLoading: taskLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/tasks/${id}/`)
      return response.data
    },
    enabled: !!id,
  })

  const task = taskResponse

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  })

  // Set form values when task loads
  useEffect(() => {
    if (task) {
      setValue('title', task.title)
      setValue('description', task.description)
      setValue('category', task.category)
      setValue('budget', task.budget)
      setValue('location', task.location)
    }
  }, [task, setValue])

  // Check if user is creator
  useEffect(() => {
    if (task && user && task.creator?.id !== user.id) {
      showToast.error('Unauthorized', {
        description: 'You do not have permission to edit this task'
      })
      navigate('/my-tasks')
    }
  }, [task, user, navigate])

  const updateTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => axiosInstance.put(`/tasks/${id}/`, data),
    onSuccess: () => {
      showToast.success('Task Updated!', {
        description: 'Your task has been updated successfully.'
      })
      navigate('/my-tasks')
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Failed to update task')
      showToast.error('Update Failed', {
        description: error.response?.data?.detail || 'Failed to update task'
      })
    },
  })

  const onSubmit = (data: TaskFormData) => {
    updateTaskMutation.mutate(data)
  }

  if (taskLoading) {
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
        <Link to="/my-tasks">
          <Button>Back to My Tasks</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/my-tasks" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition">
        <ArrowLeft className="h-4 w-4" />
        Back to My Tasks
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Edit Task</CardTitle>
          <p className="text-muted-foreground">Update your task details below</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Task Title</label>
              <Input
                {...register('title')}
                placeholder="e.g., Need help moving furniture"
                className="bg-background border-border text-foreground"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                {...register('description')}
                placeholder="Describe the task in detail..."
                rows={5}
                className="bg-background border-border text-foreground"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category</label>
                <Select 
                  defaultValue={task.category}
                  onValueChange={(value: any) => setValue('category', value)}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="moving">Moving</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="tutoring">Tutoring</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Budget (₦)</label>
                <Input
                  type="number"
                  {...register('budget', { valueAsNumber: true })}
                  placeholder="1000"
                  className="bg-background border-border text-foreground"
                />
                {errors.budget && (
                  <p className="text-sm text-destructive">{errors.budget.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Location</label>
              <Input
                {...register('location')}
                placeholder="e.g., New York, NY"
                className="bg-background border-border text-foreground"
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={updateTaskMutation.isPending}
              >
                {updateTaskMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Task'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/my-tasks')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditTask