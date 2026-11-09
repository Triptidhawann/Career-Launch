import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Edit3,
  Layers,
  Sparkles,
  Target,
} from 'lucide-react'
import { getRoadmapByRoleId } from '@/data/interviewRoadmaps'
import { useAuth } from '@/hooks/useAuth'
import { fetchLatestPreparationSession, fetchProfile, savePreparationSetup } from '@/lib/api'
import '@/styles/preparation-setup.css'

const ROLE_ID = 'frontend-developer'
const ROLE_TITLE = 'Frontend Developer'

const TIMELINE_OPTIONS = [
  { value: '1_week', label: '1 Week (Intensive Sprint)' },
  { value: '2_4_weeks', label: '2–4 Weeks (Standard Placement Prep)' },
  { value: '1_2_months', label: '1–2 Months (Deep Conceptual Mastery)' },
  { value: 'custom', label: 'Custom / Self-Paced Schedule' },
]

const GOAL_OPTIONS = [
  { value: 'placement', label: 'Upcoming Campus Placement Drive' },
  { value: 'internship', label: 'Summer / Off-Campus Internship' },
  { value: 'technical_interview', label: 'Technical Interview Round' },
  { value: 'skill_improvement', label: 'Skill Improvement & Personal Mastery' },
]

const EXAMPLE_PROMPT =
  'I want to prepare React.js for a frontend interview. I know HTML, CSS and JavaScript, but I need help with React Hooks, state management and performance.'

