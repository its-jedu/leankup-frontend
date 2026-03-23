import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    platform: false,
    company: false,
    legal: false
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const footerLinks = {
    platform: {
      title: "Platform",
      links: [
        { name: "Features", href: "#features" },
        { name: "How It Works", href: "#how-it-works" },
        { name: "Pricing", href: "#pricing" }
      ]
    },
    company: {
      title: "Company",
      links: [
        { name: "About", href: "#about" },
        { name: "Blog", href: "#blog" },
        { name: "Contact", href: "#contact" }
      ]
    },
    legal: {
      title: "Legal",
      links: [
        { name: "Privacy", href: "#privacy" },
        { name: "Terms", href: "#terms" },
        { name: "Security", href: "#security" }
      ]
    }
  }

  return (
    <footer className="bg-white dark:bg-[#062147] border-t border-gray-200 dark:border-gray-700">
      {/* Main Footer Content */}
      <div className="container py-8 sm:py-12">
        {/* Desktop Grid Layout - Hidden on mobile, visible on tablet/desktop */}
        <div className="hidden md:grid md:grid-cols-4 gap-6 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-3 lg:space-y-4">
            <h3 className="text-xl lg:text-2xl font-bold text-[#032b5f] dark:text-[#FBBF24]">
              LeankUp
            </h3>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              Connecting local talent with opportunities and helping dreams come true through community fundraising.
            </p>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key} className="space-y-3 lg:space-y-4">
              <h4 className="font-semibold text-[#032b5f] dark:text-white text-sm lg:text-base">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <a 
                      href={link.href} 
                      className="text-sm lg:text-base text-gray-600 dark:text-gray-300 hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile Accordion Layout - Visible only on mobile */}
        <div className="md:hidden space-y-4">
          {/* Brand Section - Always visible on mobile */}
          <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-[#032b5f] dark:text-[#FBBF24] mb-3">
              LeankUp
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Connecting local talent with opportunities and helping dreams come true through community fundraising.
            </p>
          </div>

          {/* Accordion Sections */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key} className="border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between py-3 text-left"
              >
                <h4 className="font-semibold text-[#032b5f] dark:text-white text-base">
                  {section.title}
                </h4>
                {openSections[key] ? (
                  <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              
              {openSections[key] && (
                <div className="pb-3 animate-slide-down">
                  <ul className="space-y-2">
                    {section.links.map((link, idx) => (
                      <li key={idx}>
                        <a 
                          href={link.href} 
                          className="text-sm text-gray-600 dark:text-gray-300 hover:text-[#032b5f] dark:hover:text-[#FBBF24] transition-colors duration-200 block py-1"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Copyright Section - Responsive */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              &copy; {currentYear} LeankUp. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Built for local communities
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer