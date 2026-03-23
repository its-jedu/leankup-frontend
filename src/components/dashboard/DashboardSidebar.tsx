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
  const { logout } = useAuth()

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