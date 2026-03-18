import { Link } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { theme } = useTheme()
  
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent mb-4">
              LeankUp
            </h3>
            <p className="text-muted-foreground">
              Connecting local talent with opportunities and helping dreams come true through community fundraising.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Platform</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#features" className="hover:text-primary transition">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-primary transition">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-primary transition">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#about" className="hover:text-primary transition">About</a></li>
              <li><a href="#blog" className="hover:text-primary transition">Blog</a></li>
              <li><a href="#contact" className="hover:text-primary transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#privacy" className="hover:text-primary transition">Privacy</a></li>
              <li><a href="#terms" className="hover:text-primary transition">Terms</a></li>
              <li><a href="#security" className="hover:text-primary transition">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {currentYear} LeankUp. All rights reserved. Built for local communities.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer