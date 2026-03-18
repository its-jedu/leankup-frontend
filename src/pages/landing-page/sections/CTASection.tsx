import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Clock } from 'lucide-react'

const CTASection = () => (
  <section className="py-20 bg-gradient-to-r from-primary to-accent">
    <div className="container">
      <div className="max-w-3xl mx-auto text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-white/90 mb-8">
          Join thousands of users already growing with LeankUp
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 px-8">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
              Contact Sales
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default CTASection