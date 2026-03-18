import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, Heart, Users, Shield, Zap, Clock, Award } from 'lucide-react'

const StorySection = () => {
  const stats = [
    { value: "500+", label: "Active Users", icon: Users },
    { value: "95%", label: "Satisfaction Rate", icon: Award },
    { value: "50+", label: "Communities Served", icon: Heart },
    { value: "98%", label: "Task Success Rate", icon: Shield }
  ]

  return (
    <section className="py-20 bg-card">
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
            <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
              Our story
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                <div className="bg-[hsl(var(--primary))]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-[hsl(var(--primary))]" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
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
            <h3 className="text-2xl md:text-3xl font-bold mb-6">
              Driving success through{' '}
              <span className="text-[hsl(var(--primary))]">local connections</span>
            </h3>
            <p className="text-muted-foreground mb-6">
              Our mission is to empower local communities by connecting people who need tasks done with skilled local talent, while providing a secure platform for community fundraising. We're committed to creating a seamless experience that helps both task posters and fundraisers achieve their goals.
            </p>
            <p className="text-muted-foreground mb-8">
              Whether you're looking for help with daily tasks or launching a campaign for a community project, we provide the tools and security you need to succeed. Every task completed and every campaign funded strengthens our local communities.
            </p>

            {/* Why us highlights */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-green-500/10 p-2 rounded-lg mt-1">
                  <Shield className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Escrow Protection</h4>
                  <p className="text-sm text-muted-foreground">Funds are held securely until tasks are completed or campaign goals are met</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg mt-1">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Verified Talent</h4>
                  <p className="text-sm text-muted-foreground">All task posters and fundraisers are verified for your peace of mind</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-amber-500/10 p-2 rounded-lg mt-1">
                  <Zap className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Instant Withdrawals</h4>
                  <p className="text-sm text-muted-foreground">Access your earnings immediately with our smart wallet system</p>
                </div>
              </div>
            </div>

            <Link to="/about">
              <Button variant="outline" className="gap-2">
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
              className="rounded-3xl shadow-2xl border border-border"
            />
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="bg-[hsl(var(--primary))]/10 p-3 rounded-lg">
                  <Heart className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <div className="text-sm font-semibold">24/7 Support</div>
                  <div className="text-xs text-muted-foreground">Secure & reliable</div>
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