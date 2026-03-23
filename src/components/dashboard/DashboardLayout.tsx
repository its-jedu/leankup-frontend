import { Outlet } from 'react-router-dom'
import DashboardNavbar from './DashboardNavbar'
import DashboardSidebar from './DashboardSidebar'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// import { Menu } from 'lucide-react'
// import { Button } from '@/components/ui/button'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setMobileSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar onMenuClick={() => setMobileSidebarOpen(true)} />
      <div className="flex">
        {/* Desktop Sidebar with Collapse */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 280 : 80 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="hidden md:block fixed left-0 top-16 bottom-0 z-30 bg-card border-r border-border overflow-hidden"
        >
          <DashboardSidebar 
            isCollapsed={!sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </motion.aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              />
              <motion.aside
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-80 z-50 shadow-2xl bg-card"
              >
                <DashboardSidebar 
                  isCollapsed={false} 
                  onToggle={() => {}}
                  isMobile={true}
                  onClose={() => setMobileSidebarOpen(false)}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main 
          className="flex-1 transition-all duration-300"
          style={{
            marginLeft: !isMobile && sidebarOpen ? '280px' : !isMobile ? '80px' : '0px'
          }}
        >
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout