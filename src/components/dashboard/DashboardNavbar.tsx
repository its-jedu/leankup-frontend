import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Moon, Sun, Bell, CheckCheck, Menu, LogOut, Settings, Wallet, Briefcase, Target, Users } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

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
  const queryClient = useQueryClient()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const { data: notifications = [] } = useQuery({
    queryKey: ['recent-notifications'],
    queryFn: async () => {
      const response = await axiosInstance.get('/tasks/notifications/recent/')
      return response.data
    },
    refetchInterval: 30000,
  })

  const { data: unreadCount = { unread_count: 0 } } = useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: async () => {
      const response = await axiosInstance.get('/tasks/notifications/unread_count/')
      return response.data
    },
    refetchInterval: 30000,
  })

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      axiosInstance.post(`/tasks/notifications/${notificationId}/mark_read/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => axiosInstance.post('/tasks/notifications/mark_all_read/'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] })
    },
  })

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id)
    }
    if (notification.task) {
      window.location.href = `/tasks/${notification.task}`
    }
  }

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return user?.username?.slice(0, 2).toUpperCase() || 'U'
  }

  return (
    <nav className={cn(
      "sticky top-0 z-40 transition-all duration-300 bg-background border-b border-border",
      isScrolled && "shadow-sm"
    )}>
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left Section - Menu Button and Logo */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuClick} 
            className="md:hidden rounded-full hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LeankUp
            </span>
          </Link>
        </div>

        {/* Center Section - Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/tasks" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
            Browse Tasks
          </Link>
          <Link to="/campaigns" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
            Browse Campaigns
          </Link>
          <Link to="/community" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
            Community
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full hover:bg-muted"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {/* Notification Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted">
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
            <DropdownMenuContent align="end" className="w-96 bg-popover border-border shadow-xl rounded-xl p-0">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <DropdownMenuLabel className="p-0 text-base font-semibold text-foreground">Notifications</DropdownMenuLabel>
                {unreadCount.unread_count > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs text-primary"
                    onClick={() => markAllAsReadMutation.mutate()}
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>
              
              <ScrollArea className="h-[400px]">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification: Notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                        "cursor-pointer p-4 flex flex-col items-start gap-1 border-b border-border last:border-0",
                        !notification.is_read && "bg-primary/5"
                      )}
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
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                      )}
                    </DropdownMenuItem>
                  ))
                )}
              </ScrollArea>
              
              <div className="p-3 border-t border-border">
                <Link to="/notifications" className="block text-center text-sm text-primary hover:underline">
                  View all notifications
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ml-1 hover:bg-muted">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-popover border-border shadow-xl rounded-xl p-2">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
              </div>
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg mt-1">
                <Link to="/dashboard/profile" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Settings className="h-4 w-4" />
                  </div>
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                <Link to="/wallet" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <span>Wallet</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border my-2" />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg">
                <div className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

export default DashboardNavbar