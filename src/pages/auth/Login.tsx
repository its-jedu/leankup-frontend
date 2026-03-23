import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { Mail, Lock, ArrowRight, Eye, EyeOff, LogIn, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import Navbar from '../landing-page/layout/Navbar'
import Footer from '../landing-page/layout/Footer'

const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

const Login = () => {
  const { login, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    await login({
      username: data.username,
      password: data.password
    })
  }

  const features = [
    "Access your dashboard",
    "Manage your tasks and campaigns",
    "Track your earnings and contributions"
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f6fa] dark:bg-[#062147]">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-8 sm:py-12 md:py-16 px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Brand Message - Hidden on mobile, visible on tablet and above */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden md:block"
            >
              <div className="space-y-6 lg:space-y-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex"
                >
                </motion.div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="text-[#032b5f] dark:text-white">Welcome back to</span>
                  <br />
                  <span className="bg-gradient-to-r from-[#032b5f] to-[#1e4a76] dark:from-[#FBBF24] dark:to-[#fcd34d] bg-clip-text text-transparent">
                    LeankUp
                  </span>
                </h1>
                
                <p className="text-base lg:text-lg text-gray-600 dark:text-gray-300">
                  Continue your journey of connecting with local talent, completing tasks, and making a difference in your community.
                </p>
                
                <div className="space-y-3 lg:space-y-4 pt-2 lg:pt-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#032b5f]/10 dark:bg-[#FBBF24]/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#032b5f] dark:text-[#FBBF24]" />
                      </div>
                      <span className="text-sm lg:text-base text-gray-600 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Login Form - Full width on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-md mx-auto lg:max-w-none lg:mx-0"
            >
              <Card className="shadow-2xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-[#0a2a1a]/95 backdrop-blur-sm">
                <CardHeader className="text-center space-y-2 pb-4 sm:pb-6">
                  {/* Mobile-only icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="md:hidden"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-[#032b5f] to-[#1e4a76] dark:from-[#FBBF24] dark:to-[#fcd34d] rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg">
                      <LogIn className="h-7 w-7 text-white dark:text-[#062147]" />
                    </div>
                  </motion.div>
                  
                  <CardTitle className="text-xl sm:text-2xl font-bold">
                    <span className="bg-gradient-to-r from-[#032b5f] to-[#1e4a76] dark:from-[#FBBF24] dark:to-[#fcd34d] bg-clip-text text-transparent">
                      Sign In
                    </span>
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 sm:space-y-5">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                    {/* Username/Email Field */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-medium text-[#032b5f] dark:text-white">Username or Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#032b5f] dark:group-focus-within:text-[#FBBF24] transition-colors" />
                        <Input
                          {...register('username')}
                          placeholder="johndoe or john@example.com"
                          className="pl-10 h-10 sm:h-11 bg-white dark:bg-[#062147] border-gray-200 dark:border-gray-700 focus:border-[#032b5f] dark:focus:border-[#FBBF24] transition-all duration-300 text-sm sm:text-base"
                          disabled={loading}
                          autoComplete="username"
                        />
                      </div>
                      {errors.username && (
                        <p className="text-xs sm:text-sm text-red-500 dark:text-red-400">
                          {errors.username.message}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-[#032b5f] dark:text-white">Password</label>
                        <Link 
                          to="/forgot-password" 
                          className="text-xs text-[#032b5f] dark:text-[#FBBF24] hover:text-[#1e4a76] dark:hover:text-[#fcd34d] hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#032b5f] dark:group-focus-within:text-[#FBBF24] transition-colors" />
                        <Input
                          {...register('password')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-10 sm:h-11 bg-white dark:bg-[#062147] border-gray-200 dark:border-gray-700 focus:border-[#032b5f] dark:focus:border-[#FBBF24] transition-all duration-300 text-sm sm:text-base"
                          disabled={loading}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs sm:text-sm text-red-500 dark:text-red-400">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full h-10 sm:h-11 bg-gradient-to-r from-[#032b5f] to-[#1e4a76] dark:from-[#FBBF24] dark:to-[#fcd34d] hover:from-[#1e4a76] hover:to-[#032b5f] dark:hover:from-[#fcd34d] dark:hover:to-[#FBBF24] text-white dark:text-[#062147] font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-[#062147]"></div>
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    {/* Divider */}
                    <div className="relative my-4 sm:my-5">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-2 bg-white dark:bg-[#0a2a1a] text-gray-500 dark:text-gray-400">
                          New to LeankUp?
                        </span>
                      </div>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center">
                      <Link 
                        to="/register" 
                        className="text-[#032b5f] dark:text-[#FBBF24] hover:text-[#1e4a76] dark:hover:text-[#fcd34d] font-medium hover:underline transition-all inline-flex items-center gap-1 text-sm"
                      >
                        Create an account
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Login