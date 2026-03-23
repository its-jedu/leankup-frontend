import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle } from 'lucide-react'

const CTASection = () => {
  return (
    <section className="relative overflow-hidden py-20">
      {/* Base gradient background - using primary blue */}
      <div className="absolute inset-0 bg-[#032b5f] dark:bg-[#062147]"></div>
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(242, 246, 250, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(242, 246, 250, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      ></div>
      
      {/* Animated circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse-glow delay-200"></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float delay-400"></div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Turn your goals into{' '}
            <span className="text-[#FBBF24]">reality</span>
          </h2>
          <p className="text-xl text-white/90 mb-8">
            With just a few clicks, get the support you need to complete tasks or fund your dreams in your local community.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {[
              "Free to join",
              "Escrow protected",
              "24/7 support",
              "Verified talent",
              "Instant withdrawals",
              "Community focused"
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 text-white/90"
              >
                <CheckCircle className="h-4 w-4 text-[#FBBF24] flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/register">
                <Button size="lg" className="bg-white text-[#032b5f] dark:bg-white dark:text-[#062147] hover:bg-white/90 px-8 w-full sm:w-auto border-0 shadow-xl">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTASection