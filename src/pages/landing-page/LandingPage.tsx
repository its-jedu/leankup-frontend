import Navbar from './layout/Navbar'
import Footer from './layout/Footer'
import HeroSection from './sections/HeroSection'
import StorySection from './sections/StorySection'
import FeaturesSection from './sections/FeaturesSection'
// import HowItWorksSection from './sections/HowItWorksSection'
import ValuesSection from './sections/ValuesSection'
import TestimonialsSection from './sections/TestimonialsSection'
import FAQSection from './sections/FAQSection'
import CTASection from './sections/CTASection'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <StorySection />
        <FeaturesSection />
        {/* <HowItWorksSection /> */}
        <ValuesSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage