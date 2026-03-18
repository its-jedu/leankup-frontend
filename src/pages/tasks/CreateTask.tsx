import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import axiosInstance from '../../lib/axios'
import { ArrowLeft } from 'lucide-react'

const taskSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(['cleaning', 'delivery', 'moving', 'repair', 'tutoring', 'other']),
  budget: z.number().min(1, 'Budget must be greater than 0'),
  location: z.string().min(3, 'Location is required'),
})

type TaskFormData = z.infer<typeof taskSchema>

const CreateTask = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      category: 'other',
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => axiosInstance.post('/tasks/', data),
    onSuccess: () => {
      navigate('/tasks')
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Failed to create task')
    },
  })

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/tasks" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition">
        <ArrowLeft className="h-4 w-4" />
        Back to Tasks
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Post a New Task</CardTitle>
          <p className="text-gray-600">Fill in the details below to create your task listing</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Title</label>
              <Input
                {...register('title')}
                placeholder="e.g., Need help moving furniture"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                {...register('description')}
                placeholder="Describe the task in detail..."
                rows={5}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select onValueChange={(value: any) => setValue('category', value)}>
                  <SelectTrigger>
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
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Budget ($)</label>
                <Input
                  type="number"
                  {...register('budget', { valueAsNumber: true })}
                  placeholder="100"
                />
                {errors.budget && (
                  <p className="text-sm text-red-500">{errors.budget.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                {...register('location')}
                placeholder="e.g., New York, NY"
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? 'Creating...' : 'Post Task'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tasks')}
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

export default CreateTask