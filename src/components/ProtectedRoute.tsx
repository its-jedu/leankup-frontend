import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ProtectedRoute = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f6fa] dark:bg-[#062147]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032b5f] dark:border-[#FBBF24]"></div>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" />
}

export default ProtectedRoute