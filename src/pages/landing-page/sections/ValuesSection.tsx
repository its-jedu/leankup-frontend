import { motion } from 'framer-motion'
import { Shield, Heart, Zap, Users, Target, Globe } from 'lucide-react'

const ValuesSection = () => {
  const values = [
    {
      icon: Shield,
      title: "Integrity First",
      description: "We prioritize transparency and ethical practices in every transaction, ensuring trust between community members."
    },
    {
      icon: Heart,
      title: "Community Focus",
      description: "Every feature we build is designed to strengthen local connections and empower neighborhood economies."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously evolve our platform to meet the changing needs of local task seekers and fundraisers."
    },
    {
      icon: Users,
      title: "Inclusive Growth",
      description: "We believe everyone should have access to opportunities, regardless of their background or location."
    },
    {
      icon: Target,
      title: "Results Driven",
      description: "We're committed to helping you achieve your goals, whether it's completing tasks or funding dreams."
    },
    {
      icon: Globe,
      title: "Local Impact",
      description: "Every task completed and campaign funded creates ripples of positive change in local communities."
    }
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our commitment to{' '}
            <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
              values-driven success
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our values shape the way we do business, ensuring every interaction on our platform builds stronger communities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-300"
              >
                <div className="bg-[hsl(var(--primary))]/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground max-w-3xl mx-auto">
            By staying true to these principles, we empower local communities to overcome challenges, seize opportunities, and achieve sustainable growth. These values make us a trusted partner for task outsourcing and fundraising in neighborhoods everywhere.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default ValuesSection