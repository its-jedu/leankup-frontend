import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  Target, 
  MapPin, 
  DollarSign, 
  Clock, 
  Search,
  Calendar,
  Users,
  ArrowRight,
  X,
  Filter
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Task, Campaign } from '@/types'
import { formatDistanceToNow, subHours, subDays, isToday, isThisWeek } from 'date-fns'
import axiosInstance from '@/lib/axios'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterOptions {
  category: string
  location: string
  minBudget: string
  maxBudget: string
  timeFilter: string
  status: string
}

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    location: '',
    minBudget: '',
    maxBudget: '',
    timeFilter: 'all',
    status: 'all'
  })

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['dashboard-tasks', searchQuery, filters],
    queryFn: async () => {
      const params: any = { ordering: '-created_at', limit: 20 }
      if (searchQuery) params.search = searchQuery
      if (filters.category !== 'all') params.category = filters.category
      if (filters.location) params.location = filters.location
      if (filters.minBudget) params.min_budget = filters.minBudget
      if (filters.maxBudget) params.max_budget = filters.maxBudget
      if (filters.status !== 'all') params.status = filters.status
      
      const response = await axiosInstance.get('/tasks/', { params })
      let tasks = response.data?.results || response.data || []
      tasks = Array.isArray(tasks) ? tasks.filter((t: Task) => t.status === 'open') : []
      
      if (filters.timeFilter !== 'all') {
        tasks = tasks.filter((task: Task) => {
          const createdDate = new Date(task.created_at)
          const now = new Date()
          switch (filters.timeFilter) {
            case 'just_now':
              return subHours(now, 1) <= createdDate
            case '5_minutes':
              return subHours(now, 0.083) <= createdDate
            case '1_hour':
              return subHours(now, 1) <= createdDate
            case 'today':
              return isToday(createdDate)
            case 'this_week':
              return isThisWeek(createdDate)
            case 'this_month':
              return subDays(now, 30) <= createdDate
            default:
              return true
          }
        })
      }
      
      return tasks
    },
  })

  // Fetch campaigns
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['dashboard-campaigns', searchQuery, filters],
    queryFn: async () => {
      const params: any = { ordering: '-created_at', limit: 20, status: 'active' }
      if (searchQuery) params.search = searchQuery
      if (filters.category !== 'all') params.category = filters.category
      if (filters.location) params.location = filters.location
      
      const response = await axiosInstance.get('/campaigns/', { params })
      let campaigns = response.data?.results || response.data || []
      campaigns = Array.isArray(campaigns) ? campaigns : []
      
      if (filters.timeFilter !== 'all') {
        campaigns = campaigns.filter((campaign: Campaign) => {
          const createdDate = new Date(campaign.created_at)
          const now = new Date()
          switch (filters.timeFilter) {
            case 'just_now':
              return subHours(now, 1) <= createdDate
            case '5_minutes':
              return subHours(now, 0.083) <= createdDate
            case '1_hour':
              return subHours(now, 1) <= createdDate
            case 'today':
              return isToday(createdDate)
            case 'this_week':
              return isThisWeek(createdDate)
            case 'this_month':
              return subDays(now, 30) <= createdDate
            default:
              return true
          }
        })
      }
      
      return campaigns
    },
  })

  const tasks = Array.isArray(tasksData) ? tasksData : []
  const campaigns = Array.isArray(campaignsData) ? campaignsData : []

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'moving', label: 'Moving' },
    { value: 'repair', label: 'Repair' },
    { value: 'tutoring', label: 'Tutoring' },
  ]

  const timeFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'just_now', label: 'Just Now' },
    { value: '5_minutes', label: '5 Minutes Ago' },
    { value: '1_hour', label: '1 Hour Ago' },
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
  ]

  const getTimeBadge = (createdAt: string) => {
    const date = new Date(createdAt)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)
    
    if (diffMinutes < 1) return { text: 'Just now', variant: 'success' }
    if (diffMinutes < 60) return { text: `${diffMinutes} min ago`, variant: 'info' }
    if (diffMinutes < 1440) return { text: `${Math.floor(diffMinutes / 60)} hours ago`, variant: 'warning' }
    return { text: formatDistanceToNow(date, { addSuffix: true }), variant: 'default' }
  }

  const resetFilters = () => {
    setFilters({
      category: 'all',
      location: '',
      minBudget: '',
      maxBudget: '',
      timeFilter: 'all',
      status: 'all'
    })
    setSearchQuery('')
  }

  const hasActiveFilters = filters.category !== 'all' || filters.location || filters.minBudget || filters.maxBudget || filters.timeFilter !== 'all'

  const getBadgeClass = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
      case 'info':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 'warning':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Section - Solid Blue Background Card */}
      <Card className="relative overflow-hidden border-none bg-blue-600 dark:from-secondary/30 dark:via-secondary/10 dark:to-background shadow-xl dark:bg-gradient-to-br">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Glow Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10"></div>
        
        <CardContent className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
                Find Opportunities in <span className="text-white">Your Community</span>
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-2xl">
                Discover local tasks to earn money or support meaningful campaigns that make a difference
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link to="/tasks/create" className="w-full sm:w-auto">
                <Button className="w-full bg-white text-blue-600 hover:bg-white/90 shadow-lg font-semibold">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Post a Task
                </Button>
              </Link>
              <Link to="/campaigns/create" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 hover:text-white">
                  <Target className="mr-2 h-4 w-4" />
                  Start Campaign
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks or campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-background border-border focus:ring-primary dark:focus:ring-secondary"
          />
        </div>
        <Button 
          variant={showFilters || hasActiveFilters ? "default" : "outline"} 
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 h-11"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 rounded-full px-1.5 h-5 bg-primary/20 text-primary dark:bg-secondary/20 dark:text-secondary">
              •
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-border bg-card shadow-lg">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                    <Select value={filters.category} onValueChange={(v) => setFilters({...filters, category: v})}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
                    <Input
                      placeholder="Enter location..."
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                      className="bg-background border-border"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Time Posted</label>
                    <Select value={filters.timeFilter} onValueChange={(v) => setFilters({...filters, timeFilter: v})}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="All Time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeFilters.map((tf) => (
                          <SelectItem key={tf.value} value={tf.value}>{tf.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Min Budget</label>
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minBudget}
                        onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Max Budget</label>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxBudget}
                        onChange={(e) => setFilters({...filters, maxBudget: e.target.value})}
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" onClick={resetFilters} className="gap-2">
                    <X className="h-3 w-3" />
                    Reset Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Available Tasks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Available Tasks</h2>
            </div>
            <Link to="/tasks" className="text-sm text-primary dark:text-secondary hover:underline">
              View All
            </Link>
          </div>

          {tasksLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-secondary"></div>
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {tasks.slice(0, 5).map((task: Task, index: number) => {
                  const timeBadge = getTimeBadge(task.created_at)
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2 }}
                    >
                      <Link to={`/tasks/${task.id}`}>
                        <Card className="hover:shadow-xl transition-all duration-300 border-border cursor-pointer bg-card group">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="bg-primary/10 text-primary dark:bg-secondary/10 dark:text-secondary text-xs border-primary/20 dark:border-secondary/20">
                                    {task.category}
                                  </Badge>
                                  <Badge className={`text-xs border ${getBadgeClass(timeBadge.variant)}`}>
                                    <Clock className="mr-1 h-3 w-3 inline" />
                                    {timeBadge.text}
                                  </Badge>
                                  {task.budget && (
                                    <Badge variant="outline" className="border-green-200 text-green-600 dark:border-green-800 dark:text-green-400 text-xs">
                                      <DollarSign className="mr-1 h-3 w-3 inline" />
                                      ₦{task.budget.toLocaleString()}
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                                  {task.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {task.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{task.location}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{task.applications?.length || 0} applicants</span>
                                  </div>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="shrink-0 gap-1 text-xs group-hover:bg-primary group-hover:text-white group-hover:border-primary dark:group-hover:bg-secondary dark:group-hover:text-background dark:group-hover:border-secondary transition-all"
                              >
                                Apply
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No tasks found</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Active Campaigns Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Active Campaigns</h2>
            </div>
            <Link to="/campaigns" className="text-sm text-primary dark:text-secondary hover:underline">
              View All
            </Link>
          </div>

          {campaignsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-secondary"></div>
            </div>
          ) : campaigns.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {campaigns.slice(0, 5).map((campaign: Campaign, index: number) => {
                  const progress = campaign.target_amount > 0 
                    ? (campaign.raised_amount / campaign.target_amount) * 100 
                    : 0
                  const timeBadge = getTimeBadge(campaign.created_at)
                  const daysLeft = Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  
                  return (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2 }}
                    >
                      <Link to={`/campaigns/${campaign.id}`}>
                        <Card className="hover:shadow-xl transition-all duration-300 border-border cursor-pointer bg-card group">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="bg-primary/10 text-primary dark:bg-secondary/10 dark:text-secondary text-xs border-primary/20 dark:border-secondary/20">
                                    {campaign.category}
                                  </Badge>
                                  <Badge className={`text-xs border ${getBadgeClass(timeBadge.variant)}`}>
                                    <Clock className="mr-1 h-3 w-3 inline" />
                                    {timeBadge.text}
                                  </Badge>
                                  <Badge variant="outline" className="border-orange-200 text-orange-600 dark:border-orange-800 dark:text-orange-400 text-xs">
                                    {progress.toFixed(0)}% Funded
                                  </Badge>
                                </div>
                                <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                                  {campaign.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {campaign.description}
                                </p>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Raised: ₦{campaign.raised_amount?.toLocaleString()}</span>
                                    <span className="text-muted-foreground">Goal: ₦{campaign.target_amount?.toLocaleString()}</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-1.5">
                                    <div 
                                      className="bg-gradient-to-r from-primary to-primary/70 dark:from-secondary dark:to-secondary/70 h-1.5 rounded-full transition-all duration-500"
                                      style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Users className="h-3 w-3" />
                                      {campaign.contributions?.length || 0} supporters
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="shrink-0 gap-1 text-xs group-hover:bg-primary group-hover:text-white group-hover:border-primary dark:group-hover:bg-secondary dark:group-hover:text-background dark:group-hover:border-secondary transition-all"
                              >
                                Support
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No campaigns found</p>
                <p className="text-xs text-muted-foreground mt-1">Check back later for new campaigns</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard