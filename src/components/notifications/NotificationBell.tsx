import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, CheckCheck, Wallet, UserCheck, MessageSquare, CheckCircle } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { showToast } from '@/lib/toast'

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

const NotificationBell = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  // Fetch recent notifications
  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['recent-notifications'],
    queryFn: async () => {
      const response = await axiosInstance.get('/notifications/recent/')
      return response.data
    },
    refetchInterval: 30000,
  })

  // Fetch unread count
  const { data: unreadCount = { unread_count: 0 } } = useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: async () => {
      const response = await axiosInstance.get('/notifications/unread_count/')
      return response.data
    },
    refetchInterval: 30000,
  })

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      axiosInstance.post(`/notifications/${notificationId}/mark_read/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] })
    },
  })

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => axiosInstance.post('/notifications/mark_all_read/'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] })
      showToast.success('All notifications marked as read')
    },
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <UserCheck className="h-4 w-4 text-blue-500" />
      case 'application_accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'payment_released':
        return <Wallet className="h-4 w-4 text-green-500" />
      case 'message':
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-amber-500" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id)
    }
    
    setOpen(false)
    
    // Navigate based on notification type
    if (notification.notification_type === 'payment_released') {
      navigate('/wallet')
      showToast.success('Payment Received!', {
        description: 'Funds have been added to your wallet.'
      })
    } else if (notification.task) {
      navigate(`/tasks/${notification.task}`)
    } else if (notification.application) {
      navigate(`/tasks/applications/${notification.application}`)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
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
                className={`cursor-pointer p-3 flex items-start gap-3 ${
                  !notification.is_read ? 'bg-primary/5' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="mt-0.5">
                  {getNotificationIcon(notification.notification_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-foreground truncate">
                      {notification.title}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {notification.message}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild className="cursor-pointer justify-center">
          <Button 
            variant="ghost" 
            className="w-full text-primary text-sm"
            onClick={() => {
              setOpen(false)
              navigate('/notifications')
            }}
          >
            View all notifications
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationBell