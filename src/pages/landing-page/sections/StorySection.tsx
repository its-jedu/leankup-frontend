import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, Heart, Users, Shield, Zap, Award } from 'lucide-react'

const StorySection = () => {
  const stats = [
    { value: "500+", label: "Active Users", icon: Users },
    { value: "95%", label: "Satisfaction Rate", icon: Award },
    { value: "50+", label: "Communities Served", icon: Heart },
    { value: "98%", label: "Task Success Rate", icon: Shield }
  ]

  return (
    <section className="py-20 bg-white dark:bg-[#062147]">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-[#032b5f] dark:text-[#FBBF24]">
              Our story
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Inspires every journey we create, connecting local talent with opportunities and helping dreams come true through community fundraising.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-[#032b5f]/10 dark:bg-[#FBBF24]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-[#032b5f] dark:text-[#FBBF24]" />
                </div>
                <div className="text-3xl font-bold text-[#032b5f] dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Story content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-[#032b5f] dark:text-white">
              Driving success through{' '}
              <span className="text-[#FBBF24]">local connections</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our mission is to empower local communities by connecting people who need tasks done with skilled local talent, while providing a secure platform for community fundraising. We're committed to creating a seamless experience that helps both task posters and fundraisers achieve their goals.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Whether you're looking for help with daily tasks or launching a campaign for a community project, we provide the tools and security you need to succeed. Every task completed and every campaign funded strengthens our local communities.
            </p>

            {/* Why us highlights */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-[#FBBF24]/10 p-2 rounded-lg mt-1">
                  <Shield className="h-4 w-4 text-[#FBBF24]" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-[#032b5f] dark:text-white">Escrow Protection</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Funds are held securely until tasks are completed or campaign goals are met</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#032b5f]/10 dark:bg-[#FBBF24]/10 p-2 rounded-lg mt-1">
                  <Users className="h-4 w-4 text-[#032b5f] dark:text-[#FBBF24]" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-[#032b5f] dark:text-white">Verified Talent</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">All task posters and fundraisers are verified for your peace of mind</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#FBBF24]/10 p-2 rounded-lg mt-1">
                  <Zap className="h-4 w-4 text-[#FBBF24]" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-[#032b5f] dark:text-white">Instant Withdrawals</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Access your earnings immediately with our smart wallet system</p>
                </div>
              </div>
            </div>

            <Link to="/about">
              <Button variant="outline" className="gap-2 border-[#032b5f] dark:border-[#FBBF24] text-[#032b5f] dark:text-[#FBBF24] hover:bg-[#032b5f]/5 dark:hover:bg-[#FBBF24]/10">
                Learn More About Us
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              alt="Team working together"
              className="rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700"
            />
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-[#0a2a1a] rounded-xl p-4 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="bg-[#032b5f]/10 dark:bg-[#FBBF24]/10 p-3 rounded-lg">
                  <Heart className="h-5 w-5 text-[#032b5f] dark:text-[#FBBF24]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#032b5f] dark:text-white">24/7 Support</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Secure & reliable</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default StorySection