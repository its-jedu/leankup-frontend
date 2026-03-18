import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Progress } from '../../components/ui/progress'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../hooks/useAuth'
import axiosInstance from '../../lib/axios'
import { Briefcase, Target, Wallet, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Task, Campaign } from '../../types'

interface DashboardStats {
  totalTasks: number
  activeTasks: number
  totalCampaigns: number
  activeCampaigns: number
  walletBalance: number
}

const Dashboard = () => {
  const { user } = useAuth()

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [tasks, campaigns, wallet] = await Promise.all([
        axiosInstance.get('/tasks/?creator=' + user?.id),
        axiosInstance.get('/campaigns/?creator=' + user?.id),
        axiosInstance.get('/wallet/balance/'),
      ])
      return {
        totalTasks: tasks.data.length,
        activeTasks: tasks.data.filter((t: Task) => t.status === 'open').length,
        totalCampaigns: campaigns.data.length,
        activeCampaigns: campaigns.data.filter((c: Campaign) => c.status === 'active').length,
        walletBalance: wallet.data.balance,
      }
    },
    enabled: !!user,
  })

  const { data: recentTasks } = useQuery<{ data: Task[] }>({
    queryKey: ['recent-tasks'],
    queryFn: () => axiosInstance.get('/tasks/?ordering=-created_at&limit=5'),
  })

  const { data: recentCampaigns } = useQuery<{ data: Campaign[] }>({
    queryKey: ['recent-campaigns'],
    queryFn: () => axiosInstance.get('/campaigns/?ordering=-created_at&limit=5'),
  })

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

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}! 👋</h1>
        <p className="text-gray-600">Here's what's happening with your account today.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => (
          <Link to={card.link} key={index}>
            <Card className="hover-scale cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.color} p-3 rounded-xl text-white`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm text-gray-500">This month</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{card.value}</h3>
                  <p className="text-sm text-gray-600">{card.title}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Tasks and Campaigns */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Tasks</CardTitle>
            <Link to="/tasks">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks?.data?.slice(0, 5).map((task) => (
                <Link to={`/tasks/${task.id}`} key={task.id}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        task.status === 'open' ? 'bg-green-100' :
                        task.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {task.status === 'open' ? <Clock className="h-4 w-4 text-green-600" /> :
                         task.status === 'in_progress' ? <TrendingUp className="h-4 w-4 text-blue-600" /> :
                         <CheckCircle className="h-4 w-4 text-gray-600" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-gray-500">${task.budget} • {task.location}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'open' ? 'bg-green-100 text-green-700' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Campaigns</CardTitle>
            <Link to="/campaigns">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCampaigns?.data?.slice(0, 5).map((campaign) => (
                <Link to={`/campaigns/${campaign.id}`} key={campaign.id}>
                  <div className="p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{campaign.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Progress value={(campaign.raised_amount / campaign.target_amount) * 100} />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">${campaign.raised_amount} raised</span>
                        <span className="text-gray-600">${campaign.target_amount} target</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link to="/tasks/create">
              <Button className="bg-primary hover:bg-primary/90">
                <Briefcase className="mr-2 h-4 w-4" />
                Post a Task
              </Button>
            </Link>
            <Link to="/campaigns/create">
              <Button variant="secondary">
                <Target className="mr-2 h-4 w-4" />
                Start Campaign
              </Button>
            </Link>
            <Link to="/wallet/withdraw">
              <Button variant="outline">
                <Wallet className="mr-2 h-4 w-4" />
                Withdraw Funds
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard