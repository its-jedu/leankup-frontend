import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Progress } from '../../components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import axiosInstance from '../../lib/axios'
import { useAuth } from '../../hooks/useAuth'
import { Campaign } from '../../types'
import { Search, Target, Calendar, Users, Plus, Filter } from 'lucide-react'

const Campaigns = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')

  const { data: campaigns, isLoading } = useQuery<{ data: Campaign[] }>({
    queryKey: ['campaigns', searchTerm, category, status],
    queryFn: async () => {
      let url = '/campaigns/?'
      const params: string[] = []
      if (searchTerm) params.push(`search=${searchTerm}`)
      if (category && category !== 'all') params.push(`category=${category}`)
      if (status && status !== 'all') params.push(`status=${status}`)
      url += params.join('&')
      return axiosInstance.get(url)
    },
  })

  const categories = [
    'all',
    'personal',
    'business',
    'charity',
    'community',
    'other',
  ]

  const statuses = ['all', 'active', 'draft', 'completed']

  const getProgressPercentage = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'draft':
        return 'bg-gray-100 text-gray-700'
      case 'completed':
        return 'bg-blue-100 text-blue-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fundraising Campaigns</h1>
          <p className="text-gray-600">Discover and support amazing campaigns</p>
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
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns?.data?.map((campaign) => (
            <Link to={`/campaigns/${campaign.id}`} key={campaign.id}>
              <Card className="hover-scale cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">
                        {Math.round(getProgressPercentage(campaign.raised_amount, campaign.target_amount))}%
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(campaign.raised_amount, campaign.target_amount)} />
                    
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-primary">
                        ${campaign.raised_amount.toLocaleString()}
                      </span>
                      <span className="text-gray-500">
                        of ${campaign.target_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm text-gray-600">{campaign.creator?.username}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(campaign.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {campaigns?.data?.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
          <p className="text-gray-600">Try adjusting your filters or start a new campaign</p>
        </div>
      )}
    </div>
  )
}

export default Campaigns