import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Compass,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  fetchLatestPreparationSession,
  fetchPreparationSetup,
  startDiagnostic,
  submitDiagnosticAnswer,
  completeDiagnostic,
  generatePreparationPlan,
  fetchProfile,
} from '@/lib/api'
import '@/styles/diagnostic.css'

const ROLE_ID = 'frontend-developer'
const ROLE_TITLE = 'Frontend Developer'

export function DiagnosticPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionIdParam = searchParams.get('session')

  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [prepSession, setPrepSession] = useState(null)

  // Diagnostic State
  const [diagnostic, setDiagnostic] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [maxQuestions, setMaxQuestions] = useState(6)

  // Interaction State
  const [selectedOption, setSelectedOption] = useState(null)
  const [writtenAnswer, setWrittenAnswer] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [lastEvaluation, setLastEvaluation] = useState(null)
  const [isFinished, setIsFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // Load session & initialize diagnostic on mount
  useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        setLoading(true)
        setErrorMessage(null)

        const [profData, sessionRes] = await Promise.all([
          fetchProfile().catch(() => null),
          sessionIdParam
            ? fetchPreparationSetup(sessionIdParam).catch(() => null)
            : fetchLatestPreparationSession(ROLE_ID).catch(() => null),
        ])

        if (!isMounted) return

        if (profData?.profile) setProfile(profData.profile)

        const session = sessionRes?.session
        if (!session) {
          throw new Error('Preparation setup session not found. Please complete your preparation preferences first.')
        }
        setPrepSession(session)

        // Start or resume diagnostic
        const diagRes = await startDiagnostic({ sessionId: session.sessionId || session._id })
        if (diagRes?.success && diagRes.diagnostic) {
          const d = diagRes.diagnostic
          setDiagnostic(d)
          setCurrentIndex(d.currentIndex || 0)
          setMaxQuestions(d.maxQuestions || 6)
          setCurrentQuestion(d.currentQuestion)
          if (d.status === 'completed' || d.status === 'skipped') {
            setIsFinished(true)
          }
        } else {
          throw new Error(diagRes?.error || 'Failed to initialize knowledge diagnostic.')
        }
      } catch (err) {
        console.error('Diagnostic initialization error:', err)
        if (isMounted) setErrorMessage(err.message || 'Failed to start diagnostic.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    init()
    return () => {
      isMounted = false
    }
  }, [sessionIdParam])

  // Submit Answer (Objective or Written)
  const handleSubmitAnswer = async (isSkipped = false) => {
    if (!diagnostic || !currentQuestion) return

    setEvaluating(true)
    setErrorMessage(null)

    try {
      const studentAnswer = isSkipped
        ? null
        : currentQuestion.type === 'objective'
        ? selectedOption
        : writtenAnswer

      const res = await submitDiagnosticAnswer({
        diagnosticId: diagnostic.diagnosticId,
        questionId: currentQuestion.questionId,
        studentAnswer,
        isSkipped,
      })

      if (res?.success) {
        setDiagnostic(res.diagnostic)
        setLastEvaluation(res.evaluation)

        if (res.isFinished) {
          setIsFinished(true)
          setCurrentQuestion(null)
        }
      } else {
        throw new Error(res?.error || 'Failed to record answer.')
      }
    } catch (err) {
      console.error('Answer submission error:', err)
      setErrorMessage(err.message || 'Failed to evaluate answer.')
    } finally {
      setEvaluating(false)
    }
  }

  // Advance to next question after reviewing formative feedback
  const handleNextQuestion = () => {
    setLastEvaluation(null)
    setSelectedOption(null)
    setWrittenAnswer('')

    if (diagnostic?.currentQuestion) {
      setCurrentQuestion(diagnostic.currentQuestion)
      setCurrentIndex(diagnostic.currentIndex)
    } else {
      setIsFinished(true)
    }
  }

  // Skip Remaining / Exit Diagnostic
  const handleSkipEntireDiagnostic = async () => {
    if (!diagnostic) return
    const confirmed = window.confirm(
      'Are you sure you want to skip the remaining diagnostic questions? CareerLaunch will create a foundational plan based on your stated experience level.',
    )
    if (!confirmed) return

    try {
      setLoading(true)
      const res = await completeDiagnostic({
        diagnosticId: diagnostic.diagnosticId,
        skipped: true,
      })
      if (res?.success && res.diagnostic) {
        setDiagnostic(res.diagnostic)
        setIsFinished(true)
        setCurrentQuestion(null)
        setLastEvaluation(null)
      }
    } catch (err) {
      console.error('Error skipping diagnostic:', err)
      setErrorMessage(err.message || 'Failed to skip diagnostic.')
    } finally {
      setLoading(false)
    }
  }

  // Generate Plan via Groq
  const handleGeneratePlan = async () => {
    if (!prepSession) return

    setGeneratingPlan(true)
    setErrorMessage(null)

    try {
      const res = await generatePreparationPlan({
        sessionId: prepSession.sessionId || prepSession._id,
        diagnosticId: diagnostic?.diagnosticId || null,
      })

      if (res?.success && res.planId) {
        navigate(`/interview-preparation/${ROLE_ID}/plan/${res.planId}`)
      } else {
        throw new Error(res?.error || 'Failed to synthesize preparation plan.')
      }
    } catch (err) {
      console.error('Plan generation error:', err)
      setErrorMessage(err.message || 'An error occurred during AI curriculum synthesis. Please try again.')
    } finally {
      setGeneratingPlan(false)
    }
  }

  const displayName = profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Candidate'
  const userInitials = displayName.charAt(0).toUpperCase()
  const progressPercent = Math.min(Math.round(((currentIndex + (lastEvaluation ? 1 : 0)) / maxQuestions) * 100), 100)

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="diag-container">
        <header className="diag-topbar">
          <Link to="/" className="diag-topbar__brand">
            <span>CareerLaunch</span>
            <span className="diag-topbar__role-pill">{ROLE_TITLE}</span>
          </Link>
        </header>
        <main className="diag-main" style={{ textAlign: 'center', paddingTop: '5rem' }}>
          <Loader2 size={32} className="diag-spinner" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-forest)' }}>Calibrating Knowledge Diagnostic...</h2>
          <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.9375rem' }}>
            Selecting adaptive questions aligned with your preparation goals.
          </p>
        </main>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Finished / Summary State
  // ---------------------------------------------------------------------------
  if (isFinished && diagnostic) {
    const strengths = diagnostic.demonstratedStrengths || []
    const gaps = diagnostic.demonstratedGaps || []
    const unassessed = diagnostic.unassessedTopics || []
    const wasSkipped = diagnostic.status === 'skipped'

    return (
      <div className="diag-container">
        <header className="diag-topbar">
          <Link to="/" className="diag-topbar__brand">
            <span>CareerLaunch</span>
            <span className="diag-topbar__role-pill">
              <Sparkles size={11} />
              <span>{ROLE_TITLE}</span>
            </span>
          </Link>
          <div className="diag-topbar__user">
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal-muted)' }}>{displayName}</span>
            <div className="diag-topbar__avatar">{userInitials}</div>
          </div>
        </header>

        <main className="diag-main">
          <nav className="diag-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/interview-preparation">Interview Prep</Link>
            <span>/</span>
            <Link to={`/interview-preparation/${ROLE_ID}`}>{ROLE_TITLE}</Link>
            <span>/</span>
            <Link to={`/interview-preparation/${ROLE_ID}/setup`}>Setup</Link>
            <span>/</span>
            <span className="diag-breadcrumbs__current">Diagnostic Summary</span>
          </nav>

          {errorMessage && (
            <div className="prep-setup-error-banner" role="alert" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <article className="diag-summary-card">
            <div className="diag-summary-icon">
              {wasSkipped ? <HelpCircle size={28} /> : <CheckCircle2 size={28} />}
            </div>

            <h1 className="diag-summary-title">
              {wasSkipped ? 'Knowledge Diagnostic Skipped' : 'Diagnostic Assessment Complete!'}
            </h1>
            <p className="diag-summary-desc">
              {wasSkipped
                ? `You opted to proceed directly to plan synthesis (${unassessed.length} curriculum topics remain unassessed). CareerLaunch will assemble an experience-calibrated preparation itinerary based on your stated target goals.`
                : `Your technical responses have been evaluated against verified curriculum standards (${strengths.length} strengths verified, ${gaps.length} gaps identified, ${unassessed.length} unassessed). CareerLaunch will now synthesize an itinerary prioritizing your demonstrated focus areas.`}
            </p>

            {/* Diagnostic Outcomes Grid */}
            <div className="diag-outcomes-grid">
              <div className="diag-outcome-col">
                <div className="diag-outcome-header diag-outcome-header--strengths">
                  <CheckCircle2 size={15} />
                  <span>Demonstrated Strengths ({strengths.length})</span>
                </div>
                {strengths.length > 0 ? (
                  <ul className="diag-outcome-list">
                    {strengths.map((s, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={13} style={{ color: '#2D5A46', flexShrink: 0 }} />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="diag-outcome-empty">
                    {wasSkipped ? 'Assessment skipped; no demonstrated strengths verified.' : 'No strengths demonstrated yet.'}
                  </div>
                )}
              </div>

              <div className="diag-outcome-col">
                <div className="diag-outcome-header diag-outcome-header--gaps">
                  <AlertCircle size={15} />
                  <span>Identified Priority Gaps ({gaps.length})</span>
                </div>
                {gaps.length > 0 ? (
                  <ul className="diag-outcome-list">
                    {gaps.map((g, idx) => (
                      <li key={idx}>
                        <AlertCircle size={13} style={{ color: 'var(--color-terracotta)', flexShrink: 0 }} />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="diag-outcome-empty">
                    {wasSkipped ? 'Assessment skipped; foundational focus will be applied.' : 'No critical gaps identified.'}
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="diag-summary-cta">
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={generatingPlan}
                className="diag-btn-generate"
              >
                {generatingPlan ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Synthesizing Plan with Groq AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Generate Personalised Preparation Plan</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal-muted)' }}>
                Powered by Groq model <code style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.05)', padding: '0.1rem 0.35rem', borderRadius: 4 }}>openai/gpt-oss-120b</code>
              </span>
            </div>
          </article>
        </main>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Active Question State
  // ---------------------------------------------------------------------------
  return (
    <div className="diag-container">
      {/* Topbar */}
      <header className="diag-topbar">
        <Link to="/" className="diag-topbar__brand">
          <span>CareerLaunch</span>
          <span className="diag-topbar__role-pill">
            <Sparkles size={11} />
            <span>{ROLE_TITLE}</span>
          </span>
        </Link>
        <div className="diag-topbar__user">
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal-muted)' }}>{displayName}</span>
          <div className="diag-topbar__avatar">{userInitials}</div>
        </div>
      </header>

      <main className="diag-main">
        {/* Breadcrumbs */}
        <nav className="diag-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/interview-preparation">Interview Prep</Link>
          <span>/</span>
          <Link to={`/interview-preparation/${ROLE_ID}`}>{ROLE_TITLE}</Link>
          <span>/</span>
          <Link to={`/interview-preparation/${ROLE_ID}/setup`}>Setup</Link>
          <span>/</span>
          <span className="diag-breadcrumbs__current">Adaptive Diagnostic</span>
        </nav>

        {/* Progress Header */}
        <section className="diag-progress-header">
          <div className="diag-progress-meta">
            <span className="diag-progress-step">
              <Compass size={14} />
              <span>Question {currentIndex + 1} of ~{maxQuestions}</span>
            </span>
            <button
              type="button"
              onClick={handleSkipEntireDiagnostic}
              className="diag-skip-all-btn"
            >
              Skip remaining & Generate Plan
            </button>
          </div>
          <div className="diag-progress-bar-wrap">
            <div
              className="diag-progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </section>

        {/* Error Alert */}
        {errorMessage && (
          <div className="prep-setup-error-banner" role="alert" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Active Question Card */}
        {currentQuestion && (
          <article className="diag-card">
            <div className="diag-card-header">
              <div className="diag-badges-wrap">
                <span className="diag-domain-pill">{currentQuestion.domain.replace('_', ' ')}</span>
                <span className={`diag-diff-pill diag-diff-pill--${currentQuestion.difficulty}`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
              <span className="diag-topic-tag">{currentQuestion.topicTitle}</span>
            </div>

            <h2 className="diag-question-prompt">{currentQuestion.prompt}</h2>

            {/* Objective Options (MCQ) */}
            {currentQuestion.type === 'objective' && (
              <div className="diag-options-grid">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx
                  return (
                    <div
                      key={idx}
                      onClick={() => !lastEvaluation && setSelectedOption(idx)}
                      className={`diag-option-card ${isSelected ? 'diag-option-card--selected' : ''} ${lastEvaluation ? 'diag-option-card--disabled' : ''}`}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault()
                          if (!lastEvaluation) setSelectedOption(idx)
                        }
                      }}
                    >
                      <div className="diag-option-radio">
                        {isSelected && <div className="diag-option-radio-dot" />}
                      </div>
                      <span className="diag-option-text">{option}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Written Question Input */}
            {currentQuestion.type === 'written' && (
              <div className="diag-written-wrap">
                <textarea
                  value={writtenAnswer}
                  onChange={(e) => setWrittenAnswer(e.target.value)}
                  disabled={Boolean(lastEvaluation)}
                  placeholder="Provide your technical explanation here. Focus on architectural principles, execution lifecycle, and practical behaviors..."
                  className="diag-written-textarea"
                  maxLength={1500}
                />
                <div className="diag-written-meta">
                  <span>Min 20 characters for technical evaluation</span>
                  <span>{writtenAnswer.length} / 1500 characters</span>
                </div>

                {currentQuestion.hasRubric && (
                  <div className="diag-rubric-hint">
                    <strong>Rubric Evaluation Guidelines:</strong>
                    <ul>
                      {currentQuestion.rubricCriteria.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Formative Feedback Card (After answering) */}
            {lastEvaluation && (
              <div
                className={`diag-feedback-card ${
                  lastEvaluation.isCorrect
                    ? 'diag-feedback-card--correct'
                    : 'diag-feedback-card--incorrect'
                }`}
              >
                <div className="diag-feedback-header">
                  {lastEvaluation.isCorrect ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{lastEvaluation.isCorrect ? 'Accurate Response' : 'Identified Conceptual Gap'}</span>
                </div>
                <div className="diag-feedback-body">{lastEvaluation.feedback}</div>
              </div>
            )}

            {/* Actions */}
            <div className="diag-actions">
              {lastEvaluation ? (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="diag-btn-submit"
                  style={{ marginLeft: 'auto' }}
                >
                  <span>Continue to Next Question</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleSubmitAnswer(true)}
                    disabled={evaluating}
                    className="diag-btn-skip"
                  >
                    Skip Question
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmitAnswer(false)}
                    disabled={
                      evaluating ||
                      (currentQuestion.type === 'objective' && selectedOption === null) ||
                      (currentQuestion.type === 'written' && writtenAnswer.trim().length < 5)
                    }
                    className="diag-btn-submit"
                  >
                    {evaluating ? (
                      <>
                        <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Answer</span>
                        <ChevronRight size={15} />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </article>
        )}
      </main>
    </div>
  )
}
