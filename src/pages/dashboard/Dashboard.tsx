import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import axiosInstance from '@/lib/axios'
import { Briefcase, Target, Wallet, TrendingUp, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Task, Campaign } from '@/types'
import { showToast } from '@/lib/toast'
import { useEffect, useState } from 'react'

interface DashboardStats {
  totalTasks: number
  activeTasks: number
  completedTasks: number
  totalCampaigns: number
  activeCampaigns: number
  walletBalance: number
}

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    walletBalance: 0,
  })

  // Fetch user's tasks
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['user-tasks', user?.id],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/tasks/', { 
          params: { creator: user?.id, ordering: '-created_at' }
        })
        console.log('Tasks response:', response.data)
        // Handle both paginated and non-paginated responses
        const tasks = response.data?.results || response.data || []
        return Array.isArray(tasks) ? tasks : []
      } catch (error: any) {
        console.error('Error fetching tasks:', error)
        if (error.response?.status === 401) {
          showToast.error('Authentication Error', {
            description: 'Please login again to continue'
          })
        }
        return []
      }
    },
    enabled: !!user,
  })

  // Fetch user's campaigns
  const { data: campaignsData, isLoading: campaignsLoading, error: campaignsError } = useQuery({
    queryKey: ['user-campaigns', user?.id],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/campaigns/', { 
          params: { creator: user?.id, ordering: '-created_at' }
        })
        console.log('Campaigns response:', response.data)
        const campaigns = response.data?.results || response.data || []
        return Array.isArray(campaigns) ? campaigns : []
      } catch (error: any) {
        console.error('Error fetching campaigns:', error)
        return []
      }
    },
    enabled: !!user,
  })

  // Fetch wallet balance
  const { data: walletData, isLoading: walletLoading, error: walletError } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/wallet/balance/')
        console.log('Wallet response:', response.data)
        return response.data?.balance || 0
      } catch (error: any) {
        console.error('Error fetching wallet balance:', error)
        return 0
      }
    },
  })

  // Fetch recent tasks (public tasks)
  const { data: recentTasksData, isLoading: recentTasksLoading } = useQuery({
    queryKey: ['recent-tasks'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/tasks/', {
          params: { ordering: '-created_at', limit: 5 }
        })
        console.log('Recent tasks response:', response.data)
        const tasks = response.data?.results || response.data || []
        return Array.isArray(tasks) ? tasks : []
      } catch (error: any) {
        console.error('Error fetching recent tasks:', error)
        return []
      }
    },
  })

  // Fetch recent campaigns
  const { data: recentCampaignsData, isLoading: recentCampaignsLoading } = useQuery({
    queryKey: ['recent-campaigns'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/campaigns/', {
          params: { ordering: '-created_at', limit: 5, status: 'active' }
        })
        console.log('Recent campaigns response:', response.data)
        const campaigns = response.data?.results || response.data || []
        return Array.isArray(campaigns) ? campaigns : []
      } catch (error: any) {
        console.error('Error fetching recent campaigns:', error)
        return []
      }
    },
  })

  // Update stats when data loads
  useEffect(() => {
    const tasks = Array.isArray(tasksData) ? tasksData : []
    const campaigns = Array.isArray(campaignsData) ? campaignsData : []
    
    setStats({
      totalTasks: tasks.length,
      activeTasks: tasks.filter((t: Task) => t.status === 'open').length,
      completedTasks: tasks.filter((t: Task) => t.status === 'completed').length,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c: Campaign) => c.status === 'active').length,
      walletBalance: typeof walletData === 'number' ? walletData : 0,
    })
  }, [tasksData, campaignsData, walletData])

  const tasks = Array.isArray(tasksData) ? tasksData : []
  const campaigns = Array.isArray(campaignsData) ? campaignsData : []
  const recentTasks = Array.isArray(recentTasksData) ? recentTasksData : []
  const recentCampaigns = Array.isArray(recentCampaignsData) ? recentCampaignsData : []
  const walletBalance = stats.walletBalance

  const totalTasks = stats.totalTasks
  const activeTasks = stats.activeTasks
  const completedTasks = stats.completedTasks
  const totalCampaigns = stats.totalCampaigns
  const activeCampaigns = stats.activeCampaigns
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const statsCards = [
    { title: 'Total Tasks', value: totalTasks, icon: Briefcase, color: 'bg-blue-500', link: '/tasks' },
    { title: 'Active Tasks', value: activeTasks, icon: Clock, color: 'bg-green-500', link: '/tasks?status=open' },
    { title: 'Wallet Balance', value: `₦${walletBalance.toLocaleString()}`, icon: Wallet, color: 'bg-purple-500', link: '/wallet' },
    { title: 'Active Campaigns', value: activeCampaigns, icon: Target, color: 'bg-orange-500', link: '/campaigns?status=active' },
    { title: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: 'bg-cyan-500', link: '/tasks' },
    { title: 'Tasks Completed', value: completedTasks, icon: CheckCircle, color: 'bg-emerald-500', link: '/tasks?status=completed' },
  ]

  const isLoading = tasksLoading || campaignsLoading || walletLoading || recentTasksLoading || recentCampaignsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Check for errors and show messages
  if (tasksError || campaignsError || walletError) {
    console.log('Errors:', { tasksError, campaignsError, walletError })
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 p-5">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative">
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
            Welcome back, {user?.first_name || user?.username || 'User'}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's what's happening with your account
          </p>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statsCards.map((card, index) => (
          <Link to={card.link} key={index}>
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-border h-full cursor-pointer">
              <CardContent className="p-3 sm:p-4">
                <div className={`${card.color} w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-2 sm:mb-3 shadow-md`}>
                  <card.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <p className="text-lg sm:text-xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Recent Tasks */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Recent Tasks
            </CardTitle>
            <Link to="/tasks">
              <Button variant="ghost" size="sm" className="text-primary text-xs gap-1 h-8">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-2">
                {recentTasks.slice(0, 4).map((task: Task) => (
                  <Link to={`/tasks/${task.id}`} key={task.id}>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-all cursor-pointer">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                          task.status === 'open' ? 'bg-green-500/10' :
                          task.status === 'in_progress' ? 'bg-blue-500/10' : 'bg-muted'
                        }`}>
                          {task.status === 'open' ? 
                            <Clock className="h-3 w-3 text-green-600" /> :
                          task.status === 'in_progress' ? 
                            <TrendingUp className="h-3 w-3 text-blue-600" /> :
                            <CheckCircle className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground truncate">{task.title}</h4>
                          <p className="text-xs text-muted-foreground">₦{task.budget?.toLocaleString()} • {task.location}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                        task.status === 'open' ? 'bg-green-500/10 text-green-700' :
                        task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-700' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {task.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Briefcase className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No tasks yet</p>
                <Link to="/tasks/create" className="text-primary text-sm hover:underline mt-1 inline-block">
                  Create your first task
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Active Campaigns
            </CardTitle>
            <Link to="/campaigns">
              <Button variant="ghost" size="sm" className="text-primary text-xs gap-1 h-8">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length > 0 ? (
              <div className="space-y-3">
                {recentCampaigns.slice(0, 4).map((campaign: Campaign) => {
                  const progress = campaign.target_amount > 0 
                    ? (campaign.raised_amount / campaign.target_amount) * 100 
                    : 0
                  return (
                    <Link to={`/campaigns/${campaign.id}`} key={campaign.id}>
                      <div className="p-2 rounded-lg hover:bg-muted/30 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm text-foreground truncate flex-1">{campaign.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${
                            campaign.status === 'active' ? 'bg-green-500/10 text-green-700' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              ₦{campaign.raised_amount?.toLocaleString() || 0} raised
                            </span>
                            <span className="text-muted-foreground">
                              ₦{campaign.target_amount?.toLocaleString() || 0} target
                            </span>
                          </div>
                          <Progress value={progress} className="h-1" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Target className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No campaigns yet</p>
                <Link to="/campaigns/create" className="text-primary text-sm hover:underline mt-1 inline-block">
                  Start your first campaign
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link to="/tasks/create">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                <Briefcase className="mr-1 h-3 w-3" />
                Post a Task
              </Button>
            </Link>
            <Link to="/campaigns/create">
              <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Target className="mr-1 h-3 w-3" />
                Start Campaign
              </Button>
            </Link>
            <Link to="/wallet">
              <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Wallet className="mr-1 h-3 w-3" />
                View Wallet
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard