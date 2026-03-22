import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './context/ThemeContext'
import LandingPage from './pages/landing-page/LandingPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import MyTasks from './pages/tasks/MyTasks'
import Tasks from './pages/tasks/Tasks'
import EditTask from './pages/tasks/EditTask'
import TaskDetail from './pages/tasks/TaskDetail'
import CreateTask from './pages/tasks/CreateTask'
import Campaigns from './pages/campaigns/Campaigns'
import CampaignDetail from './pages/campaigns/CampaignDetail'
import CreateCampaign from './pages/campaigns/CreateCampaign'
import Wallet from './pages/wallet/Wallet'
import FundWallet from './pages/wallet/FundWallet'
import Community from './pages/community/Community'
import Settings from './pages/settings/Settings'
import Help from './pages/help/Help'
import DashboardLayout from './components/dashboard/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

function AppContent() {
  const { loading } = useAuth()
  const { theme } = useTheme()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <Routes>
        {/* Public routes with landing page layout */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes with dashboard layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/tasks/create" element={<CreateTask />} />
            <Route path="/tasks/:id/edit" element={<EditTask />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/campaigns/create" element={<CreateCampaign />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/wallet/fund" element={<FundWallet />} />
            <Route path="/community" element={<Community />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={2000}
        theme={theme === 'dark' ? 'dark' : 'light'}
        toastOptions={{
          style: {
            background: theme === 'dark' ? 'hsl(var(--card))' : 'white',
            color: theme === 'dark' ? 'hsl(var(--card-foreground))' : 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}

export default App