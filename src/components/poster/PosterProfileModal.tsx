import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Briefcase, Star, CheckCircle, Clock } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { Link } from 'react-router-dom'

interface PosterProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: number
  username: string
}

interface UserStatsData {
  totalTasks: number
  completedTasks: number
  totalCampaigns: number
  successRate: number
  responseRate: number
  joinDate: string
  recentTasks: any[]
}

const PosterProfileModal = ({ open, onOpenChange, userId, username }: PosterProfileModalProps) => {
  // Fetch user stats
  const { data: userStats, isLoading } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      const [tasksRes, campaignsRes] = await Promise.all([
        axiosInstance.get('/tasks/', { params: { creator: userId } }),
        axiosInstance.get('/campaigns/', { params: { creator: userId } })
      ])
      
      const tasks = tasksRes.data?.results || tasksRes.data || []
      const campaigns = campaignsRes.data?.results || campaignsRes.data || []
      const completedTasks = tasks.filter((t: any) => t.status === 'completed').length
      
      return {
        totalTasks: tasks.length,
        completedTasks,
        totalCampaigns: campaigns.length,
        successRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
        responseRate: 95, // This would come from backend in real implementation
        joinDate: '2024-01-15',
        recentTasks: tasks.slice(0, 3),
      }
    },
    enabled: open,
  })

  const getInitials = () => {
    return username?.slice(0, 2).toUpperCase() || 'U'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Profile: {username}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground">{username}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {new Date(userStats?.joinDate || '').getFullYear()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span>{userStats?.totalTasks || 0} tasks posted</span>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border-border">
                <CardContent className="p-3 text-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{userStats?.completedTasks || 0}</p>
                  <p className="text-xs text-muted-foreground">Tasks Completed</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-3 text-center">
                  <Star className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{userStats?.successRate || 0}%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-3 text-center">
                  <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{userStats?.responseRate || 0}%</p>
                  <p className="text-xs text-muted-foreground">Response Rate</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-3 text-center">
                  <Briefcase className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{userStats?.totalCampaigns || 0}</p>
                  <p className="text-xs text-muted-foreground">Campaigns</p>
                </CardContent>
              </Card>
            </div>

            {/* Trust Indicator */}
            <div className="p-3 bg-green-500/10 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">Reliability Score</span>
                <span className="text-sm font-bold text-green-600">{userStats?.successRate || 0}%</span>
              </div>
              <Progress value={userStats?.successRate || 0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Based on completed tasks and positive feedback
              </p>
            </div>

            {/* Recent Tasks */}
            {userStats?.recentTasks && userStats.recentTasks.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-3">Recent Tasks</h4>
                <div className="space-y-2">
                  {userStats.recentTasks.map((task: any) => (
                    <Link to={`/tasks/${task.id}`} key={task.id}>
                      <div className="p-3 border border-border rounded-lg hover:bg-muted/30 transition">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground text-sm">{task.title}</span>
                          <Badge variant="outline" className={task.status === 'completed' ? 'bg-green-500/10 text-green-700' : 'bg-blue-500/10 text-blue-700'}>
                            {task.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">₦{task.budget} • {task.location}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PosterProfileModal