import { Users, Target, Wallet, ChevronRight } from 'lucide-react'

const steps = [
  {
    number: "01",
    title: "Sign Up",
    description: "Create your free account in less than 2 minutes",
    icon: <Users className="h-6 w-6" />
  },
  {
    number: "02",
    title: "Choose Your Path",
    description: "Start outsourcing tasks or launch a fundraising campaign",
    icon: <Target className="h-6 w-6" />
  },
  {
    number: "03",
    title: "Grow & Earn",
    description: "Complete tasks, raise funds, and grow your wallet balance",
    icon: <Wallet className="h-6 w-6" />
  }
]

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get started in three simple steps and begin your journey with LeankUp.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                  {step.icon}
                </div>
                <div className="text-6xl font-bold text-primary/10 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 h-8 w-8 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection