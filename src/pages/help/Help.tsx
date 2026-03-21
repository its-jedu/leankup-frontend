import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, MessageSquare, BookOpen, HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react'

const faqs = [
  {
    question: "How do I post a task?",
    answer: "Click on 'Post a Task' in the sidebar, fill in the task details including title, description, budget, and location, then submit. Your task will be visible to community members who can apply to help."
  },
  {
    question: "How does escrow protection work?",
    answer: "When you post a task, funds are held securely in escrow until the task is completed to your satisfaction. This protects both task posters and workers, ensuring fair payment upon completion."
  },
  {
    question: "How do I start a fundraising campaign?",
    answer: "Navigate to Campaigns and click 'Start a Campaign'. Provide campaign details, target amount, end date, and your story. Once approved, your campaign will be visible to potential supporters."
  },
  {
    question: "How do I withdraw my earnings?",
    answer: "Go to Wallet, click 'Withdraw Funds', enter the amount, and choose your withdrawal method (bank transfer or Raenest). Funds are typically processed within 1-2 business days."
  },
  {
    question: "What fees does LeankUp charge?",
    answer: "Posting tasks and creating campaigns is free. We charge a small 5% fee on completed tasks and successful campaigns to cover platform costs and escrow protection. Withdrawals to bank accounts are free."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach our support team by emailing support@leankup.com or using the contact form below. We typically respond within 24 hours."
  }
]

const Help = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">Help Center</h1>
        <p className="text-muted-foreground">Find answers to common questions and get support</p>
      </div>

      {/* Search */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              className="pl-10 bg-background border-border text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Documentation</h3>
            <p className="text-sm text-muted-foreground">Read our detailed guides</p>
          </CardContent>
        </Card>
        <Card className="border-border hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Community Forum</h3>
            <p className="text-sm text-muted-foreground">Ask questions to the community</p>
          </CardContent>
        </Card>
        <Card className="border-border hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-6 text-center">
            <Mail className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Contact Support</h3>
            <p className="text-sm text-muted-foreground">Get help from our team</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFaqs.length > 0 ? (
            <div className="space-y-2">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition"
                  >
                    <span className="font-medium text-foreground">{faq.question}</span>
                    {openIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  {openIndex === index && (
                    <div className="p-4 pt-0 border-t border-border">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No results found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
        <CardContent className="p-6 text-center">
          <Mail className="h-12 w-12 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-semibold mb-2 text-foreground">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">
            Our support team is here to help you with any questions
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Mail className="mr-2 h-4 w-4" />
              Email Support
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <MessageSquare className="mr-2 h-4 w-4" />
              Live Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Help