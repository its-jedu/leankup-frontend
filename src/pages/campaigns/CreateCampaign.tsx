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

const campaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(['personal', 'business', 'charity', 'community', 'other']),
  target_amount: z.number().min(1, 'Target amount must be greater than 0'),
  end_date: z.string().min(1, 'End date is required'),
})

type CampaignFormData = z.infer<typeof campaignSchema>

const CreateCampaign = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      category: 'personal',
    },
  })

  const createCampaignMutation = useMutation({
    mutationFn: (data: CampaignFormData) => axiosInstance.post('/campaigns/', data),
    onSuccess: () => {
      navigate('/campaigns')
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Failed to create campaign')
    },
  })

  const onSubmit = (data: CampaignFormData) => {
    createCampaignMutation.mutate(data)
  }

  // Get tomorrow's date for min end date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minEndDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/campaigns" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition">
        <ArrowLeft className="h-4 w-4" />
        Back to Campaigns
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Start a Fundraising Campaign</CardTitle>
          <p className="text-gray-600">Fill in the details below to create your campaign</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Title</label>
              <Input
                {...register('title')}
                placeholder="e.g., Help fund my small business"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                {...register('description')}
                placeholder="Tell your story and explain why you're raising funds..."
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
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="charity">Charity</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Amount ($)</label>
                <Input
                  type="number"
                  {...register('target_amount', { valueAsNumber: true })}
                  placeholder="10000"
                />
                {errors.target_amount && (
                  <p className="text-sm text-red-500">{errors.target_amount.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign End Date</label>
              <Input
                type="date"
                {...register('end_date')}
                min={minEndDate}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500">{errors.end_date.message}</p>
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
                disabled={createCampaignMutation.isPending}
              >
                {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/campaigns')}
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

export default CreateCampaign