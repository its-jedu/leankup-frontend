import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Briefcase, Wallet } from 'lucide-react'

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-[#f2f6fa] dark:bg-[#062147]">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#032b5f]/5 via-transparent to-[#FBBF24]/5"></div>
      
      {/* Animated orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#032b5f]/10 rounded-full blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-[#FBBF24]/10 rounded-full blur-3xl animate-pulse-glow delay-200"></div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-[#032b5f] dark:text-white">Outsource </span>
              <span className="text-[#032b5f] dark:text-[#FBBF24]">
                Locally,
              </span>
              <br />
              <span className="text-[#FBBF24]">
                Fund Dreams
              </span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
              Connect with verified local talent for your tasks or launch fundraising campaigns with secure escrow protection. Empowering communities, one task at a time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/register">
                  <Button size="lg" className="bg-[#032b5f] hover:bg-[#1e4a76] dark:bg-[#FBBF24] dark:hover:bg-[#fcd34d] dark:text-[#062147] text-white text-base px-8 shadow-lg hover:shadow-xl w-full sm:w-auto">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/tasks">
                  <Button size="lg" variant="outline" className="text-base px-8 border-2 border-[#032b5f] dark:border-[#FBBF24] text-[#032b5f] dark:text-[#FBBF24] hover:bg-[#032b5f]/5 dark:hover:bg-[#FBBF24]/10 w-full sm:w-auto">
                    Browse Tasks
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#0a2a1a] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <Users className="h-5 w-5 text-[#032b5f] dark:text-[#FBBF24] mb-2" />
                <div className="text-xl font-bold text-[#032b5f] dark:text-white">500+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Active Users</div>
              </div>
              <div className="bg-white dark:bg-[#0a2a1a] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <Briefcase className="h-5 w-5 text-[#032b5f] dark:text-[#FBBF24] mb-2" />
                <div className="text-xl font-bold text-[#032b5f] dark:text-white">1.2k+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Tasks Posted</div>
              </div>
              <div className="bg-white dark:bg-[#0a2a1a] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <Wallet className="h-5 w-5 text-[#032b5f] dark:text-[#FBBF24] mb-2" />
                <div className="text-xl font-bold text-[#032b5f] dark:text-white">$450k</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Funds Raised</div>
              </div>
            </div>
          </motion.div>

          {/* Right content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="Team collaboration"
                className="rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700"
              />
              
              {/* Floating cards */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-4 -left-4 bg-white dark:bg-[#0a2a1a] rounded-xl p-3 shadow-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-[#032b5f]/10 dark:bg-[#FBBF24]/10 p-2 rounded-lg">
                    <Users className="h-4 w-4 text-[#032b5f] dark:text-[#FBBF24]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#032b5f] dark:text-white">+24 this week</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -bottom-4 -right-4 bg-white dark:bg-[#0a2a1a] rounded-xl p-3 shadow-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-[#032b5f]/10 dark:bg-[#FBBF24]/10 p-2 rounded-lg">
                    <Wallet className="h-4 w-4 text-[#032b5f] dark:text-[#FBBF24]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#032b5f] dark:text-white">$12k paid out</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection