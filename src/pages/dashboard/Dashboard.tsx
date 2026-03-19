import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import axiosInstance from '@/lib/axios'
import { Briefcase, Target, Wallet, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Task, Campaign } from '@/types'

interface DashboardStats {
  totalTasks: number
  activeTasks: number
  totalCampaigns: number
  activeCampaigns: number
  walletBalance: number
}

const Dashboard = () => {
  const { user } = useAuth()

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      try {
        const [tasksRes, campaignsRes, walletRes] = await Promise.all([
          axiosInstance.get('/tasks/', { params: { creator: user?.id } }),
          axiosInstance.get('/campaigns/', { params: { creator: user?.id } }),
          axiosInstance.get('/wallet/balance/'),
        ])

        // Handle different response structures
        const tasks = tasksRes.data?.results || tasksRes.data || []
        const campaigns = campaignsRes.data?.results || campaignsRes.data || []
        const walletBalance = walletRes.data?.balance || walletRes.data || 0

        return {
          totalTasks: Array.isArray(tasks) ? tasks.length : 0,
          activeTasks: Array.isArray(tasks) 
            ? tasks.filter((t: Task) => t.status === 'open').length 
            : 0,
          totalCampaigns: Array.isArray(campaigns) ? campaigns.length : 0,
          activeCampaigns: Array.isArray(campaigns)
            ? campaigns.filter((c: Campaign) => c.status === 'active').length
            : 0,
          walletBalance: typeof walletBalance === 'number' ? walletBalance : 0,
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return {
          totalTasks: 0,
          activeTasks: 0,
          totalCampaigns: 0,
          activeCampaigns: 0,
          walletBalance: 0,
        }
      }
    },
    enabled: !!user,
  })

  // Fetch recent tasks
  const { data: recentTasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['recent-tasks'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/tasks/', {
          params: { ordering: '-created_at', limit: 5 }
        })
        // Handle paginated or direct response
        return response.data?.results || response.data || []
      } catch (error) {
        console.error('Error fetching recent tasks:', error)
        return []
      }
    },
  })

  // Fetch recent campaigns
  const { data: recentCampaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['recent-campaigns'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/campaigns/', {
          params: { ordering: '-created_at', limit: 5, status: 'active' }
        })
        // Handle paginated or direct response
        return response.data?.results || response.data || []
      } catch (error) {
        console.error('Error fetching recent campaigns:', error)
        return []
      }
    },
  })

  // Ensure we have arrays
  const recentTasks = Array.isArray(recentTasksData) ? recentTasksData : []
  const recentCampaigns = Array.isArray(recentCampaignsData) ? recentCampaignsData : []

  const summaryCards = [
    {
      title: 'Total Tasks',
      value: stats?.totalTasks || 0,
      icon: Briefcase,
      color: 'bg-blue-500',
      link: '/tasks',
    },
    {
      title: 'Active Campaigns',
      value: stats?.activeCampaigns || 0,
      icon: Target,
      color: 'bg-green-500',
      link: '/campaigns',
    },
    {
      title: 'Wallet Balance',
      value: `$${stats?.walletBalance?.toFixed(2) || '0.00'}`,
      icon: Wallet,
      color: 'bg-purple-500',
      link: '/wallet',
    },
    {
      title: 'Completion Rate',
      value: '85%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      link: '#',
    },
  ]

  const isLoading = statsLoading || tasksLoading || campaignsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username || 'User'}! 👋</h1>
        <p className="text-muted-foreground">Here's what's happening with your account today.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => (
          <Link to={card.link} key={index}>
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.color} p-3 rounded-xl text-white`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm text-muted-foreground">This month</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{card.value}</h3>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Tasks and Campaigns */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Tasks */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Recent Tasks</CardTitle>
            <Link to="/tasks">
              <Button variant="ghost" size="sm" className="text-primary">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.slice(0, 5).map((task: Task) => (
                  <Link to={`/tasks/${task.id}`} key={task.id}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition cursor-pointer border border-border">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          task.status === 'open' ? 'bg-green-500/10' :
                          task.status === 'in_progress' ? 'bg-blue-500/10' : 'bg-muted'
                        }`}>
                          {task.status === 'open' ? 
                            <Clock className="h-4 w-4 text-green-600" /> :
                          task.status === 'in_progress' ? 
                            <TrendingUp className="h-4 w-4 text-blue-600" /> :
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${task.budget} • {task.location}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.status === 'open' ? 'bg-green-500/10 text-green-700' :
                        task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-700' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tasks yet</p>
                <Link to="/tasks/create" className="text-primary hover:underline text-sm mt-2 inline-block">
                  Create your first task
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Active Campaigns</CardTitle>
            <Link to="/campaigns">
              <Button variant="ghost" size="sm" className="text-primary">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length > 0 ? (
              <div className="space-y-4">
                {recentCampaigns.slice(0, 5).map((campaign: Campaign) => {
                  const progress = (campaign.raised_amount / campaign.target_amount) * 100
                  return (
                    <Link to={`/campaigns/${campaign.id}`} key={campaign.id}>
                      <div className="p-3 rounded-lg hover:bg-muted/50 transition cursor-pointer border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{campaign.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            campaign.status === 'active' ? 'bg-green-500/10 text-green-700' :
                            campaign.status === 'draft' ? 'bg-muted text-muted-foreground' :
                            'bg-yellow-500/10 text-yellow-700'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              ${campaign.raised_amount?.toLocaleString()} raised
                            </span>
                            <span className="text-muted-foreground">
                              ${campaign.target_amount?.toLocaleString()} target
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No campaigns yet</p>
                <Link to="/campaigns/create" className="text-primary hover:underline text-sm mt-2 inline-block">
                  Start your first campaign
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link to="/tasks/create">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Briefcase className="mr-2 h-4 w-4" />
                Post a Task
              </Button>
            </Link>
            <Link to="/campaigns/create">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Target className="mr-2 h-4 w-4" />
                Start Campaign
              </Button>
            </Link>
            <Link to="/wallet">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Wallet className="mr-2 h-4 w-4" />
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