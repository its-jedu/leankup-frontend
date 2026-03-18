import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Users, Award, Wallet, Zap, ArrowRight } from 'lucide-react'

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-foreground px-4 py-2 rounded-full mb-8 animate-slide-up">
            <Zap className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium">Trusted by 10,000+ users</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Outsource Locally,
            </span>
            <br />
            <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
              Fund Dreams
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Connect with trusted local talent, launch fundraising campaigns, and manage your earnings securely - all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-base px-8 shadow-lg hover:shadow-xl">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/tasks">
              <Button size="lg" variant="outline" className="text-base px-8 border-2 hover:bg-primary/5">
                Browse Tasks
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-gray-600">10k+ Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-sm text-gray-600">5k+ Tasks Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="text-sm text-gray-600">$2M+ Raised</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection