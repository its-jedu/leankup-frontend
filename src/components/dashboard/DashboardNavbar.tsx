import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Moon, Sun, Menu, Bell, CheckCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import axiosInstance from '@/lib/axios'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: number
  title: string
  message: string
  notification_type: string
  is_read: boolean
  created_at: string
  task?: number
  application?: number
}

interface DashboardNavbarProps {
  onMenuClick: () => void
}

const DashboardNavbar = ({ onMenuClick }: DashboardNavbarProps) => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch recent notifications - FIXED: Use /tasks/notifications/recent/
  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ['recent-notifications'],
    queryFn: async () => {
      const response = await axiosInstance.get('/tasks/notifications/recent/')
      return response.data
    },
    refetchInterval: 30000,
  })

  // Fetch unread count - FIXED: Use /tasks/notifications/unread_count/
  const { data: unreadCount = { unread_count: 0 } } = useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: async () => {
      const response = await axiosInstance.get('/tasks/notifications/unread_count/')
      return response.data
    },
    refetchInterval: 30000,
  })

  // Mark notification as read - FIXED: Use /tasks/notifications/
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      axiosInstance.post(`/tasks/notifications/${notificationId}/mark_read/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] })
    },
  })

  // Mark all as read - FIXED: Use /tasks/notifications/
  const markAllAsReadMutation = useMutation({
    mutationFn: () => axiosInstance.post('/tasks/notifications/mark_all_read/'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] })
    },
  })

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id)
    }
    
    // Navigate based on notification type
    if (notification.task) {
      if (notification.notification_type === 'application') {
        navigate(`/tasks/${notification.task}/applications`)
      } else {
        navigate(`/tasks/${notification.task}`)
      }
    } else if (notification.application) {
      navigate(`/tasks/applications/${notification.application}`)
    }
  }

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return user?.username?.slice(0, 2).toUpperCase() || 'U'
  }

  return (
    <nav className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuClick} 
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/dashboard">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LeankUp
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {/* Notification Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount.unread_count > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
                  >
                    {unreadCount.unread_count > 9 ? '9+' : unreadCount.unread_count}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 bg-card border-border shadow-lg">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount.unread_count > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => markAllAsReadMutation.mutate()}
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all as read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              
              <ScrollArea className="h-[400px]">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification: Notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`cursor-pointer p-3 flex flex-col items-start gap-1 ${
                        !notification.is_read ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-sm text-foreground">
                          {notification.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                      )}
                    </DropdownMenuItem>
                  ))
                )}
              </ScrollArea>
              
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild className="cursor-pointer justify-center">
                <Link to="/notifications" className="text-center text-primary text-sm">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ml-1">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-lg">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-foreground">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild className="cursor-pointer text-foreground hover:bg-muted">
                <Link to="/dashboard/profile">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive hover:bg-destructive/10">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

export default DashboardNavbar