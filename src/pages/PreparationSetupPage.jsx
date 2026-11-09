import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Edit3,
  Plus,
  Search,
  Sparkles,
  X,
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

// Extract all 17 Frontend Curriculum Topics from authoritative roadmap at module load
const frontendRoadmap = getRoadmapByRoleId(ROLE_ID)
const allCurriculumTopics = []
if (frontendRoadmap?.levels) {
  frontendRoadmap.levels.forEach((lvl) => {
    lvl.modules?.forEach((mod) => {
      mod.topics?.forEach((t) => {
        allCurriculumTopics.push({
          topicId: t.id,
          title: t.title,
          moduleTitle: mod.title,
          source: 'curriculum',
        })
      })
    })
  })
}

export function PreparationSetupPage() {
  const { user } = useAuth()

  // Form State
  const [goalPrompt, setGoalPrompt] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('intermediate')
  const [preparationTimeline, setPreparationTimeline] = useState('2_4_weeks')
  const [primaryGoal, setPrimaryGoal] = useState('placement')

  // Searchable Multi-Select Topics State
  const [officialTopics, setOfficialTopics] = useState([])
  const [customTopics, setCustomTopics] = useState([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customTopicInput, setCustomTopicInput] = useState('')
  const [customTopicError, setCustomTopicError] = useState(null)

  // Status & Validation State
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [savedSession, setSavedSession] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(null)

  const dropdownRef = useRef(null)



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
          setPreparationTimeline(s.preparationTimeline || '2_4_weeks')
          setPrimaryGoal(s.primaryGoal || 'placement')

          // Restore official & custom topics
          if (Array.isArray(s.officialTopics) && s.officialTopics.length > 0) {
            setOfficialTopics(s.officialTopics)
          } else if (Array.isArray(s.knownTopics) && s.knownTopics.length > 0) {
            // Backward-compatibility: map legacy knownTopics
            const mapped = allCurriculumTopics.filter((ct) => s.knownTopics.includes(ct.topicId))
            setOfficialTopics(mapped)
          }

          if (Array.isArray(s.customTopics)) {
            setCustomTopics(s.customTopics)
          }

          setSavedSession(s)
        } else {
          // Default selection if no previous session: first two core topics
          setOfficialTopics([
            allCurriculumTopics[0] || { topicId: 'fe-top-1', title: 'Semantic Markup & Accessibility Outlines', source: 'curriculum' },
            allCurriculumTopics[1] || { topicId: 'fe-top-2', title: 'CSS Box Model, Flexbox & Grid Systems', source: 'curriculum' },
          ])
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

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDropdownOpen])

  // Filter curriculum topics based on search query
  const filteredCurriculumTopics = allCurriculumTopics.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Toggle official curriculum topic
  const toggleOfficialTopic = (topic) => {
    setOfficialTopics((prev) => {
      const exists = prev.some((t) => t.topicId === topic.topicId)
      if (exists) {
        return prev.filter((t) => t.topicId !== topic.topicId)
      } else {
        return [...prev, { topicId: topic.topicId, title: topic.title, source: 'curriculum' }]
      }
    })
  }

  // Remove official topic
  const removeOfficialTopic = (topicId) => {
    setOfficialTopics((prev) => prev.filter((t) => t.topicId !== topicId))
  }

  // Remove custom topic
  const removeCustomTopic = (title) => {
    setCustomTopics((prev) => prev.filter((t) => t.title.toLowerCase() !== title.toLowerCase()))
  }

  // Clear all selected topics
  const handleClearAllTopics = () => {
    setOfficialTopics([])
    setCustomTopics([])
  }

  // Add custom student topic ("Other — Add my own topic")
  const handleAddCustomTopic = (e) => {
    if (e) e.preventDefault()
    setCustomTopicError(null)

    const trimmed = customTopicInput.trim()
    if (!trimmed) {
      setCustomTopicError('Please enter a topic name.')
      return
    }

    if (trimmed.length > 100) {
      setCustomTopicError('Topic name must be 100 characters or fewer.')
      return
    }

    const lower = trimmed.toLowerCase()

    // Duplicate check in official curriculum
    const existsInOfficial = allCurriculumTopics.some((t) => t.title.toLowerCase() === lower)
    if (existsInOfficial) {
      // Auto-select in official topics instead of adding as custom
      const matched = allCurriculumTopics.find((t) => t.title.toLowerCase() === lower)
      if (!officialTopics.some((t) => t.topicId === matched.topicId)) {
        setOfficialTopics((prev) => [...prev, matched])
      }
      setCustomTopicInput('')
      return
    }

    // Duplicate check in existing custom topics
    const existsInCustom = customTopics.some((t) => t.title.toLowerCase() === lower)
    if (existsInCustom) {
      setCustomTopicError('This topic has already been added.')
      return
    }

    // Add new custom topic
    setCustomTopics((prev) => [...prev, { title: trimmed, source: 'student_custom' }])
    setCustomTopicInput('')
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
        officialTopics,
        customTopics,
        knownTopics: officialTopics.map((t) => t.topicId),
        weakTopics: [],
        preparationTimeline,
        primaryGoal,
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
  const totalSelectedCount = officialTopics.length + customTopics.length

  // ---------------------------------------------------------------------------
  // RENDER: Saved Confirmation View (Phase B1 Specific)
  // ---------------------------------------------------------------------------
  if (savedSession && !isEditing) {
    const selectedTimelineLabel =
      TIMELINE_OPTIONS.find((t) => t.value === savedSession.preparationTimeline)?.label || savedSession.preparationTimeline
    const selectedGoalLabel =
      GOAL_OPTIONS.find((g) => g.value === savedSession.primaryGoal)?.label || savedSession.primaryGoal

    const savedOfficial = savedSession.officialTopics || []
    const savedCustom = savedSession.customTopics || []

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
              Your personalized goals and targeted topics have been securely recorded. You are ready to start
              your adaptive technical diagnostic or generate your custom AI preparation itinerary.
            </p>

            {/* Next Stage Action Banner */}
            <div className="prep-setup-phase-notice">
              <h4>Next Stage: Adaptive Knowledge Diagnostic & AI Preparation Plan</h4>
              <p>
                Take a quick 5–8 question adaptive diagnostic to identify verified strengths and focus gaps,
                or generate your personalised placement preparation plan directly.
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
                <div className="prep-setup-summary-item__label">Curriculum Topics ({savedOfficial.length})</div>
                <div className="prep-setup-summary-item__value" style={{ fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.4 }}>
                  {savedOfficial.length > 0
                    ? savedOfficial.map((t) => t.title).join(', ')
                    : 'None selected'}
                </div>
              </div>

              <div className="prep-setup-summary-item">
                <div className="prep-setup-summary-item__label">Custom Topics ({savedCustom.length})</div>
                <div className="prep-setup-summary-item__value" style={{ fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.4 }}>
                  {savedCustom.length > 0
                    ? savedCustom.map((t) => t.title).join(', ')
                    : 'None added'}
                </div>
              </div>

              <div className="prep-setup-summary-prompt">
                <div className="prep-setup-summary-item__label">Saved Preparation Goal Prompt</div>
                <p>&ldquo;{savedSession.goalPrompt}&rdquo;</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="prep-setup-actions">
              <Link
                to={`/interview-preparation/${ROLE_ID}/diagnostic?session=${savedSession.sessionId || savedSession._id}`}
                className="prep-setup-btn-primary"
              >
                <Sparkles size={15} />
                <span>Start Knowledge Diagnostic</span>
                <ArrowRight size={14} />
              </Link>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="prep-setup-btn-secondary"
              >
                <Edit3 size={14} />
                <span>Edit Setup</span>
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
            Tell us about your upcoming interview targets, existing background, and specific topics you want to prepare.
            We will calibrate an optimal learning itinerary tailored specifically to your timeline and goals.
          </p>
        </section>

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

          {/* Field 2: Searchable Multi-Select Topic Dropdown */}
          <div className="prep-setup-field" ref={dropdownRef}>
            <label id="topics-dropdown-label" className="prep-setup-label">
              2. What topics do you want to prepare?
            </label>
            <p className="prep-setup-hint">
              Select one or more topics from the official Frontend Developer curriculum, or add your own custom subjects below.
            </p>

            <div className="prep-topic-dropdown-wrap">
              {/* Dropdown Trigger */}
              <div
                className={`prep-topic-dropdown-trigger ${isDropdownOpen ? 'prep-topic-dropdown-trigger--open' : ''}`}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-labelledby="topics-dropdown-label"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setIsDropdownOpen((prev) => !prev)
                  }
                }}
              >
                <div className="prep-topic-dropdown-trigger__content">
                  {totalSelectedCount > 0 ? (
                    <>
                      <span className="prep-topic-dropdown-trigger__count-badge">
                        {totalSelectedCount} selected
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal-muted)' }}>
                        ({officialTopics.length} official, {customTopics.length} custom)
                      </span>
                    </>
                  ) : (
                    <span className="prep-topic-dropdown-trigger__placeholder">
                      Search and select topics to prepare...
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`prep-topic-dropdown-trigger__chevron ${isDropdownOpen ? 'prep-topic-dropdown-trigger__chevron--open' : ''}`}
                />
              </div>

              {/* Dropdown Menu (Floating Panel) */}
              {isDropdownOpen && (
                <div className="prep-topic-dropdown-menu" role="listbox" aria-label="Frontend Curriculum Topics">
                  {/* Search Header */}
                  <div className="prep-topic-dropdown-search-wrap">
                    <Search size={15} className="prep-topic-dropdown-search-icon" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search curriculum topics..."
                      className="prep-topic-dropdown-search-input"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="prep-topic-dropdown-search-clear"
                        aria-label="Clear search query"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Scrollable Topic Items List */}
                  <div className="prep-topic-dropdown-list">
                    {filteredCurriculumTopics.length > 0 ? (
                      filteredCurriculumTopics.map((topic) => {
                        const isSelected = officialTopics.some((t) => t.topicId === topic.topicId)
                        return (
                          <div
                            key={topic.topicId}
                            onClick={() => toggleOfficialTopic(topic)}
                            className={`prep-topic-dropdown-item ${isSelected ? 'prep-topic-dropdown-item--selected' : ''}`}
                            role="option"
                            aria-selected={isSelected}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                toggleOfficialTopic(topic)
                              }
                            }}
                          >
                            <div className={`prep-topic-dropdown-item__checkbox ${isSelected ? 'prep-topic-dropdown-item__checkbox--checked' : ''}`}>
                              {isSelected && <Check size={11} strokeWidth={3} />}
                            </div>
                            <div className="prep-topic-dropdown-item__info">
                              <div className="prep-topic-dropdown-item__title">{topic.title}</div>
                              <div className="prep-topic-dropdown-item__module">{topic.moduleTitle}</div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="prep-topic-dropdown-empty">
                        No official topics matching &ldquo;{searchQuery}&rdquo;.
                      </div>
                    )}
                  </div>

                  {/* "Other — Add my own topic" Section */}
                  <div className="prep-topic-dropdown-other">
                    <button
                      type="button"
                      className="prep-topic-dropdown-other__title-btn"
                      onClick={() => {
                        const inputEl = document.querySelector('.prep-topic-dropdown-other__input')
                        if (inputEl) inputEl.focus()
                      }}
                    >
                      <Plus size={14} />
                      <span>Other — Add my own topic</span>
                    </button>

                    <div className="prep-topic-dropdown-other__form">
                      <input
                        type="text"
                        value={customTopicInput}
                        onChange={(e) => {
                          setCustomTopicInput(e.target.value)
                          if (customTopicError) setCustomTopicError(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddCustomTopic()
                          }
                        }}
                        placeholder="e.g. Next.js, TypeScript, Redux Toolkit..."
                        className="prep-topic-dropdown-other__input"
                        maxLength={100}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTopic}
                        className="prep-topic-dropdown-other__add-btn"
                      >
                        Add
                      </button>
                    </div>

                    {customTopicError && (
                      <div className="prep-topic-dropdown-other__error">{customTopicError}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Topics Display Tray (Removable Chips) */}
            {totalSelectedCount > 0 && (
              <div className="prep-selected-topics-tray">
                <div className="prep-selected-topics-header">
                  <span className="prep-selected-topics-count">
                    Selected Topics ({totalSelectedCount})
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAllTopics}
                    className="prep-selected-topics-clear-btn"
                  >
                    Clear all
                  </button>
                </div>

                <div className="prep-selected-chips-grid">
                  {/* Official Topics Chips */}
                  {officialTopics.map((topic) => (
                    <span
                      key={topic.topicId}
                      className="prep-topic-chip prep-topic-chip--official"
                    >
                      <span className="prep-topic-chip__badge">Curriculum</span>
                      <span className="prep-topic-chip__text">{topic.title}</span>
                      <button
                        type="button"
                        onClick={() => removeOfficialTopic(topic.topicId)}
                        className="prep-topic-chip__remove-btn"
                        aria-label={`Remove ${topic.title}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  {/* Custom Student Topics Chips */}
                  {customTopics.map((topic) => (
                    <span
                      key={topic.title}
                      className="prep-topic-chip prep-topic-chip--custom"
                    >
                      <span className="prep-topic-chip__badge">Custom</span>
                      <span className="prep-topic-chip__text">{topic.title}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomTopic(topic.title)}
                        className="prep-topic-chip__remove-btn"
                        aria-label={`Remove custom topic ${topic.title}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Field 3: Experience Level */}
          <div className="prep-setup-field">
            <span className="prep-setup-label">3. Current Experience Level</span>
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

          {/* Fields 4 & 5: Timeline & Primary Goal (Split Row) */}
          <div className="prep-setup-split-row prep-setup-field">
            <div>
              <label htmlFor="timelineSelect" className="prep-setup-label">
                4. Preparation Timeline
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
                5. Primary Goal
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
