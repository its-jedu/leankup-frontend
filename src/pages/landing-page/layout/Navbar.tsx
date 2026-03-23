import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
import { Moon, Sun, Menu, Home } from 'lucide-react'
import { useState } from 'react'

const Navbar = () => {
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  
  // Check if we're on the landing page to determine if we should use anchor links
  const isLandingPage = location.pathname === '/'
  
  // Navigation items configuration
  const navItems = [
    { name: 'Home', path: '/', isLink: true, icon: Home },
    { name: 'Features', href: '#features', isLink: false },
    { name: 'How It Works', href: '#how-it-works', isLink: false },
    { name: 'Testimonials', href: '#testimonials', isLink: false },
  ]

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isLandingPage) {
      e.preventDefault()
      window.location.href = `/${href}`
    }
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-[#062147]/80 border-b border-gray-200 dark:border-gray-700">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-[#032b5f] dark:text-[#FBBF24]">
              LeankUp
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item, index) => {
              if (item.isLink) {
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition-colors"
                  >
                    {item.icon && <Home className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </Link>
                )
              }
              return (
                <a
                  key={index}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href!)}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition-colors"
                >
                  {item.name}
                </a>
              )
            })}
            
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button 
                  variant="ghost" 
                  className="text-gray-600 dark:text-gray-300 hover:text-[#032b5f] dark:hover:text-[#FBBF24] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#032b5f] dark:bg-[#FBBF24] hover:bg-[#1e4a76] dark:hover:bg-[#fcd34d] text-white dark:text-[#062147] transition-all shadow-md hover:shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-slide-down">
            <div className="flex flex-col gap-3">
              {navItems.map((item, index) => {
                if (item.isLink) {
                  return (
                    <Link
                      key={index}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition-colors px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {item.icon && <Home className="h-4 w-4" />}
                      <span>{item.name}</span>
                    </Link>
                  )
                }
                return (
                  <a
                    key={index}
                    href={item.href}
                    onClick={(e) => {
                      setIsMenuOpen(false)
                      handleNavClick(e, item.href!)
                    }}
                    className="text-gray-600 dark:text-gray-300 hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition-colors px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {item.name}
                  </a>
                )
              })}
              
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-[#032b5f] dark:border-[#FBBF24] text-[#032b5f] dark:text-[#FBBF24] hover:bg-[#032b5f] hover:text-white dark:hover:bg-[#FBBF24] dark:hover:text-[#062147] transition-all">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-[#032b5f] dark:bg-[#FBBF24] hover:bg-[#1e4a76] dark:hover:bg-[#fcd34d] text-white dark:text-[#062147] transition-all">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar