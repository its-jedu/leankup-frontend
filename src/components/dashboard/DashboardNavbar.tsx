import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { Moon, Sun, Menu, Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface DashboardNavbarProps {
  onMenuClick: () => void
}

const DashboardNavbar = ({ onMenuClick }: DashboardNavbarProps) => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

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

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>

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