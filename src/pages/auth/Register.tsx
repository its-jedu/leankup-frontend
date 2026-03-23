import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, UserCircle, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import Navbar from '../landing-page/layout/Navbar'
import Footer from '../landing-page/layout/Footer'

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters'),
  first_name: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(30, 'First name must not exceed 30 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  last_name: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(30, 'Last name must not exceed 30 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  password2: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.password2, {
  message: "Passwords don't match",
  path: ["password2"],
})

type RegisterFormData = z.infer<typeof registerSchema>

const Register = () => {
  const { register: registerUser, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    await registerUser(data)
  }

  const benefits = [
    "Post tasks and find local talent",
    "Launch fundraising campaigns",
    "Earn money and track your progress",
    "Secure escrow protection for all transactions"
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f6fa] dark:bg-[#062147]">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Column - Brand Message - Hidden on mobile, visible on tablet and above */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden md:block sticky top-24"
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
                  <span className="text-[#032b5f] dark:text-white">Join the</span>
                  <br />
                  <span className="bg-gradient-to-r from-[#032b5f] to-[#1e4a76] dark:from-[#FBBF24] dark:to-[#fcd34d] bg-clip-text text-transparent">
                    LeankUp Community
                  </span>
                </h1>
                
                <p className="text-base lg:text-lg text-gray-600 dark:text-gray-300">
                  Create your account today and start connecting with local talent, raising funds for your projects, and making a difference in your community.
                </p>
                
                <div className="space-y-3 lg:space-y-4 pt-2 lg:pt-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#032b5f]/10 dark:bg-[#FBBF24]/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#032b5f] dark:text-[#FBBF24]" />
                      </div>
                      <span className="text-sm lg:text-base text-gray-600 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Stats for tablet/desktop */}
                <div className="grid grid-cols-2 gap-3 lg:gap-4 pt-6 lg:pt-8">
                  <div className="bg-white dark:bg-[#0a2a1a] rounded-xl p-3 lg:p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-xl lg:text-2xl font-bold text-[#032b5f] dark:text-[#FBBF24]">500+</div>
                    <div className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">Active Users</div>
                  </div>
                  <div className="bg-white dark:bg-[#0a2a1a] rounded-xl p-3 lg:p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-xl lg:text-2xl font-bold text-[#032b5f] dark:text-[#FBBF24]">1.2k+</div>
                    <div className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">Tasks Posted</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Register Form - Full width on mobile */}
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
                      <UserCircle className="h-7 w-7 text-white dark:text-[#062147]" />
                    </div>
                  </motion.div>
                  
                  <CardTitle className="text-xl sm:text-2xl font-bold">
                    <span className="bg-gradient-to-r from-[#032b5f] to-[#1e4a76] dark:from-[#FBBF24] dark:to-[#fcd34d] bg-clip-text text-transparent">
                      Create Account
                    </span>
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Fill in your details to get started
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 sm:space-y-5">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                    {/* Username Field */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-medium text-[#032b5f] dark:text-white">Username</label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#032b5f] dark:group-focus-within:text-[#FBBF24] transition-colors" />
                        <Input
                          {...register('username')}
                          placeholder="johndoe123"
                          className="pl-10 h-10 sm:h-11 bg-white dark:bg-[#062147] border-gray-200 dark:border-gray-700 focus:border-[#032b5f] dark:focus:border-[#FBBF24] transition-all duration-300 text-sm sm:text-base"
                          disabled={loading}
                        />
                      </div>
                      {errors.username && (
                        <p className="text-xs sm:text-sm text-red-500 dark:text-red-400">
                          {errors.username.message}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-medium text-[#032b5f] dark:text-white">Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#032b5f] dark:group-focus-within:text-[#FBBF24] transition-colors" />
                        <Input
                          {...register('email')}
                          type="email"
                          placeholder="john@example.com"
                          className="pl-10 h-10 sm:h-11 bg-white dark:bg-[#062147] border-gray-200 dark:border-gray-700 focus:border-[#032b5f] dark:focus:border-[#FBBF24] transition-all duration-300 text-sm sm:text-base"
                          disabled={loading}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs sm:text-sm text-red-500 dark:text-red-400">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* First Name & Last Name Row */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-sm font-medium text-[#032b5f] dark:text-white">First Name</label>
                        <Input
                          {...register('first_name')}
                          placeholder="John"
                          className="h-10 sm:h-11 bg-white dark:bg-[#062147] border-gray-200 dark:border-gray-700 focus:border-[#032b5f] dark:focus:border-[#FBBF24] transition-all duration-300 text-sm sm:text-base"
                          disabled={loading}
                        />
                        {errors.first_name && (
                          <p className="text-xs sm:text-sm text-red-500 dark:text-red-400">
                            {errors.first_name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-sm font-medium text-[#032b5f] dark:text-white">Last Name</label>
                        <Input
                          {...register('last_name')}
                          placeholder="Doe"
                          className="h-10 sm:h-11 bg-white dark:bg-[#062147] border-gray-200 dark:border-gray-700 focus:border-[#032b5f] dark:focus:border-[#FBBF24] transition-all duration-300 text-sm sm:text-base"
                          disabled={loading}
                        />
                        {errors.last_name && (
                          <p className="text-xs sm:text-sm text-red-500 dark:text-red-400">
                            {errors.last_name.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-medium text-[#032b5f] dark:text-white">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#032b5f] dark:group-focus-within:text-[#FBBF24] transition-colors" />
                        <Input
                          {...register('password')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-10 sm:h-11 bg-white dark:bg-[#062147] border-gray-200 dark:border-gray-700 focus:border-[#032b5f] dark:focus:border-[#FBBF24] transition-all duration-300 text-sm sm:text-base"
                          disabled={loading}
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
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        Must contain at least 8 characters, one uppercase, one lowercase, and one number
                      </p>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-medium text-[#032b5f] dark:text-white">Confirm Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#032b5f] dark:group-focus-within:text-[#FBBF24] transition-colors" />
                        <Input
                          {...register('password2')}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-10 sm:h-11 bg-white dark:bg-[#062147] border-gray-200 dark:border-gray-700 focus:border-[#032b5f] dark:focus:border-[#FBBF24] transition-all duration-300 text-sm sm:text-base"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password2 && (
                        <p className="text-xs sm:text-sm text-red-500 dark:text-red-400">
                          {errors.password2.message}
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
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    {/* Terms and Privacy */}
                    <p className="text-[10px] sm:text-xs text-center text-gray-500 dark:text-gray-400">
                      By creating an account, you agree to our{' '}
                      <a href="#" className="text-[#032b5f] dark:text-[#FBBF24] hover:underline">Terms of Service</a>{' '}
                      and{' '}
                      <a href="#" className="text-[#032b5f] dark:text-[#FBBF24] hover:underline">Privacy Policy</a>
                    </p>

                    {/* Divider */}
                    <div className="relative my-3 sm:my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-2 bg-white dark:bg-[#0a2a1a] text-gray-500 dark:text-gray-400">
                          Already have an account?
                        </span>
                      </div>
                    </div>

                    {/* Sign In Link */}
                    <div className="text-center">
                      <Link 
                        to="/login" 
                        className="text-[#032b5f] dark:text-[#FBBF24] hover:text-[#1e4a76] dark:hover:text-[#fcd34d] font-medium hover:underline transition-all inline-flex items-center gap-1 text-sm"
                      >
                        Sign in to your account
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </form>

                  {/* Mobile Benefits Section - Only visible on mobile */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 md:hidden">
                    <p className="text-xs font-medium text-center text-[#032b5f] dark:text-[#FBBF24] mb-3">
                      Why join LeankUp?
                    </p>
                    <div className="space-y-2">
                      {benefits.slice(0, 3).map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-[#032b5f] dark:text-[#FBBF24] flex-shrink-0" />
                          <span className="text-[11px] text-gray-600 dark:text-gray-300">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
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

export default Register