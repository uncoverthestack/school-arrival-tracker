import { Navbar } from './landing/Navbar'
import { Hero } from './landing/Hero'
import { Stats } from './landing/Stats'
import { Features } from './landing/Features'
import { WhyUs } from './landing/WhyUs'
import { Pricing } from './landing/Pricing'
import { Footer } from './landing/Footer'
import { StickyMobileCTA } from './landing/StickyMobileCTA'

export function LandingPage() {
  return (
    <div data-theme="dark" className="dark min-h-screen overflow-x-hidden bg-[#101010] font-kiosk text-white pb-16 md:pb-0">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <WhyUs />
      <Pricing />
      <Footer />
      <StickyMobileCTA />
    </div>
  )
}
