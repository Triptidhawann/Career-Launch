import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  GraduationCap,
  Layers,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import { INTERVIEW_ROLES } from '@/data/interviewRoles'
import { getRoadmapByRoleId, getTopicById } from '@/data/interviewRoadmaps'
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

  // Local storage session role
  const [sessionRoleId, setSessionRoleId] = useState(() => {
    return localStorage.getItem('careerlaunch_selected_prep_role') || null
  })

  // URL route parameters
  const currentRoleId = params.roleId || null
  const currentTopicId = params.topicId || null

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

  // Sync localStorage when route has roleId
  useEffect(() => {
    if (currentRoleId) {
      localStorage.setItem('careerlaunch_selected_prep_role', currentRoleId)
    }
  }, [currentRoleId])

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

  // Look up role data from catalog and roadmap repository
  const roleMeta = useMemo(() => {
    if (!currentRoleId) return null
    return INTERVIEW_ROLES.find((r) => r.id === currentRoleId) || null
  }, [currentRoleId])

  const roadmapData = useMemo(() => {
    if (!currentRoleId) return null
    return getRoadmapByRoleId(currentRoleId)
  }, [currentRoleId])

  // Look up specific topic if deep-linked
  const topicData = useMemo(() => {
    if (!currentRoleId || !currentTopicId) return null
    return getTopicById(currentRoleId, currentTopicId)
  }, [currentRoleId, currentTopicId])

  // Track collapsed modules for accordions (default is all expanded)
  const [collapsedModules, setCollapsedModules] = useState(() => new Set())

  const toggleModule = (moduleId) => {
    setCollapsedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const allModuleIds = useMemo(() => {
    if (!roadmapData?.levels) return []
    const ids = []
    roadmapData.levels.forEach((lvl) => {
      lvl.modules?.forEach((m) => ids.push(m.id))
    })
    return ids
  }, [roadmapData])

  const areAllExpanded = collapsedModules.size === 0

  const handleToggleAll = () => {
    if (areAllExpanded) {
      setCollapsedModules(new Set(allModuleIds))
    } else {
      setCollapsedModules(new Set())
    }
  }

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

  // Calculate stats for roadmap summary strip
  const totalModulesCount = allModuleIds.length
  const totalTopicsCount = useMemo(() => {
    if (!roadmapData?.levels) return 0
    let count = 0
    roadmapData.levels.forEach((lvl) => {
      lvl.modules?.forEach((m) => {
        count += m.topics?.length || 0
      })
    })
    return count
  }, [roadmapData])

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

      {/* 2. Main Content Area */}
      <main className="prep-main">
        <div className="container prep-container">
          {/* SCENARIO A: No role selected in URL -> Landing Page */}
          {!currentRoleId && (
            <div>
              {/* Active Role Indicator Banner if previously chosen */}
              {sessionRoleId && (
                <div className="prep-active-banner">
                  <div className="prep-active-banner__info">
                    <div className="prep-active-banner__icon">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <div className="prep-active-banner__label">Resume Active Preparation Track</div>
                      <h3 className="prep-active-banner__title">
                        {INTERVIEW_ROLES.find((r) => r.id === sessionRoleId)?.title || sessionRoleId}
                      </h3>
                    </div>
                  </div>
                  <div className="prep-active-banner__actions">
                    <Link
                      to={`/interview-preparation/${sessionRoleId}`}
                      className="prep-btn-primary"
                      style={{ textDecoration: 'none' }}
                    >
                      <span>Continue Roadmap</span>
                      <ArrowRight size={14} />
                    </Link>
                    <button
                      type="button"
                      onClick={handleClearRole}
                      className="prep-btn-secondary"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

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
                    <ShieldCheck size={14} color="var(--color-forest)" />
                    <span>56 Specialized Modules</span>
                  </div>
                  <div className="prep-feature-pill">
                    <Layers size={14} color="var(--color-terracotta)" />
                    <span>117 Curated Technical Topics</span>
                  </div>
                </div>
              </section>

              {/* Personalisation Banner */}
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

              {/* Role Selection Grid */}
              <section className="prep-roles-section" aria-label="Role Selection">
                <div className="prep-roles-section__header">
                  <h3 className="prep-roles-section__title">Choose your target role</h3>
                  <p className="prep-roles-section__desc">
                    Select a specialization track to review its core domain syllabus, milestone roadmap, and learning objectives.
                  </p>
                </div>

                <div className="prep-roles-grid">
                  {INTERVIEW_ROLES.map((role) => {
                    const RoleIcon = role.icon
                    const isRecommended = checkRoleMatch(role)
                    const isCurrentActive = sessionRoleId === role.id

                    return (
                      <article
                        key={role.id}
                        className={`prep-role-card ${isCurrentActive ? 'prep-role-card--active' : ''}`}
                        onClick={() => handleSelectRole(role)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleSelectRole(role)
                          }
                        }}
                        aria-label={role.title}
                      >
                        <div className="prep-role-card__top">
                          <div className="prep-role-card__icon-wrap">
                            <RoleIcon size={22} />
                          </div>
                          {isRecommended && (
                            <span className="prep-role-card__match-badge">
                              <Sparkles size={10} />
                              <span>Recommended</span>
                            </span>
                          )}
                        </div>

                        <h4 className="prep-role-card__title">{role.title}</h4>
                        <p className="prep-role-card__desc">{role.description}</p>

                        <div className="prep-role-card__footer">
                          <span className="prep-role-card__action-text">
                            <span>Explore Roadmap</span>
                            <ArrowRight size={13} />
                          </span>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            </div>
          )}

          {/* SCENARIO B: Invalid roleId in URL -> 404 Fallback Card */}
          {currentRoleId && !roadmapData && (
            <div className="prep-not-found-card" role="alert">
              <div className="not-found-icon">
                <AlertTriangle size={28} />
              </div>
              <h2 className="not-found-title">Preparation Track Not Found</h2>
              <p className="not-found-desc">
                We could not find an interview preparation curriculum for the role identifier &ldquo;{currentRoleId}&rdquo;.
                Please return to the role catalog to select an active specialization track.
              </p>
              <Link to="/interview-preparation" className="prep-btn-primary" style={{ textDecoration: 'none' }}>
                <ArrowLeft size={14} />
                <span>Browse All 8 Preparation Tracks</span>
              </Link>
            </div>
          )}

          {/* SCENARIO C: Valid roleId with specific topicId -> Topic Overview View */}
          {currentRoleId && roadmapData && currentTopicId && (
            <div className="topic-overview-container">
              {/* Breadcrumb Navigation */}
              <nav className="prep-breadcrumbs" aria-label="Breadcrumb">
                <Link to="/interview-preparation" className="breadcrumb-link">
                  Interview Prep
                </Link>
                <span className="breadcrumb-separator">/</span>
                <Link to={`/interview-preparation/${currentRoleId}`} className="breadcrumb-link">
                  {roadmapData.roleTitle}
                </Link>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">
                  {topicData ? topicData.topic.title : 'Topic Overview'}
                </span>
              </nav>

              {!topicData ? (
                <div className="prep-not-found-card" role="alert">
                  <div className="not-found-icon">
                    <AlertTriangle size={28} />
                  </div>
                  <h2 className="not-found-title">Topic Not Found</h2>
                  <p className="not-found-desc">
                    The requested topic ID &ldquo;{currentTopicId}&rdquo; was not found in the {roadmapData.roleTitle} curriculum.
                  </p>
                  <Link
                    to={`/interview-preparation/${currentRoleId}`}
                    className="prep-btn-primary"
                    style={{ textDecoration: 'none' }}
                  >
                    <ArrowLeft size={14} />
                    <span>Return to {roadmapData.roleTitle} Roadmap</span>
                  </Link>
                </div>
              ) : (
                <article className="topic-overview-card">
                  <div className="topic-overview-header">
                    <span className="topic-hierarchy-pill">
                      {topicData.level.title} &bull; {topicData.module.title}
                    </span>
                    <h1 className="topic-overview-title">{topicData.topic.title}</h1>

                    <div className="topic-overview-meta">
                      <div className="topic-meta-item">
                        <Clock size={15} />
                        <span>Estimated Study Time: <strong>{topicData.topic.estimatedHours}</strong></span>
                      </div>
                      <div className="topic-meta-item">
                        <Layers size={15} />
                        <span>Module: <strong>{topicData.module.title}</strong></span>
                      </div>
                      {topicData.module.prerequisites && (
                        <div className="topic-meta-item">
                          <ShieldCheck size={15} />
                          <span>Prerequisites: <strong>{topicData.module.prerequisites}</strong></span>
                        </div>
                      )}
                    </div>

                    <p className="topic-overview-desc">{topicData.topic.description}</p>
                  </div>

                  <div className="topic-section-divider" />

                  {/* Key Concepts */}
                  {topicData.topic.keyConcepts && topicData.topic.keyConcepts.length > 0 && (
                    <section aria-label="Key Concepts">
                      <h3 className="topic-section-title">
                        <BookOpen size={16} />
                        <span>Key Concepts to Understand</span>
                      </h3>
                      <div className="topic-concepts-container">
                        {topicData.topic.keyConcepts.map((concept) => (
                          <span key={concept} className="topic-concept-pill">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Learning Objectives Checklist */}
                  {topicData.topic.objectives && topicData.topic.objectives.length > 0 && (
                    <section aria-label="Learning Objectives">
                      <h3 className="topic-section-title">
                        <Target size={16} />
                        <span>Milestone Learning Objectives</span>
                      </h3>
                      <ul className="topic-objectives-checklist">
                        {topicData.topic.objectives.map((obj, i) => (
                          <li key={i} className="topic-objective-row">
                            <CheckCircle2 size={18} className="topic-check-icon" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Stage 2 Architecture Notice */}
                  <div className="stage2-architecture-notice">
                    <div className="stage2-notice-icon">
                      <GraduationCap size={22} />
                    </div>
                    <div className="stage2-notice-content">
                      <h4>Stage 2 Architecture: Milestone Specification Established</h4>
                      <p>
                        This topic is registered as a verified preparation milestone for the{' '}
                        <strong>{roadmapData.roleTitle}</strong> curriculum. In Stage 3, in-depth interactive study modules,
                        conceptual drill sets, and calibrated interview questions will be connected to this topic.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="topic-actions-row">
                    <Link
                      to={`/interview-preparation/${currentRoleId}`}
                      className="prep-btn-secondary"
                      style={{ textDecoration: 'none' }}
                    >
                      <ArrowLeft size={14} />
                      <span>Back to {roadmapData.roleTitle} Roadmap</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      className="prep-btn-primary"
                      style={{ textDecoration: 'none' }}
                    >
                      <span>Return to Dashboard</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              )}
            </div>
          )}

          {/* SCENARIO D: Valid roleId with NO topicId -> Role Roadmap View */}
          {currentRoleId && roadmapData && !currentTopicId && (
            <div className="roadmap-view">
              {/* Breadcrumb Navigation */}
              <nav className="prep-breadcrumbs" aria-label="Breadcrumb">
                <Link to="/interview-preparation" className="breadcrumb-link">
                  Interview Prep
                </Link>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">{roadmapData.roleTitle}</span>
              </nav>

              {/* Role Hero Card */}
              <article className="roadmap-hero">
                <div className="roadmap-hero__header">
                  <div style={{ flex: 1 }}>
                    <div className="roadmap-hero__meta">
                      <span className="roadmap-hero__badge">
                        <Sparkles size={11} />
                        <span>Role Preparation Track</span>
                      </span>
                      {roleMeta && checkRoleMatch(roleMeta) && (
                        <span className="prep-role-card__match-badge" style={{ margin: 0 }}>
                          <Target size={11} />
                          <span>Target Role Match</span>
                        </span>
                      )}
                    </div>
                    <h1 className="roadmap-hero__title">{roadmapData.roleTitle}</h1>
                    <div className="roadmap-hero__subtitle">{roadmapData.subtitle}</div>
                    <p className="roadmap-hero__overview">{roadmapData.overview}</p>
                  </div>

                  <Link
                    to="/interview-preparation"
                    className="roadmap-hero__switch-btn"
                  >
                    <span>Change Target Role</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* Target Role Objectives */}
                {roadmapData.learningObjectives && roadmapData.learningObjectives.length > 0 && (
                  <div className="roadmap-objectives-card">
                    <h3 className="roadmap-objectives-title">
                      <Target size={15} />
                      <span>Target Track Competencies</span>
                    </h3>
                    <ul className="roadmap-objectives-list">
                      {roadmapData.learningObjectives.map((obj, i) => (
                        <li key={i} className="roadmap-objective-item">
                          <CheckCircle2 size={16} className="roadmap-objective-icon" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>

              {/* Summary Strip */}
              <div className="roadmap-summary-strip">
                <div className="roadmap-summary-stats">
                  <div className="roadmap-stat">
                    <span className="roadmap-stat__value">3</span>
                    <span className="roadmap-stat__label">Levels</span>
                  </div>
                  <div className="roadmap-stat">
                    <span className="roadmap-stat__value">{totalModulesCount}</span>
                    <span className="roadmap-stat__label">Modules</span>
                  </div>
                  <div className="roadmap-stat">
                    <span className="roadmap-stat__value">{totalTopicsCount}</span>
                    <span className="roadmap-stat__label">Technical Topics</span>
                  </div>
                  <div className="roadmap-stat">
                    <span className="roadmap-stat__value">16-24</span>
                    <span className="roadmap-stat__label">Est. Weeks</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleAll}
                  className="roadmap-toggle-btn"
                  aria-label={areAllExpanded ? 'Collapse all modules' : 'Expand all modules'}
                >
                  <Layers size={14} />
                  <span>{areAllExpanded ? 'Collapse All Modules' : 'Expand All Modules'}</span>
                </button>
              </div>

              {/* 3 Level Sections */}
              <div className="roadmap-levels-container">
                {roadmapData.levels.map((level) => {
                  return (
                    <section
                      key={level.id}
                      className="roadmap-level-section"
                      aria-labelledby={`level-heading-${level.id}`}
                    >
                      {/* Level Header */}
                      <div className="roadmap-level-header">
                        <div className="roadmap-level-header__left">
                          <span className={`level-badge level-badge--${level.id}`}>
                            {level.id.toUpperCase()}
                          </span>
                          <h2 id={`level-heading-${level.id}`} className="level-title">
                            {level.title}
                          </h2>
                          <span className="level-desc">&bull; {level.description}</span>
                        </div>
                        <span className="level-time-badge">
                          <Clock size={13} />
                          <span>{level.estimatedTime}</span>
                        </span>
                      </div>

                      {/* Modules Accordion List */}
                      <div className="roadmap-modules-list">
                        {level.modules.map((mod, modIdx) => {
                          const isExpanded = !collapsedModules.has(mod.id)
                          const moduleNumber = String(modIdx + 1).padStart(2, '0')

                          return (
                            <div
                              key={mod.id}
                              className={`roadmap-module-card ${isExpanded ? 'roadmap-module-card--expanded' : ''}`}
                            >
                              {/* Module Accordion Trigger */}
                              <button
                                type="button"
                                className="roadmap-module-header"
                                onClick={() => toggleModule(mod.id)}
                                aria-expanded={isExpanded}
                                aria-controls={`module-content-${mod.id}`}
                              >
                                <div className="roadmap-module-header__left">
                                  <span className="module-number-badge">{moduleNumber}</span>
                                  <h3 className="module-title">{mod.title}</h3>
                                </div>

                                <div className="roadmap-module-header__right">
                                  <span className="module-meta-pill">
                                    <BookOpen size={12} />
                                    <span>{mod.topics?.length || 0} Topics</span>
                                  </span>
                                  <span className="module-meta-pill">
                                    <Clock size={12} />
                                    <span>{mod.estimatedTime}</span>
                                  </span>
                                  <ChevronDown size={18} className="module-chevron" />
                                </div>
                              </button>

                              {/* Module Body */}
                              {isExpanded && (
                                <div id={`module-content-${mod.id}`} className="roadmap-module-body">
                                  <div className="roadmap-module-info">
                                    <p className="module-desc">{mod.description}</p>
                                    {mod.prerequisites && (
                                      <span className="module-prereq-badge">
                                        <ShieldCheck size={13} />
                                        <span>Prerequisite: {mod.prerequisites}</span>
                                      </span>
                                    )}
                                  </div>

                                  {/* Topics Grid */}
                                  <div className="roadmap-topics-grid">
                                    {mod.topics.map((topic) => (
                                      <div
                                        key={topic.id}
                                        className="roadmap-topic-card"
                                        onClick={() =>
                                          navigate(
                                            `/interview-preparation/${currentRoleId}/topic/${topic.id}`
                                          )
                                        }
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            navigate(
                                              `/interview-preparation/${currentRoleId}/topic/${topic.id}`
                                            )
                                          }
                                        }}
                                        aria-label={`Explore topic: ${topic.title}`}
                                      >
                                        <div className="topic-card-header">
                                          <h4 className="topic-card-title">{topic.title}</h4>
                                          <span className="topic-card-time">{topic.estimatedHours}</span>
                                        </div>

                                        <p className="topic-card-desc">{topic.description}</p>

                                        {topic.keyConcepts && topic.keyConcepts.length > 0 && (
                                          <div className="topic-key-concepts">
                                            {topic.keyConcepts.slice(0, 4).map((concept) => (
                                              <span key={concept} className="concept-tag">
                                                {concept}
                                              </span>
                                            ))}
                                          </div>
                                        )}

                                        <div className="topic-card-footer">
                                          <span className="topic-explore-btn">
                                            <span>Topic Details &amp; Objectives</span>
                                            <ArrowRight size={12} />
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default InterviewPreparationPage
