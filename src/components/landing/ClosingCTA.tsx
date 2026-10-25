import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'

export function ClosingCTA() {
  return (
    <section className="closing-cta-section" aria-label="Get Started with CareerLaunch">
      <div className="closing-glow closing-glow--center" aria-hidden="true" />

      <div className="closing-container">
        <div className="closing-eyebrow">
          <Sparkles size={13} color="#E2A089" />
          <span>Begin Your Journey Today</span>
        </div>

        <h2 className="closing-headline">
          Your next chapter starts <em>with one step</em>.
        </h2>

        <p className="closing-subtext">
          Start building the skills and confidence to move towards your career
          goals.
        </p>

        <div className="closing-actions">
          <Link to="/signup" className="btn btn-terracotta" style={{ padding: '0.9rem 1.85rem' }}>
            <span>Get Started</span>
            <ArrowRight size={16} strokeWidth={2.4} />
          </Link>
          <a href="#cinematic-story" className="btn btn-outline-light" style={{ padding: '0.9rem 1.85rem' }}>
            <span>Explore CareerLaunch</span>
          </a>
        </div>

        <div className="closing-value-note">
          <ShieldCheck size={14} color="#879477" />
          <span>Built for students and early-career engineers • No credit card required</span>
        </div>
      </div>
    </section>
  )
}

export default ClosingCTA
