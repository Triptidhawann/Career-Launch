import { Compass } from 'lucide-react'

export function Footer() {
  return (
    <footer className="footer-section" aria-label="Site footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <a href="#" className="footer-logo">
              <div className="footer-logo__icon">
                <Compass size={18} strokeWidth={2.4} />
              </div>
              <span className="footer-logo__text">
                Career<span>Launch</span>
              </span>
            </a>
            <p className="footer-description">
              A comprehensive career-readiness platform helping ambitious students
              prepare for campus placements through personalised skill diagnostics,
              purposeful practice, and direct opportunity discovery.
            </p>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h4 className="footer-col-title">Platform</h4>
            <div className="footer-nav-list">
              <a href="#features" className="footer-nav-link">
                Features
              </a>
              <a href="#interview-prep" className="footer-nav-link">
                Interview Preparation
              </a>
              <a href="#opportunities" className="footer-nav-link">
                Opportunities
              </a>
              <a href="#how-it-works" className="footer-nav-link">
                How It Works
              </a>
            </div>
          </div>

          {/* Column 2: Preparation */}
          <div>
            <h4 className="footer-col-title">Preparation</h4>
            <div className="footer-nav-list">
              <a href="#features" className="footer-nav-link">
                Role Blueprints
              </a>
              <a href="#cinematic-story" className="footer-nav-link">
                Skill Diagnostics
              </a>
              <a href="#interview-prep" className="footer-nav-link">
                Technical Practice
              </a>
              <a href="#interview-prep" className="footer-nav-link">
                Mock Simulations
              </a>
            </div>
          </div>

          {/* Column 3: Company & Contact */}
          <div>
            <h4 className="footer-col-title">Company</h4>
            <div className="footer-nav-list">
              <a href="#about" className="footer-nav-link">
                About CareerLaunch
              </a>
              <a href="#contact" className="footer-nav-link">
                Contact & Support
              </a>
              <a href="#privacy" className="footer-nav-link">
                Privacy Policy
              </a>
              <a href="#terms" className="footer-nav-link">
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div>
            &copy; 2026 CareerLaunch Inc. All rights reserved.
          </div>

          <div className="footer-legal-links">
            <a href="#privacy" className="footer-legal-link">
              Privacy Policy
            </a>
            <a href="#terms" className="footer-legal-link">
              Terms of Service
            </a>
            <a href="#cookies" className="footer-legal-link">
              Cookie Preferences
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
