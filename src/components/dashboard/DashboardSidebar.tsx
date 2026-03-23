import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Briefcase, 
  Target, 
  Wallet,
  Users,
  Settings,
  HelpCircle,
  X,
  LogOut,
  TrendingUp,
  Clock,
  Award,
  Star,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { useState, useEffect } from 'react'

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
  { name: 'My Tasks', path: '/my-tasks', icon: Briefcase, color: 'from-green-500 to-green-600' },
  { name: 'Browse Tasks', path: '/tasks', icon: TrendingUp, color: 'from-cyan-500 to-cyan-600' },
  { name: 'My Campaigns', path: '/my-campaigns', icon: Target, color: 'from-orange-500 to-orange-600' },
  { name: 'Explore Campaigns', path: '/campaigns', icon: Sparkles, color: 'from-purple-500 to-purple-600' },
  { name: 'Wallet', path: '/wallet', icon: Wallet, color: 'from-yellow-500 to-yellow-600' },
  { name: 'Community', path: '/community', icon: Users, color: 'from-pink-500 to-pink-600' },
]

const bottomNavItems = [
  { name: 'Settings', path: '/settings', icon: Settings, color: 'from-gray-500 to-gray-600' },
  { name: 'Help & Support', path: '/help', icon: HelpCircle, color: 'from-gray-500 to-gray-600' },
]

const DashboardSidebar = ({ isOpen, onClose }: DashboardSidebarProps) => {
  const location = useLocation()
  const { logout, user } = useAuth()
  const [userStats, setUserStats] = useState({ tasksCompleted: 0, rating: 0, responseRate: 0 })

  // Fetch user stats
  const { data: profileData } = useQuery({
    queryKey: ['user-profile-stats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/users/me/stats/')
      return response.data
    },
    enabled: !!user,
  })

  useEffect(() => {
    if (profileData) {
      setUserStats({
        tasksCompleted: profileData.total_tasks_completed || 0,
        rating: profileData.rating || 0,
        responseRate: profileData.response_rate || 0,
      })
    }
  }, [profileData])

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return user?.username?.slice(0, 2).toUpperCase() || 'U'
  }

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gradient-to-b from-card to-background border-r border-border">
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between border-b border-border">
        <Link to="/dashboard" className="flex items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-xl opacity-30"></div>
            <span className="relative text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LeankUp
            </span>
          </div>
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden rounded-full hover:bg-muted">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* User Profile Card */}
      <div className="p-4 mx-3 mt-4 rounded-xl bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">{getInitials()}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-primary/20">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{userStats.tasksCompleted}</p>
            <p className="text-xs text-muted-foreground">Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{userStats.rating || '4.8'}</p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{userStats.responseRate || '92'}%</p>
            <p className="text-xs text-muted-foreground">Response</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || 
                          location.pathname.startsWith(item.path + '/')
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) onClose()
              }}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden",
                isActive 
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {/* Animated background on hover */}
              {!isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                  animate={false}
                />
              )}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                isActive ? "bg-white/20" : "bg-muted group-hover:bg-muted-foreground/10"
              )}>
                <Icon className={cn(
                  "h-4 w-4 transition-all duration-300",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )} />
              </div>
              <span className="font-medium text-sm">{item.name}</span>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-border">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) onClose()
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 mb-1",
                isActive 
                  ? "bg-gradient-to-r from-primary to-accent text-white" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isActive ? "bg-white/20" : "bg-muted"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          )
        })}
        
        {/* Logout Button */}
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl mt-2"
          onClick={logout}
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="font-medium text-sm">Logout</span>
        </Button>
      </div>

      {/* Footer Badge */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Award className="h-3 w-3" />
          <span>Trusted by 500+ users</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-80 fixed left-0 top-0 bottom-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default DashboardSidebar