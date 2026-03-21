import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, MessageSquare, Heart, Award, TrendingUp, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

const Community = () => {
  const stats = [
    { label: 'Active Members', value: '500+', icon: Users, color: 'bg-blue-500' },
    { label: 'Tasks Completed', value: '1.2k+', icon: Award, color: 'bg-green-500' },
    { label: 'Funds Raised', value: '₦450k+', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Communities', value: '50+', icon: Globe, color: 'bg-orange-500' },
  ]

  const activities = [
    {
      user: 'Sarah Johnson',
      action: 'completed a task',
      task: 'Website Development',
      time: '2 hours ago',
      avatar: 'SJ'
    },
    {
      user: 'Michael Chen',
      action: 'started a campaign',
      task: 'Community Garden Project',
      time: '5 hours ago',
      avatar: 'MC'
    },
    {
      user: 'Amara Okafor',
      action: 'posted a task',
      task: 'Need help with moving',
      time: '1 day ago',
      avatar: 'AO'
    },
    {
      user: 'David Williams',
      action: 'contributed to',
      task: 'Local School Fundraiser',
      time: '2 days ago',
      avatar: 'DW'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">Community</h1>
        <p className="text-muted-foreground">Connect with local members and grow together</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="border-border">
              <CardContent className="p-4 md:p-6">
                <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Community Feed */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition">
                <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">{activity.avatar}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{activity.user}</span>{' '}
                    {activity.action}{' '}
                    <span className="font-medium text-primary">{activity.task}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Join Community */}
      <Card className="border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
        <CardContent className="p-6 text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-semibold mb-2 text-foreground">Join Our Community</h3>
          <p className="text-muted-foreground mb-4">
            Connect with local members, share experiences, and grow together
          </p>
          <Button className="bg-primary hover:bg-primary/90">
            Join Discussion
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Community