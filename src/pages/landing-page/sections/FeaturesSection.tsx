import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Globe, 
  Target, 
  Wallet, 
  CheckCircle, 
  Clock, 
  Shield,
  Users,
  TrendingUp
} from 'lucide-react'

const features = [
  {
    icon: <Globe className="h-8 w-8 text-[hsl(var(--primary))]" />,
    title: "Local Outsourcing",
    description: "Find trusted local talent for your tasks or earn by completing tasks in your community",
    stats: "500+ tasks weekly",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    benefits: ["Verified professionals", "Secure payments", "Rating system"]
  },
  {
    icon: <Target className="h-8 w-8 text-[hsl(var(--primary))]" />,
    title: "Fundraising",
    description: "Launch campaigns and raise funds with secure escrow protection for all transactions",
    stats: "$450k raised",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    benefits: ["Escrow protection", "Community focused", "0% platform fees"]
  },
  {
    icon: <Wallet className="h-8 w-8 text-[hsl(var(--primary))]" />,
    title: "Smart Wallet",
    description: "Manage your earnings securely with instant withdrawals to bank or your Raenest Account",
    stats: "Instant withdrawals",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    benefits: ["Instant transfers", "Multi-currency", "24/7 access"]
  }
]

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
              Everything You Need
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you outsource tasks, raise funds, and manage your finances seamlessly.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <Card className="group overflow-hidden border border-border bg-card hover:shadow-2xl transition-all duration-500">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="bg-[hsl(var(--primary))]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  
                  {/* Benefits */}
                  <div className="space-y-2 mb-4">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Activity</span>
                      <span className="text-sm font-semibold text-[hsl(var(--primary))]">{feature.stats}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { icon: Shield, label: "Secure Payments", value: "100% Protected" },
            { icon: Clock, label: "Fast Processing", value: "Instant" },
            { icon: Users, label: "Happy Users", value: "500+" },
            { icon: TrendingUp, label: "Success Rate", value: "95%" }
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="text-center">
                <div className="bg-[hsl(var(--primary))]/5 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-6 w-6 text-[hsl(var(--primary))]" />
                </div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
                <div className="font-semibold text-foreground">{item.value}</div>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesSection