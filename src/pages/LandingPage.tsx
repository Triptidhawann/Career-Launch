import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/landing/Hero'
import { CinematicStory } from '@/components/landing/CinematicStory'
import { InterviewPrep } from '@/components/landing/InterviewPrep'
import { Opportunities } from '@/components/landing/Opportunities'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { ClosingCTA } from '@/components/landing/ClosingCTA'
import { Footer } from '@/components/layout/Footer'

export function LandingPage() {
  return (
    <div className="careerlaunch-app">
      {/* Section 1: Navigation */}
      <Navbar />

      <main>
        {/* Section 2: Hero — Make your next move count */}
        <Hero />

        {/* Section 3: Cinematic Scroll Storytelling (6 Stages) */}
        <CinematicStory />

        {/* Section 4: Interview Preparation */}
        <InterviewPrep />

        {/* Section 5: Opportunities */}
        <Opportunities />

        {/* Section 6: How CareerLaunch Works (4-Step Connected Journey) */}
        <HowItWorks />

        {/* Section 7: Closing CTA */}
        <ClosingCTA />
      </main>

      {/* Section 8: Footer */}
      <Footer />
    </div>
  )
}

export default LandingPage
