import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  Briefcase, 
  Target, 
  MapPin, 
  DollarSign, 
  Clock, 
  Search,
  Filter,
  Calendar,
  Users,
  Star,
  ArrowRight,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Task, Campaign } from '@/types'
import { formatDistanceToNow, format, isToday, isThisWeek, subHours, subDays } from 'date-fns'
import axiosInstance from '@/lib/axios'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    location: '',
    minBudget: '',
    maxBudget: '',
    timeFilter: 'all',
    status: 'all'
  })
  const [activeTab, setActiveTab] = useState<'tasks' | 'campaigns'>('tasks')

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
      
      // Apply time filter
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
      
      // Apply time filter
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
    { value: 'all', label: 'All', icon: Sparkles },
    { value: 'delivery', label: 'Delivery', icon: Briefcase },
    { value: 'cleaning', label: 'Cleaning', icon: Sparkles },
    { value: 'moving', label: 'Moving', icon: ArrowRight },
    { value: 'repair', label: 'Repair', icon: Target },
    { value: 'tutoring', label: 'Tutoring', icon: Users },
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
    const diffHours = Math.floor(diffMinutes / 60)
    
    if (diffMinutes < 1) return { text: 'Just now', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' }
    if (diffMinutes < 5) return { text: `${diffMinutes} min ago`, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' }
    if (diffHours < 1) return { text: `${diffMinutes} min ago`, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' }
    if (diffHours < 24) return { text: `${diffHours} hours ago`, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' }
    return { text: formatDistanceToNow(date, { addSuffix: true }), color: 'text-gray-600 bg-gray-100 dark:bg-gray-800' }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {activeTab === 'tasks' ? 'Available Tasks' : 'Active Campaigns'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeTab === 'tasks' 
              ? 'Find local tasks that match your skills and earn money'
              : 'Support community projects and make a difference'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={activeTab === 'tasks' ? '/tasks/create' : '/campaigns/create'}>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              {activeTab === 'tasks' ? (
                <>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Post a Task
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Start Campaign
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab === 'tasks' ? 'tasks' : 'campaigns'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-card border-border"
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 h-11">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {(filters.category !== 'all' || filters.location || filters.minBudget || filters.maxBudget || filters.timeFilter !== 'all') && (
                  <Badge variant="secondary" className="ml-1 rounded-full px-1.5 h-5">
                    •
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-card border-border" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={filters.category} onValueChange={(v) => setFilters({...filters, category: v})}>
                    <SelectTrigger className="bg-background">
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
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Input
                    placeholder="Enter location..."
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="bg-background"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Min Budget</label>
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minBudget}
                      onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Budget</label>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxBudget}
                      onChange={(e) => setFilters({...filters, maxBudget: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Time Posted</label>
                  <Select value={filters.timeFilter} onValueChange={(v) => setFilters({...filters, timeFilter: v})}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeFilters.map((tf) => (
                        <SelectItem key={tf.value} value={tf.value}>{tf.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {activeTab === 'tasks' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Task Status</label>
                    <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="All Tasks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Open Tasks</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
                  Reset Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={filters.category === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({...filters, category: cat.value})}
              className="rounded-full"
            >
              <cat.icon className="mr-1 h-3 w-3" />
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" onValueChange={(v) => setActiveTab(v as 'tasks' | 'campaigns')}>
        <TabsList className="bg-muted/50 w-full max-w-xs">
          <TabsTrigger value="tasks" className="flex-1 gap-2">
            <Briefcase className="h-4 w-4" />
            Available Tasks
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex-1 gap-2">
            <Target className="h-4 w-4" />
            Active Campaigns
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-6">
          {tasksLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tasks.length > 0 ? (
            <div className="grid gap-4">
              <AnimatePresence>
                {tasks.map((task: Task, index: number) => {
                  const timeBadge = getTimeBadge(task.created_at)
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                    >
                      <Link to={`/tasks/${task.id}`}>
                        <Card className="hover:shadow-lg transition-all duration-300 border-border cursor-pointer">
                          <CardContent className="p-5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                                    {task.category}
                                  </Badge>
                                  <Badge className={timeBadge.color}>
                                    <Clock className="mr-1 h-3 w-3" />
                                    {timeBadge.text}
                                  </Badge>
                                  {task.budget && (
                                    <Badge variant="outline" className="border-green-200 text-green-600">
                                      <DollarSign className="mr-1 h-3 w-3" />
                                      ₦{task.budget.toLocaleString()}
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
                                  {task.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {task.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {task.location}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {task.applications?.length || 0} applicants
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(task.created_at), 'MMM dd, yyyy')}
                                  </div>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <Button variant="outline" className="gap-2">
                                  View Details
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </div>
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
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No tasks found matching your criteria</p>
                <Button variant="link" onClick={resetFilters} className="mt-2">
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="mt-6">
          {campaignsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : campaigns.length > 0 ? (
            <div className="grid gap-4">
              <AnimatePresence>
                {campaigns.map((campaign: Campaign, index: number) => {
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
                      whileHover={{ x: 4 }}
                    >
                      <Link to={`/campaigns/${campaign.id}`}>
                        <Card className="hover:shadow-lg transition-all duration-300 border-border cursor-pointer">
                          <CardContent className="p-5">
                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                                    {campaign.category}
                                  </Badge>
                                  <Badge className={timeBadge.color}>
                                    <Clock className="mr-1 h-3 w-3" />
                                    {timeBadge.text}
                                  </Badge>
                                  <Badge variant="outline" className="border-orange-200 text-orange-600">
                                    <Target className="mr-1 h-3 w-3" />
                                    {progress.toFixed(0)}% Funded
                                  </Badge>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
                                  {campaign.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {campaign.description}
                                </p>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Raised: ₦{campaign.raised_amount?.toLocaleString()}</span>
                                    <span className="text-muted-foreground">Goal: ₦{campaign.target_amount?.toLocaleString()}</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex-shrink-0 flex flex-col items-end justify-between gap-2">
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Days Left</p>
                                  <p className="text-lg font-semibold text-foreground">{daysLeft}</p>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                  Support Campaign
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              </div>
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
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No campaigns found matching your criteria</p>
                <Button variant="link" onClick={resetFilters} className="mt-2">
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Dashboard