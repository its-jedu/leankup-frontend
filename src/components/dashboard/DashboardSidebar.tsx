import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Briefcase, 
  Target, 
  Wallet,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface DashboardSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  isMobile?: boolean
  onClose?: () => void
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Browse Tasks', path: '/tasks', icon: Briefcase },
  { name: 'Browse Campaigns', path: '/campaigns', icon: Target },
  { name: 'My Tasks', path: '/my-tasks', icon: TrendingUp },
  { name: 'My Campaigns', path: '/my-campaigns', icon: Target },
  { name: 'Wallet', path: '/wallet', icon: Wallet },
  { name: 'Community', path: '/community', icon: Users },
]

const bottomNavItems = [
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Help & Support', path: '/help', icon: HelpCircle },
]

const DashboardSidebar = ({ isCollapsed, onToggle, isMobile, onClose }: DashboardSidebarProps) => {
  const location = useLocation()
  const { logout, user } = useAuth()

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return user?.username?.slice(0, 2).toUpperCase() || 'U'
  }

  const SidebarLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
    const Icon = item.icon

    const linkContent = (
      <Link
        to={item.path}
        onClick={() => {
          if (isMobile && onClose) onClose()
        }}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300",
          isActive 
            ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-white")} />
        {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
      </Link>
    )

    if (isCollapsed && !isMobile) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              {linkContent}
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground">
              {item.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return linkContent
  }

  const sidebarContent = (
    <div className="h-full flex flex-col bg-card">
      {/* Header with Logo and Toggle */}
      <div className={cn(
        "h-16 flex items-center border-b border-border px-4",
        isCollapsed && !isMobile ? "justify-center" : "justify-between"
      )}>
        {(!isCollapsed || isMobile) && (
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LeankUp
            </span>
          </Link>
        )}
        {isMobile ? (
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className="rounded-full hover:bg-muted"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* User Profile */}
      {(!isCollapsed || isMobile) && (
        <div className="p-4 mx-3 mt-4 rounded-xl bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">{getInitials()}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <SidebarLink key={item.path} item={item} />
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-border space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          
          const linkContent = (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                if (isMobile && onClose) onClose()
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-gradient-to-r from-primary to-accent text-white" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {(!isCollapsed || isMobile) && <span className="font-medium text-sm">{item.name}</span>}
            </Link>
          )
          
          if (isCollapsed && !isMobile) {
            return (
              <TooltipProvider key={item.path} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          }
          
          return linkContent
        })}
        
        {/* Logout Button */}
        {(() => {
          const logoutButton = (
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl",
                isCollapsed && !isMobile && "justify-center px-2"
              )}
              onClick={logout}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {(!isCollapsed || isMobile) && <span className="font-medium text-sm">Logout</span>}
            </Button>
          )
          
          if (isCollapsed && !isMobile) {
            return (
              <TooltipProvider key="logout" delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {logoutButton}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground">
                    Logout
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          }
          
          return logoutButton
        })()}
      </div>
    </div>
  )

  return sidebarContent
}

export default DashboardSidebar