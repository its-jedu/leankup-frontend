import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import { Input } from '../../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { useAuth } from '../../hooks/useAuth'
import axiosInstance from '../../lib/axios'
import { Campaign } from '../../types'
import { 
  Target, 
  Calendar, 
  User, 
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Users,
  Clock
} from 'lucide-react'

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [contributeAmount, setContributeAmount] = useState('')
  const [isContributeOpen, setIsContributeOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const { data: campaign, isLoading } = useQuery<{ data: Campaign }>({
    queryKey: ['campaign', id],
    queryFn: () => axiosInstance.get(`/campaigns/${id}/`),
  })

  const { data: contributions } = useQuery({
    queryKey: ['campaign-contributions', id],
    queryFn: () => axiosInstance.get(`/campaigns/${id}/contributions/`),
  })

  const contributeMutation = useMutation({
    mutationFn: (data: { amount: number }) =>
      axiosInstance.post(`/campaigns/${id}/contribute/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] })
      queryClient.invalidateQueries({ queryKey: ['campaign-contributions', id] })
      setIsContributeOpen(false)
      setContributeAmount('')
      // Redirect to payment page or show success message
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => axiosInstance.delete(`/campaigns/${id}/`),
    onSuccess: () => {
      navigate('/campaigns')
    },
  })

  const handleContribute = () => {
    contributeMutation.mutate({ amount: parseFloat(contributeAmount) })
  }

  const handleDelete = () => {
    deleteMutation.mutate()
  }

  const getProgressPercentage = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100)
  }

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate).getTime()
    const now = new Date().getTime()
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!campaign?.data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Campaign not found</h2>
        <Link to="/campaigns">
          <Button>Back to Campaigns</Button>
        </Link>
      </div>
    )
  }

  const isCreator = user?.id === campaign.data.creator.id
  const progress = getProgressPercentage(campaign.data.raised_amount, campaign.data.target_amount)
  const daysLeft = getDaysLeft(campaign.data.end_date)

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/campaigns" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition">
        <ArrowLeft className="h-4 w-4" />
        Back to Campaigns
      </Link>

      {/* Main content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column - Campaign details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{campaign.data.title}</CardTitle>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  campaign.data.status === 'active' ? 'bg-green-100 text-green-700' :
                  campaign.data.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                  campaign.data.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {campaign.data.status}
                </span>
              </div>
              {isCreator && (
                <div className="flex gap-2">
                  <Link to={`/campaigns/${id}/edit`}>
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
                        <DialogTitle>Delete Campaign</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this campaign? This action cannot be undone.
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
              <p className="text-gray-700">{campaign.data.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Target className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-semibold capitalize">{campaign.data.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-semibold">{new Date(campaign.data.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contributions list */}
          {contributions?.data && contributions.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Contributors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contributions.data.slice(0, 5).map((contribution: any) => (
                    <div key={contribution.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{contribution.contributor.username}</span>
                      </div>
                      <span className="font-semibold text-primary">${contribution.amount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Funding progress and actions */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-primary">
                  ${campaign.data.raised_amount.toLocaleString()}
                </h3>
                <p className="text-gray-500">raised of ${campaign.data.target_amount.toLocaleString()}</p>
              </div>

              <Progress value={progress} className="h-3 mb-4" />

              <div className="flex justify-between text-sm mb-6">
                <div className="text-center">
                  <p className="font-semibold">{progress.toFixed(0)}%</p>
                  <p className="text-gray-500">Funded</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{daysLeft}</p>
                  <p className="text-gray-500">Days Left</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{contributions?.data?.length || 0}</p>
                  <p className="text-gray-500">Supporters</p>
                </div>
              </div>

              {!isCreator && campaign.data.status === 'active' && (
                <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Contribute Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contribute to Campaign</DialogTitle>
                      <DialogDescription>
                        Enter the amount you'd like to contribute to this campaign.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={contributeAmount}
                        onChange={(e) => setContributeAmount(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsContributeOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleContribute} 
                        disabled={!contributeAmount || parseFloat(contributeAmount) <= 0}
                      >
                        Proceed to Payment
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {isCreator && campaign.data.status === 'active' && (
                <Button className="w-full" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Release Funds
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Creator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{campaign.data.creator.username}</p>
                  <p className="text-sm text-gray-500">Campaign Organizer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CampaignDetail