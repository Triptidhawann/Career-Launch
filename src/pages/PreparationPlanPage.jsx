import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Compass,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  RotateCcw,
  BookOpen,
  HelpCircle,
  FileText,
  Code,
  Terminal,
  Layers,
  ArrowUp,
  ArrowDown,
  Loader2,
  Check,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  fetchPreparationPlan,
  customizePreparationPlan,
  acceptPreparationPlan,
  generatePreparationPlan,
  fetchProfile,
} from '@/lib/api'
import '@/styles/preparation-plan.css'

const ROLE_ID = 'frontend-developer'
const ROLE_TITLE = 'Frontend Developer'

export function PreparationPlanPage() {
  const { planId } = useParams()
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Local editable milestones state
  const [milestones, setMilestones] = useState([])
  const [expandedMilestones, setExpandedMilestones] = useState(new Set(['m-1']))
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Custom milestone modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newHours, setNewHours] = useState('6')
  const [newPriority, setNewPriority] = useState('medium')
  const [newDifficulty, setNewDifficulty] = useState('intermediate')

  // Load plan on mount
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        setLoading(true)
        setErrorMessage(null)

        const [profData, planData] = await Promise.all([
          fetchProfile().catch(() => null),
          fetchPreparationPlan(planId).catch((err) => {
            throw err
          }),
        ])

        if (!isMounted) return

        if (profData?.profile) setProfile(profData.profile)

        if (planData?.plan) {
          setPlan(planData.plan)
          setMilestones(planData.plan.milestones || [])
        } else {
          throw new Error('Preparation plan could not be retrieved.')
        }
      } catch (err) {
        console.error('Error fetching plan:', err)
        if (isMounted) setErrorMessage(err.message || 'Failed to load preparation plan.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (planId) loadData()
    return () => {
      isMounted = false
    }
  }, [planId])

  // Toggle milestone details expansion
  const toggleExpand = (mId) => {
    setExpandedMilestones((prev) => {
      const next = new Set(prev)
      if (next.has(mId)) next.delete(mId)
      else next.add(mId)
      return next
    })
  }

  // Move milestone up in priority / sequence
  const handleMoveUp = (index) => {
    if (index === 0) return
    const updated = [...milestones]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp
    // Recalculate orderIndex
    updated.forEach((m, idx) => {
      m.orderIndex = idx
    })
    setMilestones(updated)
    setHasUnsavedChanges(true)
  }

  // Move milestone down
  const handleMoveDown = (index) => {
    if (index === milestones.length - 1) return
    const updated = [...milestones]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp
    updated.forEach((m, idx) => {
      m.orderIndex = idx
    })
    setMilestones(updated)
    setHasUnsavedChanges(true)
  }

  // Remove milestone
  const handleRemoveMilestone = (milestoneId) => {
    if (milestones.length <= 3) {
      alert('A minimum of 3 milestones is required for a complete preparation curriculum.')
      return
    }
    const updated = milestones.filter((m) => m.milestoneId !== milestoneId)
    updated.forEach((m, idx) => {
      m.orderIndex = idx
    })
    setMilestones(updated)
    setHasUnsavedChanges(true)
  }

  // Add custom milestone
  const handleAddCustomMilestone = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newMilestoneId = `m-custom-${Date.now()}`
    const created = {
      milestoneId: newMilestoneId,
      title: newTitle.trim(),
      officialTopicId: null,
      topicSource: 'student_custom',
      difficulty: newDifficulty,
      priority: newPriority,
      reasonForRecommendation: 'Custom topic added directly by candidate.',
      learningObjectives: [
        `Master fundamental principles and practical implementation of ${newTitle.trim()}.`,
        `Integrate ${newTitle.trim()} into production-ready frontend workflows.`,
      ],
      estimatedHours: Number(newHours) || 6,
      recommendedLearningActivities: [
        `Build a focused proof-of-concept project with ${newTitle.trim()}.`,
        `Practice typical placement interview questions.`,
      ],
      prerequisites: ['Modern JavaScript', 'React Component Architecture'],
      knowledgeSupportStatus: 'source_review_required',
      isCustomMilestone: true,
      orderIndex: milestones.length,
    }

    setMilestones((prev) => [...prev, created])
    setExpandedMilestones((prev) => new Set([...prev, newMilestoneId]))
    setHasUnsavedChanges(true)
    setIsAddModalOpen(false)
    setNewTitle('')
  }

  // Save customized changes
  const handleSaveChanges = async () => {
    if (!planId) return
    setActionLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const res = await customizePreparationPlan(planId, {
        milestones,
      })
      if (res?.success && res.plan) {
        setPlan(res.plan)
        setMilestones(res.plan.milestones || [])
        setHasUnsavedChanges(false)
        setSuccessMessage('Preparation plan customizations saved successfully.')
      } else {
        throw new Error(res?.error || 'Failed to save customizations.')
      }
    } catch (err) {
      console.error('Error saving plan changes:', err)
      setErrorMessage(err.message || 'Failed to update plan.')
    } finally {
      setActionLoading(false)
    }
  }

  // Regenerate plan with Groq
  const handleRegeneratePlan = async () => {
    if (!plan?.sessionId) return
    const confirmed = window.confirm(
      'Regenerating will synthesize a fresh preparation plan using Groq AI. Your existing valid plan will remain intact until the new plan is synthesized. Continue?',
    )
    if (!confirmed) return

    setActionLoading(true)
    setErrorMessage(null)

    try {
      const res = await generatePreparationPlan({
        sessionId: plan.sessionId,
        diagnosticId: plan.diagnosticId,
      })
      if (res?.success && res.planId) {
        window.location.href = `/interview-preparation/${ROLE_ID}/plan/${res.planId}`
      }
    } catch (err) {
      console.error('Error regenerating plan:', err)
      setErrorMessage(err.message || 'Failed to regenerate plan.')
      setActionLoading(false)
    }
  }

  // Accept plan
  const handleAcceptPlan = async () => {
    if (!planId) return
    setActionLoading(true)
    setErrorMessage(null)

    try {
      // If there are unsaved local reorderings, save them first
      if (hasUnsavedChanges) {
        await customizePreparationPlan(planId, { milestones })
      }

      const res = await acceptPreparationPlan(planId)
      if (res?.success && res.plan) {
        setPlan(res.plan)
        setHasUnsavedChanges(false)
        setSuccessMessage('Congratulations! Your preparation plan is accepted and finalized.')
      } else {
        throw new Error(res?.error || 'Failed to accept preparation plan.')
      }
    } catch (err) {
      console.error('Error accepting plan:', err)
      setErrorMessage(err.message || 'Failed to accept plan.')
    } finally {
      setActionLoading(false)
    }
  }

  const displayName = profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Candidate'
  const userInitials = displayName.charAt(0).toUpperCase()
  const isAccepted = plan?.status === 'accepted'

  // Total study hours calculation
  const totalStudyHours = milestones.reduce((sum, m) => sum + (Number(m.estimatedHours) || 0), 0)

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="plan-container">
        <header className="plan-topbar">
          <Link to="/" className="plan-topbar__brand">
            <span>CareerLaunch</span>
            <span className="plan-topbar__role-pill">{ROLE_TITLE}</span>
          </Link>
        </header>
        <main className="plan-main" style={{ textAlign: 'center', paddingTop: '5rem' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-forest)' }}>Loading Preparation Plan...</h2>
          <p style={{ color: 'var(--color-charcoal-muted)' }}>Retrieving your personalised curriculum itinerary.</p>
        </main>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Error State
  // ---------------------------------------------------------------------------
  if (!plan) {
    return (
      <div className="plan-container">
        <header className="plan-topbar">
          <Link to="/" className="plan-topbar__brand">
            <span>CareerLaunch</span>
            <span className="plan-topbar__role-pill">{ROLE_TITLE}</span>
          </Link>
        </header>
        <main className="plan-main" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <AlertCircle size={40} style={{ color: 'var(--color-terracotta)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-forest)' }}>Plan Not Found</h2>
          <p style={{ color: 'var(--color-charcoal-muted)', marginBottom: '1.5rem' }}>
            {errorMessage || 'The requested preparation plan does not exist or you do not have permission to view it.'}
          </p>
          <Link to={`/interview-preparation/${ROLE_ID}/setup`} className="plan-btn-accept">
            Return to Setup
          </Link>
        </main>
      </div>
    )
  }

  const { overview, knowledgeAssessment, weeklySchedule, practiceRecommendations } = plan

  return (
    <div className="plan-container">
      {/* Topbar */}
      <header className="plan-topbar">
        <Link to="/" className="plan-topbar__brand">
          <span>CareerLaunch</span>
          <span className="plan-topbar__role-pill">
            <Sparkles size={11} />
            <span>{ROLE_TITLE}</span>
          </span>
        </Link>
        <div className="plan-topbar__user">
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal-muted)' }}>{displayName}</span>
          <div className="plan-topbar__avatar">{userInitials}</div>
        </div>
      </header>

      <main className="plan-main">
        {/* Breadcrumbs */}
        <nav className="plan-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/interview-preparation">Interview Prep</Link>
          <span>/</span>
          <Link to={`/interview-preparation/${ROLE_ID}`}>{ROLE_TITLE}</Link>
          <span>/</span>
          <Link to={`/interview-preparation/${ROLE_ID}/setup`}>Setup</Link>
          <span>/</span>
          <span className="plan-breadcrumbs__current">Preparation Plan</span>
        </nav>

        {/* Success Banner */}
        {successMessage && (
          <div className="prep-setup-saved-badge" style={{ marginBottom: '1.5rem', display: 'flex' }}>
            <CheckCircle2 size={15} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="prep-setup-error-banner" role="alert" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Accepted Celebration Banner */}
        {isAccepted && (
          <article className="plan-accepted-banner">
            <div className="plan-accepted-banner__text">
              <span className="plan-hero__status-badge plan-hero__status-badge--accepted" style={{ marginBottom: '0.5rem' }}>
                <CheckCircle2 size={13} />
                <span>Plan Accepted & Finalized</span>
              </span>
              <h2>Your Placement Preparation Plan is Ready!</h2>
              <p>
                All milestones, weekly schedules, and practice recommendations have been verified and locked.
                You are ready to begin structured learning on the Frontend Developer track.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
              <Link to={`/interview-preparation/${ROLE_ID}`} className="plan-btn-accept">
                <BookOpen size={16} />
                <span>Explore Roadmap</span>
              </Link>
              <Link to="/dashboard" className="plan-btn-secondary">
                <span>Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        )}

        {/* Plan Hero & Summary */}
        <section className="plan-hero">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className={`plan-hero__status-badge plan-hero__status-badge--${plan.status}`}>
              {plan.status === 'accepted' ? <CheckCircle2 size={12} /> : <Compass size={12} />}
              <span>Status: {plan.status}</span>
            </span>
            {hasUnsavedChanges && (
              <span className="plan-badge plan-badge--medium">Unsaved Customizations</span>
            )}
          </div>

          <h1 className="plan-hero__title">Your Personalised Preparation Plan</h1>
          <p className="plan-hero__summary">{overview?.summary}</p>
        </section>

        {/* Metric Cards Grid */}
        <section className="plan-metrics-grid">
          <div className="plan-metric-card">
            <div className="plan-metric-card__label">Target Role</div>
            <div className="plan-metric-card__value">{overview?.roleTitle}</div>
          </div>
          <div className="plan-metric-card">
            <div className="plan-metric-card__label">Starting Level</div>
            <div className="plan-metric-card__value" style={{ textTransform: 'capitalize' }}>
              {overview?.startingLevel}
            </div>
          </div>
          <div className="plan-metric-card">
            <div className="plan-metric-card__label">Duration</div>
            <div className="plan-metric-card__value">{overview?.recommendedDuration}</div>
          </div>
          <div className="plan-metric-card">
            <div className="plan-metric-card__label">Weekly Effort</div>
            <div className="plan-metric-card__value">{overview?.suggestedWeeklyEffort}</div>
          </div>
        </section>

        {/* Section 1: Knowledge Assessment */}
        <section className="plan-section">
          <div className="plan-section__header">
            <h2 className="plan-section__title">
              <Compass size={20} />
              <span>Knowledge Assessment Calibration</span>
            </h2>
            <span className="diag-domain-pill">
              Diagnostic: {knowledgeAssessment?.diagnosticStatus || 'Skipped'}
            </span>
          </div>

          <div className="plan-assessment-grid">
            <div className="plan-assessment-col">
              <div className="plan-assessment-col__title plan-assessment-col__title--strengths">
                <CheckCircle2 size={14} />
                <span>Demonstrated Strengths ({knowledgeAssessment?.demonstratedStrengths?.length || 0})</span>
              </div>
              <div className="plan-assessment-chips">
                {knowledgeAssessment?.demonstratedStrengths?.length > 0 ? (
                  knowledgeAssessment.demonstratedStrengths.map((str, idx) => (
                    <span key={idx} className="plan-tag-chip plan-tag-chip--strength">
                      <Check size={12} />
                      <span>{str}</span>
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal-muted)' }}>
                    No strengths demonstrated in assessment; foundational calibration applied.
                  </span>
                )}
              </div>
            </div>

            <div className="plan-assessment-col">
              <div className="plan-assessment-col__title plan-assessment-col__title--gaps">
                <AlertCircle size={14} />
                <span>Priority Gaps Identified ({knowledgeAssessment?.demonstratedGaps?.length || 0})</span>
              </div>
              <div className="plan-assessment-chips">
                {knowledgeAssessment?.demonstratedGaps?.length > 0 ? (
                  knowledgeAssessment.demonstratedGaps.map((gap, idx) => (
                    <span key={idx} className="plan-tag-chip plan-tag-chip--gap">
                      <AlertCircle size={12} />
                      <span>{gap}</span>
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal-muted)' }}>
                    No critical gaps identified in assessment.
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Ordered Learning Milestones */}
        <section className="plan-section">
          <div className="plan-section__header">
            <div>
              <h2 className="plan-section__title">
                <Layers size={20} />
                <span>Curriculum Milestones ({milestones.length})</span>
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal-muted)', marginTop: '0.25rem' }}>
                Total Estimated Preparation Effort: <strong>{totalStudyHours} Hours</strong>. Reorder or customize milestones to fit your target goals.
              </p>
            </div>
            {!isAccepted && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="plan-btn-secondary"
                style={{ padding: '0.5rem 0.875rem' }}
              >
                <Plus size={14} />
                <span>Add Custom Milestone</span>
              </button>
            )}
          </div>

          <div className="plan-milestones-list">
            {milestones.map((m, idx) => {
              const isExpanded = expandedMilestones.has(m.milestoneId)
              return (
                <article key={m.milestoneId} className="plan-milestone-card">
                  <div className="plan-milestone-card__header">
                    <div className="plan-milestone-card__main">
                      <div className="plan-milestone-number">{idx + 1}</div>
                      <div className="plan-milestone-card__title-wrap">
                        <h3 className="plan-milestone-title">{m.title}</h3>
                        <div className="plan-milestone-tags">
                          <span className={`plan-badge plan-badge--${m.priority}`}>
                            Priority: {m.priority}
                          </span>
                          <span className={`plan-badge plan-badge--${m.topicSource}`}>
                            {m.topicSource === 'curriculum'
                              ? `Curriculum (${m.officialTopicId || 'fe-top'})`
                              : 'Student Custom'}
                          </span>
                          <span className={`plan-badge plan-badge--${m.knowledgeSupportStatus === 'verified' ? 'verified' : 'review-required'}`}>
                            {m.knowledgeSupportStatus === 'verified' ? (
                              <>
                                <CheckCircle2 size={11} />
                                <span>Verified Source</span>
                              </>
                            ) : m.knowledgeSupportStatus === 'roadmap_topic' ? (
                              <span>Roadmap Topic</span>
                            ) : (
                              <>
                                <HelpCircle size={11} />
                                <span>Source Review Required</span>
                              </>
                            )}
                          </span>
                          <span className="plan-badge plan-badge--low" style={{ background: 'rgba(0,0,0,0.05)', color: 'inherit' }}>
                            <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />
                            {m.estimatedHours} Hours
                          </span>
                        </div>

                        <p className="plan-milestone-reason">{m.reasonForRecommendation}</p>

                        {/* Notice for custom topics with no verified source */}
                        {m.knowledgeSupportStatus === 'source_review_required' && (
                          <div className="plan-custom-topic-notice">
                            <strong>Source Notice:</strong> No verified official knowledge source is currently ingested in CareerLaunch for &ldquo;{m.title}&rdquo;. Marked for future curriculum source review and verification.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Milestone Controls */}
                    {!isAccepted && (
                      <div className="plan-milestone-controls">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="plan-icon-btn"
                          title="Move milestone up"
                          aria-label="Move milestone up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === milestones.length - 1}
                          className="plan-icon-btn"
                          title="Move milestone down"
                          aria-label="Move milestone down"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(m.milestoneId)}
                          className="plan-icon-btn plan-icon-btn--danger"
                          title="Remove milestone"
                          aria-label="Remove milestone"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleExpand(m.milestoneId)}
                          className="plan-icon-btn"
                          title={isExpanded ? 'Collapse details' : 'Expand details'}
                          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="plan-milestone-details">
                      <div className="plan-details-group">
                        <div className="plan-details-group__title">Learning Objectives</div>
                        <ul className="plan-details-list">
                          {(m.learningObjectives || []).map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="plan-details-group">
                        <div className="plan-details-group__title">Recommended Learning Activities</div>
                        <ul className="plan-details-list">
                          {(m.recommendedLearningActivities || []).map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>

        {/* Section 3: Weekly Schedule */}
        {weeklySchedule && weeklySchedule.length > 0 && (
          <section className="plan-section">
            <h2 className="plan-section__title" style={{ marginBottom: '1.25rem' }}>
              <Calendar size={20} />
              <span>Weekly Preparation Schedule</span>
            </h2>
            <div className="plan-schedule-grid">
              {weeklySchedule.map((w) => (
                <div key={w.weekNumber} className="plan-schedule-card">
                  <div className="plan-schedule-card__week">Week {w.weekNumber} Itinerary</div>
                  <div className="plan-schedule-card__focus">{w.focus}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal-muted)' }}>
                    Target Milestones: {w.milestoneIds?.join(', ') || 'Core Concepts'} ({w.estimatedHours} Hours)
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Practice Recommendations */}
        {practiceRecommendations && (
          <section className="plan-section">
            <h2 className="plan-section__title" style={{ marginBottom: '1.25rem' }}>
              <Terminal size={20} />
              <span>Recommended Practice Exercises (Phase D Scope)</span>
            </h2>
            <div className="plan-practice-grid">
              <div className="plan-practice-card">
                <div className="plan-practice-card__type">
                  <FileText size={14} style={{ display: 'inline', marginRight: 4 }} />
                  <span>Objective MCQs</span>
                </div>
                <ul>
                  {(practiceRecommendations.mcqs || []).map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="plan-practice-card">
                <div className="plan-practice-card__type">
                  <Code size={14} style={{ display: 'inline', marginRight: 4 }} />
                  <span>Coding Exercises</span>
                </div>
                <ul>
                  {(practiceRecommendations.codingExercises || []).map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="plan-practice-card">
                <div className="plan-practice-card__type">
                  <HelpCircle size={14} style={{ display: 'inline', marginRight: 4 }} />
                  <span>Interview Questions</span>
                </div>
                <ul>
                  {(practiceRecommendations.interviewQuestions || []).map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Sticky Action Bar */}
        <section className="plan-action-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!isAccepted && (
              <>
                {hasUnsavedChanges && (
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={actionLoading}
                    className="plan-btn-secondary"
                  >
                    <span>Save Milestone Customizations</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRegeneratePlan}
                  disabled={actionLoading}
                  className="plan-btn-secondary"
                  title="Synthesize fresh plan with Groq"
                >
                  <RotateCcw size={14} />
                  <span>Regenerate Plan</span>
                </button>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {!isAccepted ? (
              <button
                type="button"
                onClick={handleAcceptPlan}
                disabled={actionLoading}
                className="plan-btn-accept"
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Accept Preparation Plan</span>
                  </>
                )}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#2D5A46', fontWeight: 600 }}>
                  ✓ Plan Accepted
                </span>
                <Link to={`/interview-preparation/${ROLE_ID}`} className="plan-btn-secondary">
                  <span>Explore Curriculum Topics</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Add Custom Milestone Modal */}
        {isAddModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1rem',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                maxWidth: '480px',
                width: '100%',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', color: 'var(--color-forest)', marginBottom: '1rem' }}>
                Add Custom Learning Milestone
              </h3>
              <form onSubmit={handleAddCustomMilestone}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Milestone Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Next.js 14 Server Actions & SSR"
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      border: '1.5px solid var(--color-sand)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={newHours}
                      onChange={(e) => setNewHours(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.75rem',
                        border: '1.5px solid var(--color-sand)',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Difficulty
                    </label>
                    <select
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.75rem',
                        border: '1.5px solid var(--color-sand)',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Priority
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.75rem',
                        border: '1.5px solid var(--color-sand)',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="plan-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="plan-btn-accept">
                    Add Milestone
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
