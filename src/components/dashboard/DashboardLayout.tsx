import { Outlet } from 'react-router-dom'
import DashboardNavbar from './DashboardNavbar'
import DashboardSidebar from './DashboardSidebar'
import { useState } from 'react'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 md:p-6 ml-0 md:ml-64 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout