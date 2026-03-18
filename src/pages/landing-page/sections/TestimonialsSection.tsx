import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    content: "LeankUp helped me find reliable local help for my business. The escrow system gives me peace of mind.",
    rating: 5,
    image: "SJ"
  },
  {
    name: "Michael Chen",
    role: "Freelancer",
    content: "I've earned over $5,000 completing tasks. The wallet system is seamless and withdrawals are instant.",
    rating: 5,
    image: "MC"
  },
  {
    name: "Amara Okafor",
    role: "Community Organizer",
    content: "Our community campaign raised 150% of our goal. The platform is intuitive and supportive.",
    rating: 5,
    image: "AO"
  }
]

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied users who have transformed how they work and raise funds.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-primary to-accent w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection