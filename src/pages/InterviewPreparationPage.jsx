import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  GraduationCap,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import { INTERVIEW_ROLES } from '@/data/interviewRoles'
import { useAuth } from '@/hooks/useAuth'
import { fetchProfile } from '@/lib/api'
import '@/styles/interview-preparation.css'

export function InterviewPreparationPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const params = useParams()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Local storage initial selection
  const [sessionRoleId, setSessionRoleId] = useState(() => {
    return localStorage.getItem('careerlaunch_selected_prep_role') || null
  })

  // Derive effective active role from URL params or local state
  const effectiveRoleId = params.roleId || sessionRoleId || null

  // Fetch student profile for personalisation
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const res = await fetchProfile()
        if (isMounted && res && res.profile) {
          setProfile(res.profile)
        }
      } catch (err) {
        console.warn('Interview prep note: continuing with session context:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSignOut = async () => {
    try {
      setMobileMenuOpen(false)
      await signOut()
      navigate('/login')
    } catch {
      navigate('/login')
    }
  }

  // Derive target roles from student profile (if available)
  const studentTargetRoles = useMemo(() => {
    return profile?.careerPreferences?.targetRoles || []
  }, [profile])

  // Helper: check if a role matches the student's profile preferences
  const checkRoleMatch = (role) => {
    if (!studentTargetRoles || studentTargetRoles.length === 0) return false
    return studentTargetRoles.some((target) => {
      const lowerTarget = target.toLowerCase()
      return (
        role.keywords.some((kw) => lowerTarget.includes(kw)) ||
        lowerTarget.includes(role.title.toLowerCase())
      )
    })
  }

  // Find active selected role object
  const activeRole = useMemo(() => {
    if (!effectiveRoleId) return null
    return INTERVIEW_ROLES.find((r) => r.id === effectiveRoleId) || null
  }, [effectiveRoleId])

  const handleSelectRole = (role) => {
    setSessionRoleId(role.id)
    localStorage.setItem('careerlaunch_selected_prep_role', role.id)
    navigate(`/interview-preparation/${role.id}`)
  }

  const handleClearRole = () => {
    setSessionRoleId(null)
    localStorage.removeItem('careerlaunch_selected_prep_role')
    navigate('/interview-preparation')
  }

  const displayName = profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Student'
  const userInitials = displayName.charAt(0).toUpperCase()

  return (
    <div className="prep-page">
      {/* 1. Consistent Top Navigation Bar */}
      <nav className="dashboard-nav" aria-label="Interview Preparation Navigation">
        <div className="container dashboard-nav__inner">
          <Link to="/" className="dashboard-brand" aria-label="CareerLaunch Home">
            <div className="dashboard-brand__icon">
              <Compass size={20} strokeWidth={2.4} />
            </div>
            <span className="dashboard-brand__name">
              Career<span>Launch</span>
            </span>
          </Link>

          <div className="dashboard-nav__links">
            <Link to="/dashboard" className="dashboard-nav__link">
              <span>Dashboard</span>
            </Link>
            <Link to="/interview-preparation" className="dashboard-nav__link active">
              <span>Interview Prep</span>
            </Link>
            <Link to="/" className="dashboard-nav__link">
              <span>Platform Overview</span>
            </Link>
          </div>

          <div className="dashboard-nav__user">
            <div className="dashboard-user-pill" title={`Signed in as ${displayName}`}>
              <div className="dashboard-avatar" aria-hidden="true">
                {userInitials}
              </div>
              <div className="dashboard-user-info">
                <span className="dashboard-user-name">{displayName}</span>
                <span className="dashboard-user-role">Student</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="dashboard-signout-btn"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>

          <button
            type="button"
            className="dashboard-nav__mobile-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`dashboard-nav__mobile-menu ${mobileMenuOpen ? 'is-open' : ''}`}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="dashboard-nav__mobile-user">
            <div className="dashboard-avatar" aria-hidden="true">
              {userInitials}
            </div>
            <div className="dashboard-user-info">
              <span className="dashboard-user-name">{displayName}</span>
              <span className="dashboard-user-email">{profile?.email || user?.email}</span>
            </div>
          </div>

          <div className="dashboard-nav__mobile-links">
            <Link
              to="/dashboard"
              className="dashboard-nav__mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/interview-preparation"
              className="dashboard-nav__mobile-link active"
              onClick={() => setMobileMenuOpen(false)}
            >
              Interview Prep
            </Link>
            <Link
              to="/"
              className="dashboard-nav__mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Platform Overview
            </Link>
          </div>

          <div className="dashboard-nav__mobile-actions">
            <button
              type="button"
              onClick={handleSignOut}
              className="dashboard-nav__mobile-signout"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Main Module Container */}
      <main className="prep-main">
        <div className="container prep-container">
          {!activeRole ? (
            /* VIEW 1: Role Selection Landing Page */
            <div>
              {/* Introduction Section */}
              <section className="prep-hero" aria-label="Interview Preparation Introduction">
                <span className="prep-hero__badge">
                  <Sparkles size={13} />
                  <span>Flagship Preparation Module</span>
                </span>
                <h1 className="prep-hero__title">
                  Prepare with <em>purpose.</em>
                </h1>
                <h2 className="prep-hero__subtitle">
                  Build the knowledge, confidence and skills needed for your next interview.
                </h2>
                <p className="prep-hero__desc">
                  Structured technical curricula designed around actual campus hiring rubrics.
                  Choose your target role below to anchor your core preparation baseline, system design
                  fundamentals, and calibrated interview expectations.
                </p>

                <div className="prep-hero__features-row">
                  <div className="prep-feature-pill">
                    <CheckCircle2 size={14} color="var(--color-forest)" />
                    <span>8 Role-Calibrated Tracks</span>
                  </div>
                  <div className="prep-feature-pill">
                    <ShieldCheck size={14} color="var(--color-sage-dark)" />
                    <span>Real Placement Benchmarks</span>
                  </div>
                  <div className="prep-feature-pill">
                    <GraduationCap size={14} color="var(--color-terracotta)" />
                    <span>Stage 1 Foundation Active</span>
                  </div>
                </div>
              </section>

              {/* Personalisation Banner (when student profile has matching target roles) */}
              {!loading && studentTargetRoles.length > 0 && (
                <div className="prep-personalisation-banner" role="status">
                  <div className="prep-personalisation-banner__icon">
                    <Target size={16} />
                  </div>
                  <div>
                    Personalised for your profile: Matching tracks are highlighted based on your stated target role (
                    <strong>{studentTargetRoles.join(', ')}</strong>). You can choose or explore any role at any time.
                  </div>
                </div>
              )}

              {/* Role Selection Section */}
              <section className="prep-roles-section" aria-label="Role Selection">
                <div className="prep-section-header">
                  <h3 className="prep-section-title">Choose your target role</h3>
                  <p className="prep-section-subtitle">
                    Select a specialization track to review its core domain syllabus and establish your preparation anchor.
                  </p>
                </div>

                {/* 8-Card Responsive Grid */}
                <div className="prep-roles-grid">
                  {INTERVIEW_ROLES.map((role) => {
                    const RoleIcon = role.icon
                    const isRecommended = checkRoleMatch(role)

                    return (
                      <article
                        key={role.id}
                        className={`prep-role-card ${isRecommended ? 'is-recommended' : ''}`}
                        aria-label={role.title}
                      >
                        {isRecommended && (
                          <div className="prep-role-card__rec-badge">
                            <Sparkles size={11} />
                            <span>Recommended Target</span>
                          </div>
                        )}

                        <div className="prep-role-card__header">
                          <div className="prep-role-card__icon-wrap">
                            <RoleIcon size={22} />
                          </div>
                          <div className="prep-role-card__title-group">
                            <h4 className="prep-role-card__title">{role.title}</h4>
                            <span className="prep-role-card__subtitle">{role.subtitle}</span>
                          </div>
                        </div>

                        <p className="prep-role-card__desc">{role.description}</p>

                        <div className="prep-role-card__domains">
                          {role.coreDomains.slice(0, 3).map((domain) => (
                            <span key={domain} className="prep-role-domain-pill">
                              {domain}
                            </span>
                          ))}
                        </div>

                        <div className="prep-role-card__action">
                          <button
                            type="button"
                            onClick={() => handleSelectRole(role)}
                            className="prep-role-select-btn"
                            aria-label={`Select ${role.title} preparation track`}
                          >
                            <span>Explore Path</span>
                            <ArrowRight size={14} className="prep-role-select-btn__icon" />
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            </div>
          ) : (
            /* VIEW 2: Next-Stage Role Overview & Track Foundation Placeholder */
            <div className="prep-overview">
              <div className="prep-overview__back-row">
                <button
                  type="button"
                  onClick={handleClearRole}
                  className="prep-back-btn"
                  aria-label="Back to role selection"
                >
                  <ArrowLeft size={15} />
                  <span>Back to all roles</span>
                </button>

                <div className="prep-active-target-badge">
                  <CheckCircle2 size={14} color="var(--color-forest)" />
                  <span>Selected Preparation Track</span>
                </div>
              </div>

              <article className="prep-overview__card">
                <div className="prep-overview__header">
                  <div className="prep-overview__header-left">
                    <div className="prep-overview__icon">
                      <activeRole.icon size={28} />
                    </div>
                    <div>
                      <h2 className="prep-overview__title">{activeRole.title}</h2>
                      <p className="prep-overview__subtitle">{activeRole.subtitle}</p>
                    </div>
                  </div>

                  <div className="prep-overview__badges">
                    {checkRoleMatch(activeRole) && (
                      <span className="prep-role-card__rec-badge" style={{ margin: 0 }}>
                        <Sparkles size={11} />
                        <span>Matches Your Profile Target</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="prep-overview__grid">
                  <div className="prep-overview__main-col">
                    <h3 className="prep-overview__section-title">Track Overview</h3>
                    <p className="prep-overview__desc">{activeRole.description}</p>

                    <h3 className="prep-overview__section-title">Core Competency Domains</h3>
                    <div className="prep-domains-list">
                      {activeRole.coreDomains.map((dom) => (
                        <div key={dom} className="prep-domain-card">
                          <CheckCircle2 size={16} color="var(--color-forest)" />
                          <span>{dom}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stage 1 Foundation Notice */}
                    <div className="prep-foundation-notice">
                      <div className="prep-foundation-notice__header">
                        <GraduationCap size={16} color="var(--color-forest)" />
                        <span>Stage 1 Foundation Active</span>
                      </div>
                      <p className="prep-foundation-notice__text">
                        You have established <strong>{activeRole.title}</strong> as your primary preparation anchor.
                        In Stage 2, role-specific milestone roadmaps, curated algorithmic drill sets, and adaptive
                        AI mock interviews will unlock for this track.
                      </p>
                    </div>
                  </div>

                  <aside className="prep-overview__side">
                    <div className="prep-side-widget">
                      <h4 className="prep-side-widget__title">Track Specifications</h4>
                      <div className="prep-side-widget__row">
                        <span className="prep-side-widget__label">Focus Level:</span>
                        <span className="prep-side-widget__val">Campus &amp; Entry-Level</span>
                      </div>
                      <div className="prep-side-widget__row">
                        <span className="prep-side-widget__label">Core Domains:</span>
                        <span className="prep-side-widget__val">{activeRole.coreDomains.length} Specialized</span>
                      </div>
                      <div className="prep-side-widget__row">
                        <span className="prep-side-widget__label">Status:</span>
                        <span className="prep-side-widget__val" style={{ color: 'var(--color-forest)' }}>
                          Stage 1 Configured
                        </span>
                      </div>
                    </div>

                    <div className="prep-actions-group">
                      <button
                        type="button"
                        onClick={handleClearRole}
                        className="prep-btn-secondary"
                      >
                        <ArrowLeft size={14} />
                        <span>Change Target Role</span>
                      </button>

                      <Link to="/dashboard" className="prep-btn-primary" style={{ textDecoration: 'none' }}>
                        <span>Return to Student Dashboard</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </aside>
                </div>
              </article>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default InterviewPreparationPage