export function PreparationSetupPage() {
  const { user } = useAuth()

  // Form State
  const [goalPrompt, setGoalPrompt] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('intermediate')
  const [knownTopics, setKnownTopics] = useState(new Set(['fe-top-1', 'fe-top-2']))
  const [weakTopics, setWeakTopics] = useState(new Set(['fe-top-4']))
  const [preparationTimeline, setPreparationTimeline] = useState('2_4_weeks')
  const [primaryGoal, setPrimaryGoal] = useState('placement')
  const [selectedDirectTopicId, setSelectedDirectTopicId] = useState(null)
  const [showTopicPicker, setShowTopicPicker] = useState(false)

  // Status & Validation State
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [savedSession, setSavedSession] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(null)

  // Load Frontend Curriculum Topics
  const roadmap = getRoadmapByRoleId(ROLE_ID)
  const frontendTopics = []
  if (roadmap?.levels) {
    roadmap.levels.forEach((lvl) => {
      lvl.modules?.forEach((mod) => {
        mod.topics?.forEach((t) => {
          frontendTopics.push({
            id: t.id,
            title: t.title,
            moduleTitle: mod.title,
            estimatedHours: t.estimatedHours || '2-3h',
          })
        })
      })
    })
  }

  // Pre-load student profile and previous session on mount
  useEffect(() => {
    let isMounted = true

    async function loadInitialData() {
      try {
        const [profData, latestSessionData] = await Promise.all([
          fetchProfile().catch(() => null),
          fetchLatestPreparationSession(ROLE_ID).catch(() => null),
        ])

        if (!isMounted) return

        if (profData?.profile) {
          setProfile(profData.profile)
        }

        // If a previously saved session exists for Frontend Developer, prefill it
        if (latestSessionData?.session) {
          const s = latestSessionData.session
          setGoalPrompt(s.goalPrompt || '')
          setExperienceLevel(s.experienceLevel || 'intermediate')
          setKnownTopics(new Set(s.knownTopics || []))
          setWeakTopics(new Set(s.weakTopics || []))
          setPreparationTimeline(s.preparationTimeline || '2_4_weeks')
          setPrimaryGoal(s.primaryGoal || 'placement')
          setSelectedDirectTopicId(s.selectedDirectTopicId || null)
          setSavedSession(s)
        }
      } catch (err) {
        console.warn('Note: Could not preload previous session context:', err)
      }
    }

    loadInitialData()
    return () => {
      isMounted = false
    }
  }, [])

  // Toggle known topics
  const toggleKnownTopic = (topicId) => {
    setKnownTopics((prev) => {
      const next = new Set(prev)
      if (next.has(topicId)) {
        next.delete(topicId)
      } else {
        next.add(topicId)
        // If it was in weak topics, remove from weak
        setWeakTopics((wPrev) => {
          const wNext = new Set(wPrev)
          wNext.delete(topicId)
          return wNext
        })
      }
      return next
    })
  }

  // Toggle weak topics
  const toggleWeakTopic = (topicId) => {
    setWeakTopics((prev) => {
      const next = new Set(prev)
      if (next.has(topicId)) {
        next.delete(topicId)
      } else {
        next.add(topicId)
        // If it was in known topics, remove from known
        setKnownTopics((kPrev) => {
          const kNext = new Set(kPrev)
          kNext.delete(topicId)
          return kNext
        })
      }
      return next
    })
  }

  // Direct Topic Selection shortcut
  const handleSelectDirectTopic = (topic) => {
    setSelectedDirectTopicId(topic.id)
    setShowTopicPicker(false)
    setWeakTopics((prev) => new Set([...prev, topic.id]))
    setGoalPrompt(
      `I want an intensive, interview-calibrated preparation focus on "${topic.title}". I want to master its core mechanisms, edge cases, and typical interview questions.`
    )
  }

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmed = goalPrompt.trim()
    if (trimmed.length < 5) {
      setErrorMessage('Please provide a goal prompt of at least 5 characters describing what you want to prepare.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        roleId: ROLE_ID,
        goalPrompt: trimmed,
        experienceLevel,
        knownTopics: Array.from(knownTopics),
        weakTopics: Array.from(weakTopics),
        preparationTimeline,
        primaryGoal,
        selectedDirectTopicId,
      }

      const res = await savePreparationSetup(payload)
      if (res?.success && res.session) {
        setSavedSession(res.session)
        setIsEditing(false)
      } else {
        throw new Error(res?.error || 'Failed to save preparation setup.')
      }
    } catch (err) {
      console.error('Error saving preparation setup:', err)
      setErrorMessage(err.message || 'An unexpected error occurred while saving your setup.')
    } finally {
      setSubmitting(false)
    }
  }

  const displayName = profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Candidate'
  const userInitials = displayName.charAt(0).toUpperCase()

  // ---------------------------------------------------------------------------
  // RENDER: Saved Confirmation View (Phase B1 Specific)
  // ---------------------------------------------------------------------------
  if (savedSession && !isEditing) {
    const selectedTimelineLabel =
      TIMELINE_OPTIONS.find((t) => t.value === savedSession.preparationTimeline)?.label || savedSession.preparationTimeline
    const selectedGoalLabel =
      GOAL_OPTIONS.find((g) => g.value === savedSession.primaryGoal)?.label || savedSession.primaryGoal

    return (
      <div className="prep-setup-container">
        {/* Topbar */}
        <header className="prep-setup-topbar">
          <Link to="/" className="prep-setup-topbar__brand">
            <span>CareerLaunch</span>
            <span className="prep-setup-topbar__role-pill">
              <Sparkles size={11} />
              <span>{ROLE_TITLE}</span>
            </span>
          </Link>
          <div className="prep-setup-topbar__user">
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal-muted)' }}>{displayName}</span>
            <div className="prep-setup-topbar__avatar">{userInitials}</div>
          </div>
        </header>

        <main className="prep-setup-main">
          {/* Breadcrumbs */}
          <nav className="prep-setup-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/interview-preparation">Interview Prep</Link>
            <span>/</span>
            <Link to={`/interview-preparation/${ROLE_ID}`}>{ROLE_TITLE}</Link>
            <span>/</span>
            <span className="prep-setup-breadcrumbs__current">Preparation Setup</span>
          </nav>

          <article className="prep-setup-saved-card">
            <div className="prep-setup-saved-badge">
              <CheckCircle2 size={13} />
              <span>Preparation Setup Saved</span>
            </div>

            <h1 className="prep-setup-saved-title">Your Preparation Setup is Saved!</h1>
            <p className="prep-setup-saved-desc">
              Your personalized goals and technical baseline have been securely recorded. In the upcoming Phase B2,
              CareerLaunch&apos;s AI curriculum orchestrator will synthesize these preferences into an interactive milestone schedule.
            </p>

            {/* Pending Generation Phase Notice */}
            <div className="prep-setup-phase-notice">
              <h4>Phase B1 Milestone Reached: Personalised Intake Complete</h4>
              <p>
                Your setup data is now persisted in your student profile. No mock or premature AI plan generation is triggered in this phase.
                You can review what was saved below, edit your setup, or explore the full Frontend Developer roadmap.
              </p>
            </div>

            {/* Summary Data Grid */}
            <div className="prep-setup-summary-grid">
              <div className="prep-setup-summary-item">
                <div className="prep-setup-summary-item__label">Target Track</div>
                <div className="prep-setup-summary-item__value">{ROLE_TITLE}</div>
              </div>

              <div className="prep-setup-summary-item">
                <div className="prep-setup-summary-item__label">Experience Level</div>
                <div className="prep-setup-summary-item__value" style={{ textTransform: 'capitalize' }}>
                  {savedSession.experienceLevel}
                </div>
              </div>

              <div className="prep-setup-summary-item">
                <div className="prep-setup-summary-item__label">Preparation Timeline</div>
                <div className="prep-setup-summary-item__value">{selectedTimelineLabel}</div>
              </div>

              <div className="prep-setup-summary-item">
                <div className="prep-setup-summary-item__label">Primary Goal</div>
                <div className="prep-setup-summary-item__value">{selectedGoalLabel}</div>
              </div>

              <div className="prep-setup-summary-item">
                <div className="prep-setup-summary-item__label">Known Topics Baseline</div>
                <div className="prep-setup-summary-item__value">
                  {savedSession.knownTopics?.length || 0} topics marked familiar
                </div>
              </div>

              <div className="prep-setup-summary-item">
                <div className="prep-setup-summary-item__label">Priority Challenge Areas</div>
                <div className="prep-setup-summary-item__value">
                  {savedSession.weakTopics?.length || 0} topics flagged for mastery
                </div>
              </div>

              <div className="prep-setup-summary-prompt">
                <div className="prep-setup-summary-item__label">Saved Preparation Goal Prompt</div>
                <p>&ldquo;{savedSession.goalPrompt}&rdquo;</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="prep-setup-actions">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="prep-setup-btn-primary"
              >
                <Edit3 size={15} />
                <span>Edit Preparation Setup</span>
              </button>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link
                  to={`/interview-preparation/${ROLE_ID}`}
                  className="prep-setup-btn-secondary"
                >
                  <BookOpen size={14} />
                  <span>Explore Full Frontend Roadmap</span>
                </Link>
                <Link to="/dashboard" className="prep-setup-btn-secondary">
                  <span>Return to Dashboard</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </article>
        </main>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // RENDER: Preparation Setup Intake Form
  // ---------------------------------------------------------------------------
  return (
    <div className="prep-setup-container">
      {/* Topbar */}
      <header className="prep-setup-topbar">
        <Link to="/" className="prep-setup-topbar__brand">
          <span>CareerLaunch</span>
          <span className="prep-setup-topbar__role-pill">
            <Sparkles size={11} />
            <span>{ROLE_TITLE}</span>
          </span>
        </Link>
        <div className="prep-setup-topbar__user">
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal-muted)' }}>{displayName}</span>
          <div className="prep-setup-topbar__avatar">{userInitials}</div>
        </div>
      </header>

      <main className="prep-setup-main">
        {/* Breadcrumbs */}
        <nav className="prep-setup-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/interview-preparation">Interview Prep</Link>
          <span>/</span>
          <Link to={`/interview-preparation/${ROLE_ID}`}>{ROLE_TITLE}</Link>
          <span>/</span>
          <span className="prep-setup-breadcrumbs__current">Preparation Setup</span>
        </nav>

        {/* Hero Section */}
        <section className="prep-setup-hero">
          <span className="prep-setup-hero__badge">
            <Compass size={12} />
            <span>{ROLE_TITLE} Specialization Track</span>
          </span>
          <h1 className="prep-setup-hero__title">Let&apos;s build your interview preparation plan.</h1>
          <p className="prep-setup-hero__desc">
            Tell us about your upcoming interview targets, existing background, and challenge areas.
            We will calibrate an optimal learning itinerary tailored specifically to your timeline and goals.
          </p>
        </section>

        {/* Shortcut: Choose a Topic Instead */}
        <div className="prep-setup-shortcut">
          <div className="prep-setup-shortcut__left">
            <div className="prep-setup-shortcut__icon">
              <Layers size={18} />
            </div>
            <div className="prep-setup-shortcut__text">
              <h4>Want to prepare for a single specific topic instead?</h4>
              <p>Skip the broad track setup and jump directly into an intensive topic session.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowTopicPicker((prev) => !prev)}
            className="prep-setup-shortcut__btn"
          >
            <BookOpen size={13} />
            <span>{showTopicPicker ? 'Hide Topics' : 'Choose a topic instead'}</span>
          </button>
        </div>

        {/* Topic Picker Drawer (Conditional) */}
        {showTopicPicker && (
          <div className="prep-setup-topic-picker" role="region" aria-label="Frontend Curriculum Topic Picker">
            <div className="prep-setup-topic-picker__header">
              <h4 className="prep-setup-topic-picker__title">Select a Frontend Topic to Anchor Your Setup</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-charcoal-muted)' }}>
                17 Topics Available
              </span>
            </div>
            <div className="prep-setup-topic-picker__grid">
              {frontendTopics.map((topic) => {
                const isSelected = selectedDirectTopicId === topic.id
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleSelectDirectTopic(topic)}
                    className={`prep-setup-topic-item ${isSelected ? 'prep-setup-topic-item--selected' : ''}`}
                  >
                    <span>{topic.title}</span>
                    {isSelected && <Check size={13} />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="prep-setup-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="prep-setup-card" noValidate>
          {/* Field 1: Goal Prompt */}
          <div className="prep-setup-field">
            <label htmlFor="goalPrompt" className="prep-setup-label">
              1. What would you like to prepare for?
              <span className="prep-setup-label__req">*</span>
            </label>
            <p className="prep-setup-hint">
              Be specific about your interview timeline, target companies, or areas where you struggle.
            </p>

            <div className="prep-setup-textarea-wrap">
              <textarea
                id="goalPrompt"
                rows={4}
                value={goalPrompt}
                onChange={(e) => setGoalPrompt(e.target.value)}
                placeholder="I want to prepare React.js for a frontend interview. I know HTML, CSS and JavaScript, but I need help with React Hooks, state management and performance."
                className={`prep-setup-textarea ${errorMessage && goalPrompt.trim().length < 5 ? 'prep-setup-textarea--error' : ''}`}
                maxLength={2000}
                required
              />
              <div className="prep-setup-textarea-meta">
                <span>Min 5 characters</span>
                <span>{goalPrompt.length} / 2000</span>
              </div>
            </div>

            {/* Clickable Example Pill */}
            <div className="prep-setup-example">
              <span className="prep-setup-example__text">
                &ldquo;{EXAMPLE_PROMPT}&rdquo;
              </span>
              <button
                type="button"
                onClick={() => setGoalPrompt(EXAMPLE_PROMPT)}
                className="prep-setup-example__btn"
              >
                Use this example
              </button>
            </div>
          </div>

          {/* Field 2: Experience Level */}
          <div className="prep-setup-field">
            <span className="prep-setup-label">2. Current Experience Level</span>
            <p className="prep-setup-hint">
              Helps calibrate foundational explanations vs deep architectural trade-offs.
            </p>
            <div className="prep-setup-radio-grid">
              <div
                className={`prep-setup-radio-card ${experienceLevel === 'beginner' ? 'prep-setup-radio-card--active' : ''}`}
                onClick={() => setExperienceLevel('beginner')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === ' ' && setExperienceLevel('beginner')}
              >
                <div className="prep-setup-radio-card__title">Beginner</div>
                <p className="prep-setup-radio-card__desc">
                  Core HTML/CSS semantics, basic JavaScript syntax, college curriculum baseline.
                </p>
              </div>

              <div
                className={`prep-setup-radio-card ${experienceLevel === 'intermediate' ? 'prep-setup-radio-card--active' : ''}`}
                onClick={() => setExperienceLevel('intermediate')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === ' ' && setExperienceLevel('intermediate')}
              >
                <div className="prep-setup-radio-card__title">Intermediate</div>
                <p className="prep-setup-radio-card__desc">
                  Built modern web projects, familiar with React, DOM APIs, and REST integrations.
                </p>
              </div>

              <div
                className={`prep-setup-radio-card ${experienceLevel === 'advanced' ? 'prep-setup-radio-card--active' : ''}`}
                onClick={() => setExperienceLevel('advanced')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === ' ' && setExperienceLevel('advanced')}
              >
                <div className="prep-setup-radio-card__title">Advanced</div>
                <p className="prep-setup-radio-card__desc">
                  Production engineering experience, performance optimization, and system design.
                </p>
              </div>
            </div>
          </div>

          {/* Field 3: Topics Already Known */}
          <div className="prep-setup-field">
            <span className="prep-setup-label">
              3. Topics You Already Know (Select all that apply)
            </span>
            <p className="prep-setup-hint">
              Topics marked here will be condensed into quick revision milestones.
            </p>
            <div className="prep-setup-chips-container">
              {frontendTopics.map((topic) => {
                const isKnown = knownTopics.has(topic.id)
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => toggleKnownTopic(topic.id)}
                    className={`prep-setup-chip ${isKnown ? 'prep-setup-chip--selected-known' : ''}`}
                  >
                    {isKnown && <Check size={12} />}
                    <span>{topic.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Field 4: Topics Struggling With */}
          <div className="prep-setup-field">
            <span className="prep-setup-label">
              4. Weak Areas / Topics to Emphasize (Select all that apply)
            </span>
            <p className="prep-setup-hint">
              We will allocate extra practice, cross-questioning, and deep-dive examples here.
            </p>
            <div className="prep-setup-chips-container">
              {frontendTopics.map((topic) => {
                const isWeak = weakTopics.has(topic.id)
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => toggleWeakTopic(topic.id)}
                    className={`prep-setup-chip ${isWeak ? 'prep-setup-chip--selected-weak' : ''}`}
                  >
                    {isWeak && <Target size={12} />}
                    <span>{topic.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fields 5 & 6: Timeline & Primary Goal (Split Row) */}
          <div className="prep-setup-split-row prep-setup-field">
            <div>
              <label htmlFor="timelineSelect" className="prep-setup-label">
                5. Preparation Timeline
              </label>
              <select
                id="timelineSelect"
                value={preparationTimeline}
                onChange={(e) => setPreparationTimeline(e.target.value)}
                className="prep-setup-select"
              >
                {TIMELINE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="goalSelect" className="prep-setup-label">
                6. Primary Goal
              </label>
              <select
                id="goalSelect"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="prep-setup-select"
              >
                {GOAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Footer */}
          <div className="prep-setup-actions">
            <Link
              to={`/interview-preparation/${ROLE_ID}`}
              className="prep-setup-btn-secondary"
            >
              <ArrowLeft size={14} />
              <span>Browse Full Curriculum Roadmap Instead</span>
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="prep-setup-btn-primary"
            >
              {submitting ? (
                <>
                  <Clock size={15} className="spin" />
                  <span>Saving Setup...</span>
                </>
              ) : (
                <>
                  <span>Create My Preparation Plan</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
