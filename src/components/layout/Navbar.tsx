import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Compass, LogOut, Mail, Menu, User, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function Navbar() {
  const { user, isAuthenticated, isEmailVerified, signOut } = useAuth()
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      setMobileMenuOpen(false)
      navigate('/')
    } catch (err) {
      console.error('Sign out failed:', err)
    }
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student'

  return (
    <header className={`navbar-wrapper ${isScrolled ? 'navbar-wrapper--scrolled' : ''}`}>
      <nav className="navbar" aria-label="Main navigation">
        {/* Brand Logo */}
        <Link to="/" className="navbar__logo" aria-label="CareerLaunch Home">
          <div className="navbar__logo-icon">
            <Compass size={20} strokeWidth={2.4} />
          </div>
          <span className="navbar__logo-text">
            Career<span>Launch</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar__links">
          <a href="/#features" className="navbar__link">Features</a>
          <a href="/#how-it-works" className="navbar__link">How It Works</a>
          <a href="/#opportunities" className="navbar__link">Opportunities</a>
        </div>

        {/* Desktop Actions */}
        <div className="navbar__actions">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {!isEmailVerified && (
                <Link
                  to="/verify-email"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(198, 106, 74, 0.15)',
                    color: '#C66A4A',
                    textDecoration: 'none',
                    border: '1px solid rgba(198, 106, 74, 0.3)',
                  }}
                >
                  <Mail size={12} />
                  <span>Verify Email</span>
                </Link>
              )}

              <Link
                to="/dashboard"
                className="btn btn-forest"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}
              >
                Dashboard
              </Link>

              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-charcoal)',
                }}
              >
                <User size={15} color="var(--color-forest)" />
                <span>{displayName}</span>
              </span>

              <button
                type="button"
                onClick={handleSignOut}
                className="btn btn-outline-sand"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}
                title="Sign Out"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="navbar__signin-btn">
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-terracotta">
                <span>Get Started</span>
                <ArrowRight size={15} strokeWidth={2.2} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          className="navbar__mobile-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`navbar__mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <a
          href="/#features"
          className="navbar__mobile-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          Features
        </a>
        <a
          href="/#how-it-works"
          className="navbar__mobile-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          How It Works
        </a>
        <a
          href="/#opportunities"
          className="navbar__mobile-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          Opportunities
        </a>
        <div className="navbar__mobile-actions">
          {isAuthenticated ? (
            <>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-sand)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-charcoal)',
                }}
              >
                Signed in as: {displayName}
              </div>
              <Link
                to="/dashboard"
                className="btn btn-forest"
                onClick={() => setMobileMenuOpen(false)}
              >
                Go to Dashboard
              </Link>
              {!isEmailVerified && (
                <Link
                  to="/verify-email"
                  className="btn btn-outline-dark"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Mail size={14} />
                  <span>Verify Email Address</span>
                </Link>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="btn btn-forest"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="navbar__signin-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="btn btn-terracotta"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Get Started</span>
                <ArrowRight size={15} strokeWidth={2.2} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
