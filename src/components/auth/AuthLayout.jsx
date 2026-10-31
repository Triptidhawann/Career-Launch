import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, ShieldCheck, Sparkles, Target, Trophy } from 'lucide-react'

/**
 * Editorial split authentication layout for Sign In, Sign Up, and Password Reset screens.
 *
 * @param {Object} props
 * @param {string} props.eyebrow - Small badge text above the main title
 * @param {string} props.title - Primary page heading
 * @param {string} props.subtitle - Descriptive subheading
 * @param {import('react').ReactNode} props.children - Form body content
 * @param {import('react').ReactNode} props.footerPrompt - Secondary navigation prompt link
 */
export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footerPrompt,
}) {
  return (
    <div className="auth-page">
      {/* Top Header */}
      <header className="auth-header">
        <Link to="/" className="auth-header__logo" aria-label="CareerLaunch Home">
          <div className="auth-header__logo-icon">
            <Compass size={18} strokeWidth={2.4} />
          </div>
          <span className="auth-header__logo-text">
            Career<span>Launch</span>
          </span>
        </Link>

        <Link to="/" className="auth-header__back-link">
          <ArrowLeft size={15} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Form & Editorial Split Card */}
      <main className="auth-main">
        <div className="auth-container">
          {/* Left: Form Area */}
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <div className="auth-form-eyebrow">
                <Sparkles size={12} />
                <span>{eyebrow}</span>
              </div>
              <h1 className="auth-form-title">{title}</h1>
              <p className="auth-form-subtitle">{subtitle}</p>
            </div>

            {children}

            <div className="auth-footer-prompt">{footerPrompt}</div>
          </div>

          {/* Right: Editorial Visual Panel */}
          <aside className="auth-editorial-panel" aria-label="Platform Highlights">
            <div className="auth-editorial-glow" aria-hidden="true" />

            <div className="auth-editorial-content">
              <div className="auth-editorial-tag">
                <Sparkles size={12} color="#E2A089" />
                <span>Student Career Readiness</span>
              </div>

              <h2 className="auth-editorial-headline">
                Your ambition <em>deserves</em> a plan.
              </h2>

              <p className="auth-editorial-desc">
                Join ambitious students preparing for placements through personalized
                skill-gap analysis, technical drills, and direct opportunity discovery.
              </p>

              <div className="auth-benefits-list">
                <div className="auth-benefit-item">
                  <div className="auth-benefit-icon">
                    <Target size={15} />
                  </div>
                  <div>
                    <div className="auth-benefit-title">Role-Based Roadmaps</div>
                    <div className="auth-benefit-sub">
                      Targeted technical curricula aligned with actual campus hiring criteria.
                    </div>
                  </div>
                </div>

                <div className="auth-benefit-item">
                  <div className="auth-benefit-icon">
                    <Trophy size={15} />
                  </div>
                  <div>
                    <div className="auth-benefit-title">Mock Interview Simulations</div>
                    <div className="auth-benefit-sub">
                      Practice with structured questions and instantaneous STAR-method feedback.
                    </div>
                  </div>
                </div>

                <div className="auth-benefit-item">
                  <div className="auth-benefit-icon">
                    <ShieldCheck size={15} />
                  </div>
                  <div>
                    <div className="auth-benefit-title">Direct Placement Discovery</div>
                    <div className="auth-benefit-sub">
                      Verified campus drives and internships matching your preparation score.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="auth-editorial-footer">
              <ShieldCheck size={14} color="#879477" />
              <span>Campus Readiness & Placement Platform • No fake credentials</span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default AuthLayout
