import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-white dark:bg-[#062147] border-t border-gray-200 dark:border-gray-700 py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-[#032b5f] dark:text-[#FBBF24] mb-4">
              LeankUp
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connecting local talent with opportunities and helping dreams come true through community fundraising.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#032b5f] dark:text-white">Platform</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li><a href="#features" className="hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#032b5f] dark:text-white">Company</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li><a href="#about" className="hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition">About</a></li>
              <li><a href="#blog" className="hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition">Blog</a></li>
              <li><a href="#contact" className="hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#032b5f] dark:text-white">Legal</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li><a href="#privacy" className="hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition">Privacy</a></li>
              <li><a href="#terms" className="hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition">Terms</a></li>
              <li><a href="#security" className="hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-500 dark:text-gray-400">
          <p>&copy; {currentYear} LeankUp. All rights reserved. Built for local communities.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer