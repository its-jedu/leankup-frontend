import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
import { Moon, Sun, Menu } from 'lucide-react'
import { useState } from 'react'

const Navbar = () => {
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-[#062147]/80 border-b border-gray-200 dark:border-gray-700">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#032b5f] dark:text-[#FBBF24]">
              LeankUp
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition-colors">How It Works</a>
            <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition-colors">Testimonials</a>
            
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full text-gray-600 dark:text-gray-300">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-[#032b5f] dark:hover:text-[#FBBF24]">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#032b5f] dark:bg-[#FBBF24] hover:bg-[#1e4a76] dark:hover:bg-[#fcd34d] text-white dark:text-[#062147]">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-gray-600 dark:text-gray-300">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 dark:text-gray-300">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition-colors px-2">Features</a>
              <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition-colors px-2">How It Works</a>
              <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition-colors px-2">Testimonials</a>
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" className="w-full">
                  <Button variant="outline" className="w-full border-[#032b5f] dark:border-[#FBBF24] text-[#032b5f] dark:text-[#FBBF24]">Login</Button>
                </Link>
                <Link to="/register" className="w-full">
                  <Button className="w-full bg-[#032b5f] dark:bg-[#FBBF24] hover:bg-[#1e4a76] dark:hover:bg-[#fcd34d] text-white dark:text-[#062147]">
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