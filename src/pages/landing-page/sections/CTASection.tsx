import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Zap, Globe, CheckCircle } from 'lucide-react'

const CTASection = () => {
  return (
    <section className="relative overflow-hidden py-20">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>
      
      {/* Animated circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center text-white"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your{' '}
            <span className="text-secondary">Future?</span>
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users already earning and growing with LeankUp
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {[
              "Free to join",
              "Instant withdrawals",
              "24/7 support",
              "Secure payments",
              "Global community",
              "No hidden fees"
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 text-white/90"
              >
                <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/register">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 px-8 w-full sm:w-auto">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 w-full sm:w-auto">
                  Talk to Sales
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>SSL Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Instant Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Global Access</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTASection