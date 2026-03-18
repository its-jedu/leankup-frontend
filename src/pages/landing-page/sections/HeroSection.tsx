import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Briefcase, Wallet, Zap, Shield, TrendingUp } from 'lucide-react'

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/5 via-transparent to-[hsl(var(--secondary))]/5"></div>
      
      {/* Animated orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-[hsl(var(--secondary))]/10 rounded-full blur-3xl animate-pulse-glow delay-200"></div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-foreground">Outsource </span>
              <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
                Locally,
              </span>
              <br />
              <span className="bg-gradient-to-r from-[hsl(var(--secondary))] to-[hsl(var(--primary-light))] bg-clip-text text-transparent">
                Fund Dreams
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Connect with verified local talent for your tasks or launch fundraising campaigns with secure escrow protection. Empowering communities, one task at a time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/register">
                  <Button size="lg" className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-light))] text-white text-base px-8 shadow-lg hover:shadow-xl w-full sm:w-auto">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/tasks">
                  <Button size="lg" variant="outline" className="text-base px-8 border-2 border-[hsl(var(--primary))]/20 hover:bg-[hsl(var(--primary))]/5 w-full sm:w-auto">
                    Browse Tasks
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Realistic Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <Users className="h-5 w-5 text-[hsl(var(--primary))] mb-2" />
                <div className="text-xl font-bold text-foreground">500+</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <Briefcase className="h-5 w-5 text-[hsl(var(--secondary))] mb-2" />
                <div className="text-xl font-bold text-foreground">1.2k+</div>
                <div className="text-xs text-muted-foreground">Tasks Posted</div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <Wallet className="h-5 w-5 text-[hsl(var(--accent))] mb-2" />
                <div className="text-xl font-bold text-foreground">$450k</div>
                <div className="text-xs text-muted-foreground">Funds Raised</div>
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
                className="rounded-3xl shadow-2xl border border-border"
              />
              
              {/* Floating cards */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-4 -left-4 bg-card rounded-xl p-3 shadow-xl border border-border"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-[hsl(var(--primary))]/10 p-2 rounded-lg">
                    <Users className="h-4 w-4 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">+24 this week</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -bottom-4 -right-4 bg-card rounded-xl p-3 shadow-xl border border-border"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-[hsl(var(--secondary))]/10 p-2 rounded-lg">
                    <Wallet className="h-4 w-4 text-[hsl(var(--secondary))]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">$12k paid out</div>
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