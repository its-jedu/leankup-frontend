import { Card, CardContent } from '@/components/ui/card'
import { Globe, Target, Wallet, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: <Globe className="h-8 w-8 text-primary" />,
    title: "Local Outsourcing",
    description: "Find trusted local talent for your tasks or earn by completing tasks in your community",
    stats: "500+ tasks weekly"
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: "Fundraising",
    description: "Launch campaigns and raise funds with secure escrow protection for all transactions",
    stats: "$2M+ raised"
  },
  {
    icon: <Wallet className="h-8 w-8 text-primary" />,
    title: "Smart Wallet",
    description: "Manage your earnings securely with instant withdrawals to bank or Raenest",
    stats: "Instant withdrawals"
  }
]

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you outsource tasks, raise funds, and manage your finances seamlessly.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <CheckCircle className="h-4 w-4" />
                  <span>{feature.stats}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection