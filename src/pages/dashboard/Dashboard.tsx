import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import axiosInstance from '@/lib/axios'
import { 
  Briefcase, 
  Target, 
  MapPin, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Filter,
  Search,
  Calendar,
  Users,
  Star,
  ArrowRight,
  Sparkles,
  Flame,
  Shield,
  Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Task, Campaign } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DashboardStats {
  totalEarnings: number
  tasksCompleted: number
  campaignsSupported: number
  successRate: number
}

const Dashboard = () => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [filterType, setFilterType] = useState<'tasks' | 'campaigns'>('tasks')

  // Fetch recent tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['recent-tasks', searchQuery, selectedCategory],
    queryFn: async () => {
      const params: any = { ordering: '-created_at', limit: 10 }
      if (searchQuery) params.search = searchQuery
      if (selectedCategory !== 'all') params.category = selectedCategory
      const response = await axiosInstance.get('/tasks/', { params })
      const tasks = response.data?.results || response.data || []
      return Array.isArray(tasks) ? tasks.filter((t: Task) => t.status === 'open') : []
    },
  })

  // Fetch recent campaigns
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['recent-campaigns', searchQuery],
    queryFn: async () => {
      const params: any = { ordering: '-created_at', limit: 10, status: 'active' }
      if (searchQuery) params.search = searchQuery
      const response = await axiosInstance.get('/campaigns/', { params })
      const campaigns = response.data?.results || response.data || []
      return Array.isArray(campaigns) ? campaigns : []
    },
  })

  // Fetch user stats
  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const [tasksRes, campaignsRes, walletRes] = await Promise.all([
          axiosInstance.get('/tasks/', { params: { creator: user?.id } }),
          axiosInstance.get('/campaigns/', { params: { creator: user?.id } }),
          axiosInstance.get('/wallet/balance/'),
        ])
        
        const tasks = tasksRes.data?.results || tasksRes.data || []
        const campaigns = campaignsRes.data?.results || campaignsRes.data || []
        const completedTasks = tasks.filter((t: Task) => t.status === 'completed').length
        const totalEarnings = tasks
          .filter((t: Task) => t.status === 'completed')
          .reduce((sum: number, t: Task) => sum + (t.budget || 0), 0)
        
        return {
          totalEarnings,
          tasksCompleted: completedTasks,
          campaignsSupported: campaigns.filter((c: Campaign) => c.status === 'completed').length,
          successRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
        }
      } catch {
        return {
          totalEarnings: 0,
          tasksCompleted: 0,
          campaignsSupported: 0,
          successRate: 0,
        }
      }
    },
  })

  const tasks = Array.isArray(tasksData) ? tasksData : []
  const campaigns = Array.isArray(campaignsData) ? campaignsData : []
  const stats: DashboardStats = statsData || {
    totalEarnings: 0,
    tasksCompleted: 0,
    campaignsSupported: 0,
    successRate: 0,
  }

  const categories = [
    { value: 'all', label: 'All', icon: Sparkles },
    { value: 'delivery', label: 'Delivery', icon: Zap },
    { value: 'cleaning', label: 'Cleaning', icon: Shield },
    { value: 'moving', label: 'Moving', icon: TrendingUp },
    { value: 'repair', label: 'Repair', icon: Briefcase },
    { value: 'tutoring', label: 'Tutoring', icon: Users },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#032b5f] to-[#1e4a76] dark:from-[#FBBF24] dark:to-[#fcd34d] p-6 md:p-8">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Find Your Next Opportunity
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-md">
              Discover local tasks and campaigns ready for your contribution
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/tasks/create">
              <Button className="bg-white text-[#032b5f] dark:text-[#FBBF24] hover:bg-white/90">
                <Briefcase className="mr-2 h-4 w-4" />
                Post a Task
              </Button>
            </Link>
            <Link to="/campaigns/create">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <Target className="mr-2 h-4 w-4" />
                Start Campaign
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -2 }} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">All time</span>
          </div>
          <p className="text-2xl font-bold text-foreground">₦{stats.totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Earnings</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Briefcase className="h-4 w-4 text-green-500" />
            </div>
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.tasksCompleted}</p>
          <p className="text-xs text-muted-foreground mt-1">Tasks Completed</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Target className="h-4 w-4 text-purple-500" />
            </div>
            <span className="text-xs text-muted-foreground">Supported</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.campaignsSupported}</p>
          <p className="text-xs text-muted-foreground mt-1">Campaigns Supported</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-xs text-muted-foreground">Rate</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.successRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">Success Rate</p>
        </motion.div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks or campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-card border-border"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                className="whitespace-nowrap"
              >
                <Icon className="mr-1 h-3 w-3" />
                {cat.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" onValueChange={(v) => setFilterType(v as 'tasks' | 'campaigns')}>
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

        <TabsContent value="tasks" className="mt-6">
          {tasksLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tasks.length > 0 ? (
            <div className="grid gap-4">
              <AnimatePresence>
                {tasks.map((task: Task, index: number) => (
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
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="bg-primary/10 text-primary">
                                  {task.category}
                                </Badge>
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Just Now
                                </Badge>
                              </div>
                              <h3 className="text-lg font-semibold text-foreground mb-2">{task.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {task.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {task.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ₦{task.budget?.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {task.applications?.length || 0} applicants
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <Button variant="outline" className="gap-2">
                                Apply Now
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No tasks found</p>
                <Link to="/tasks/create">
                  <Button variant="link" className="mt-2">
                    Post your first task
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

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
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                                    {campaign.category}
                                  </Badge>
                                  <Badge variant="outline" className="text-green-600 border-green-200">
                                    <TrendingUp className="mr-1 h-3 w-3" />
                                    {progress.toFixed(0)}% Funded
                                  </Badge>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">{campaign.title}</h3>
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
                                  <p className="text-lg font-semibold text-foreground">
                                    {Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                                  </p>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                  Support
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
                <p className="text-muted-foreground">No active campaigns found</p>
                <Link to="/campaigns/create">
                  <Button variant="link" className="mt-2">
                    Start your first campaign
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Dashboard