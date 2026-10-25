import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { gsap } from '@/lib/gsap'

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const laptopRef = useRef<HTMLDivElement>(null)
  const floatingOppRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!heroRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Editorial text stagger reveal
      tl.from(
        [
          '.hero-eyebrow',
          '.hero-headline',
          '.hero-description',
          '.hero-actions',
          '.hero-trust',
        ],
        {
          opacity: 0,
          y: 32,
          duration: 0.9,
          stagger: 0.12,
        },
      )

      // Laptop frame rise & scale
      tl.from(
        laptopRef.current,
        {
          opacity: 0,
          y: 45,
          scale: 0.94,
          duration: 1.1,
          ease: 'power3.out',
        },
        '-=0.7',
      )

      // Floating card pop-in
      if (floatingOppRef.current) {
        tl.from(
          floatingOppRef.current,
          {
            opacity: 0,
            y: 20,
            scale: 0.9,
            duration: 0.8,
            ease: 'back.out(1.5)',
          },
          '-=0.5',
        )

        // Subtle ambient float
        gsap.to(floatingOppRef.current, {
          y: -8,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="hero-section" ref={heroRef} aria-label="Hero">
      <div className="hero-container">
        {/* Left Editorial Content */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow__dot" />
            <span>Your Next Chapter Starts Here</span>
          </div>

          <h1 className="hero-headline">
            Your ambition <em>deserves</em> a plan.
          </h1>

          <p className="hero-description">
            Build the skills, confidence, and interview readiness to turn your career
            goals into real opportunities.
          </p>

          <div className="hero-actions">
            <Link to="/signup" className="btn btn-terracotta">
              <span>Start Your Journey</span>
              <ArrowRight size={16} strokeWidth={2.4} />
            </Link>
            <a href="#cinematic-story" className="btn btn-outline-sand">
              <span>Explore the Platform</span>
              <ChevronRight size={16} />
            </a>
          </div>

          <div className="hero-trust">
            <div className="hero-trust__icon">
              <ShieldCheck size={16} strokeWidth={2.5} />
            </div>
            <p className="hero-trust__text">
              Prepare with purpose. Discover opportunities. Move forward with confidence.
            </p>
          </div>
        </div>

        {/* Right Product Mockup */}
        <div className="hero-visual">
          <div className="hero-laptop-frame" ref={laptopRef}>
            <div className="hero-screen">
              {/* Window Bar */}
              <div className="hero-screen__topbar">
                <div className="hero-screen__dots">
                  <span className="hero-screen__dot" />
                  <span className="hero-screen__dot" />
                  <span className="hero-screen__dot" />
                </div>
                <div className="hero-screen__role-pill">
                  <Terminal size={12} color="#C66A4A" />
                  <span>Target Role: Backend Developer</span>
                </div>
                <div className="hero-screen__status">
                  <Sparkles size={12} color="#879477" />
                  <span>Cohort 2026</span>
                </div>
              </div>

              {/* Main Screen Dashboard */}
              <div className="hero-screen__content">
                {/* Candidate Bar */}
                <div className="hero-screen__overview">
                  <div className="hero-screen__candidate">
                    <div className="hero-screen__avatar">JD</div>
                    <div>
                      <div className="hero-screen__name">Julian Drake</div>
                      <div className="hero-screen__sub">Placement Readiness Active</div>
                    </div>
                  </div>
                  <div className="hero-screen__score">
                    <div className="hero-screen__score-num">88%</div>
                    <div className="hero-screen__score-lbl">Readiness Index</div>
                  </div>
                </div>

                {/* 2-Column Split */}
                <div className="hero-screen__grid">
                  {/* Preparation Roadmap */}
                  <div className="hero-screen__card">
                    <div className="hero-screen__card-title">
                      <Compass size={13} color="#C66A4A" />
                      <span>Preparation Roadmap</span>
                    </div>

                    <div className="roadmap-step">
                      <span className="roadmap-step__num">01</span>
                      <div>
                        <div className="roadmap-step__title">Distributed Systems & DBs</div>
                        <span className="roadmap-step__badge roadmap-step__badge--done">
                          Completed • 94%
                        </span>
                      </div>
                    </div>

                    <div className="roadmap-step">
                      <span className="roadmap-step__num">02</span>
                      <div>
                        <div className="roadmap-step__title">Concurrency & Microservices</div>
                        <span className="roadmap-step__badge roadmap-step__badge--active">
                          In Progress • 74%
                        </span>
                      </div>
                    </div>

                    <div className="roadmap-step">
                      <span className="roadmap-step__num">03</span>
                      <div>
                        <div className="roadmap-step__title">Live System Design Mock</div>
                        <span className="roadmap-step__badge" style={{ background: '#F0EAE0', color: '#5E605B' }}>
                          Scheduled
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Mock & Opportunities */}
                  <div className="hero-screen__card">
                    <div className="hero-screen__card-title">
                      <Calendar size={13} color="#879477" />
                      <span>Upcoming Mock Interview</span>
                    </div>

                    <div className="mock-preview-box">
                      <div className="mock-preview-box__title">High-Throughput API Design</div>
                      <div className="mock-preview-box__meta">
                        Tomorrow, 10:00 AM • AI Feedback Enabled
                      </div>
                    </div>

                    <div className="hero-screen__card-title" style={{ marginTop: 4 }}>
                      <Briefcase size={13} color="#C66A4A" />
                      <span>Matched Opportunity</span>
                    </div>

                    <div className="opp-preview-box">
                      <div className="opp-preview-box__role">Backend Systems Fellow</div>
                      <div className="opp-preview-box__match">
                        <CheckCircle2 size={11} color="#879477" />
                        <span>94% Skill Match • Stripe Cohort</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Opportunity Notification */}
          <div className="hero-floating-opp" ref={floatingOppRef}>
            <div className="hero-floating-opp__icon">
              <Briefcase size={18} />
            </div>
            <div>
              <div className="hero-floating-opp__title">Campus Placement Drive</div>
              <div className="hero-floating-opp__status">
                <MapPin size={10} style={{ display: 'inline', marginRight: 2 }} />
                Shortlisted for Systems Engineering
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
