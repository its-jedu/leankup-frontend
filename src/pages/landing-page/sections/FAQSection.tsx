import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    question: "What types of tasks can I post on LeankUp?",
    answer: "You can post various local tasks including cleaning, delivery, moving, repair work, tutoring, event help, and more. Our platform connects you with skilled local talent for virtually any task you need help with."
  },
  {
    question: "How do I apply for funding for my campaign?",
    answer: "Simply click 'Start a Campaign', fill in your campaign details including goal amount and story, and submit for review. Once approved, your campaign goes live and you can start receiving contributions from supporters."
  },
  {
    question: "What are the fees for using LeankUp?",
    answer: "Posting tasks and creating campaigns is completely free. We only charge a small 5% fee on completed tasks and successful campaigns to cover platform costs and escrow protection. Withdrawals to bank accounts are free."
  },
  {
    question: "How does escrow protection work?",
    answer: "When you post a task, funds are held securely in escrow until the task is completed to your satisfaction. For campaigns, contributions are held safely and released according to your campaign's withdrawal schedule, protecting both creators and supporters."
  },
  {
    question: "How long does it take to receive funds?",
    answer: "Task payments are released instantly upon completion confirmation. Campaign funds can be withdrawn immediately after reaching milestones or campaign end. Bank transfers typically take 1-2 business days."
  },
  {
    question: "Can I apply if I have no prior experience?",
    answer: "Absolutely! LeankUp welcomes everyone. Many task posters are looking for enthusiastic local help, not necessarily professionals. Start with smaller tasks to build your reputation and grow from there."
  }
]

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

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
            Still have{' '}
            <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
              questions?
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about task outsourcing and fundraising on LeankUp
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-[hsl(var(--primary))]/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-[hsl(var(--primary))]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 text-muted-foreground border-t border-border pt-3"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <p className="text-muted-foreground">
            Can't find what you're looking for?{' '}
            <a href="#contact" className="text-[hsl(var(--primary))] hover:underline">
              Contact our support team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default FAQSection