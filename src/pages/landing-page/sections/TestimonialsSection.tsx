import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    content: "LeankUp transformed how I run my business. I found reliable local help within hours, and the escrow system gives me complete peace of mind.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108777-7669c7bf7d8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    location: "New York, NY"
  },
  {
    name: "Michael Chen",
    role: "Freelancer",
    content: "I've earned over $5,000 in just 3 months. The wallet system is seamless and withdrawals are instant. Best platform for freelancers!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    location: "San Francisco, CA"
  },
  {
    name: "Amara Okafor",
    role: "Community Organizer",
    content: "Our community campaign raised 150% of our goal. The platform's features and support team are incredible. Highly recommended!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    location: "Austin, TX"
  }
]

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 bg-white overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Users Say
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied users who have transformed how they work and raise funds
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <Card className="relative h-full hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-8">
                  {/* Quote icon */}
                  <Quote className="absolute top-6 right-6 h-12 w-12 text-primary/10" />
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <p className="text-gray-700 mb-6 relative z-10">"{testimonial.content}"</p>
                  
                  {/* User info */}
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                      <p className="text-xs text-gray-400">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { value: "4.9/5", label: "User Rating" },
            { value: "10,000+", label: "Active Users" },
            { value: "50,000+", label: "Tasks Completed" },
            { value: "98%", label: "Satisfaction Rate" }
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default TestimonialsSection