import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import axiosInstance from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import { Campaign } from '@/types'
import { Search, Target, Calendar, Users, Plus, Filter } from 'lucide-react'

const Campaigns = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')

  // Fetch campaigns
  const { data: campaignsResponse, isLoading } = useQuery({
    queryKey: ['campaigns', searchTerm, category, status],
    queryFn: async () => {
      let url = '/campaigns/?'
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

  // Ensure campaigns is always an array
  const campaigns = Array.isArray(campaignsResponse) ? campaignsResponse : []

  const categories = ['all', 'personal', 'business', 'charity', 'community', 'other']
  const statuses = ['all', 'active', 'draft', 'completed']

  const getProgressPercentage = (raised: number, target: number) => {
    if (!target || target === 0) return 0
    return Math.min((raised / target) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700'
      case 'draft':
        return 'bg-gray-500/10 text-gray-700'
      case 'completed':
        return 'bg-blue-500/10 text-blue-700'
      case 'cancelled':
        return 'bg-red-500/10 text-red-700'
      default:
        return 'bg-gray-500/10 text-gray-700'
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
          <h1 className="text-3xl font-bold mb-2 text-foreground">Fundraising Campaigns</h1>
          <p className="text-muted-foreground">Discover and support amazing campaigns</p>
        </div>
        {user && (
          <Link to="/campaigns/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Target className="mr-2 h-4 w-4" />
              Start a Campaign
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
                placeholder="Search campaigns..."
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

      {/* Campaigns Grid */}
      {campaigns.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign: Campaign) => (
            <Link to={`/campaigns/${campaign.id}`} key={campaign.id}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full border-border">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-2 text-foreground">{campaign.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{campaign.description}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">
                        {Math.round(getProgressPercentage(campaign.raised_amount, campaign.target_amount))}%
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(campaign.raised_amount, campaign.target_amount)} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-primary">
                        ₦{campaign.raised_amount?.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        of ₦{campaign.target_amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{campaign.creator?.username}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Ends {new Date(campaign.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2 text-foreground">No campaigns found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or start a new campaign</p>
          {user && (
            <Link to="/campaigns/create" className="inline-block mt-4">
              <Button className="bg-primary hover:bg-primary/90">
                <Target className="mr-2 h-4 w-4" />
                Start a Campaign
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default Campaigns