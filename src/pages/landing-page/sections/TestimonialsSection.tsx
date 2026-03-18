import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    content: "Finding reliable local help for my business was always a challenge until LeankUp. Within days, I found a talented graphic designer in my neighborhood who helped refresh my brand. The escrow system gave me peace of mind throughout the project.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108777-7669c7bf7d8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    location: "Austin, TX",
    business: "The Coffee Shop"
  },
  {
    name: "Michael Chen",
    role: "Freelance Developer",
    content: "I've completed over 30 local tasks through LeankUp, earning $8,500 in the process. The instant withdrawal feature is a game-changer - I get paid immediately after task completion. It's helped me build a steady income stream in my community.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    location: "Seattle, WA",
    business: "Freelancer"
  },
  {
    name: "Amara Okafor",
    role: "Community Organizer",
    content: "Our neighborhood needed $15,000 for a community garden project. LeankUp's fundraising platform helped us exceed our goal by 120% in just 3 weeks. The escrow protection meant donors felt secure, and we could focus on building the garden.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    location: "Atlanta, GA",
    business: "Community Garden Project"
  }
]

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 bg-card overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Together,{' '}
            <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
              we achieve more
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from community members who have grown and succeeded with LeankUp
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-border">
                <CardContent className="p-6">
                  {/* Quote icon */}
                  <Quote className="h-8 w-8 text-[hsl(var(--primary))]/20 mb-4" />
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[hsl(var(--secondary))] text-[hsl(var(--secondary))]" />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <p className="text-foreground/80 mb-6 line-clamp-4">"{testimonial.content}"</p>
                  
                  {/* User info */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[hsl(var(--primary))]/20"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${testimonial.name.replace(' ', '+')}&background=4F46E5&color=fff&size=48`;
                      }}
                    />
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-[hsl(var(--primary))]">{testimonial.business}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Success metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {[
            { value: "95%", label: "Client satisfaction" },
            { value: "500+", label: "Businesses served" },
            { value: "98%", label: "Task success rate" },
            { value: "24/7", label: "Support available" }
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-2xl font-bold text-[hsl(var(--primary))]">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default TestimonialsSection