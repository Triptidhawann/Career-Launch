import { useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  Copy,
  Cpu,
  ExternalLink,
  HelpCircle,
  Layers,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Terminal,
} from 'lucide-react'

/**
 * Renders the 9 sections of an AI-generated, source-grounded technical lesson.
 * Designed with editorial elegance adhering to CareerLaunch brand design tokens:
 * - Warm Ivory (#F6F2E9)
 * - Deep Forest (#24372F)
 * - Muted Terracotta (#C66A4A)
 * - Soft Sage (#879477)
 * - Charcoal (#292A27)
 * - Sand (#E5DED2)
 *
 * @param {object} props
 * @param {object} props.lesson - The canonical lesson object returned from the API
 * @param {string} [props.roleTitle] - The human-readable title of the role (e.g. "Software Engineer")
 */
export function LessonContentView({ lesson, roleTitle = 'Software Engineer' }) {
  const [copiedIndex, setCopiedIndex] = useState(null)

  if (!lesson || !lesson.content) {
    return null
  }

  const { content, difficulty, estimatedMinutes, learningObjectives, title } = lesson
  const {
    introduction,
    coreConcepts = [],
    stepByStep = [],
    practicalExamples = [],
    complexityAnalysis,
    commonMistakes = [],
    interviewInsights,
    summary = [],
    references = [],
  } = content

  const handleCopyCode = async (codeText, index) => {
    try {
      await navigator.clipboard.writeText(codeText)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.warn('Failed to copy code to clipboard:', err)
    }
  }

  return (
    <div className="lesson-container" aria-label="AI Technical Lesson Content">
      {/* Lesson Header Banner */}
      <header className="lesson-hero-card">
        <div className="lesson-hero-badge-row">
          <span className="lesson-badge lesson-badge--ai">
            <Sparkles size={12} />
            <span>{roleTitle} &bull; AI Source-Grounded</span>
          </span>
          {difficulty && (
            <span className={`level-badge level-badge--${difficulty}`}>
              {difficulty.toUpperCase()}
            </span>
          )}
          {estimatedMinutes && (
            <span className="lesson-time-pill">
              <Clock size={12} />
              <span>{estimatedMinutes} min read</span>
            </span>
          )}
        </div>

        <h2 className="lesson-title">{title}</h2>

        {/* Learning Objectives Checklist */}
        {learningObjectives && learningObjectives.length > 0 && (
          <div className="lesson-objectives-box">
            <h3 className="lesson-objectives-heading">
              <Compass size={15} />
              <span>Core Learning Objectives</span>
            </h3>
            <ul className="lesson-objectives-list">
              {learningObjectives.map((obj, i) => (
                <li key={i} className="lesson-objective-item">
                  <CheckCircle2 size={16} className="lesson-check-icon" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* SECTION 1: Introduction (Meaning, Why It Matters, Real-World Use) */}
      {introduction && (
        <section className="lesson-section" aria-labelledby="lesson-sec-intro">
          <h3 id="lesson-sec-intro" className="lesson-section-heading">
            <BookOpen size={18} />
            <span>1. Conceptual Foundations</span>
          </h3>

          <div className="lesson-intro-grid">
            {introduction.meaning && (
              <div className="lesson-card lesson-card--intro">
                <h4 className="lesson-card-title">What It Is</h4>
                <p className="lesson-card-text">{introduction.meaning}</p>
              </div>
            )}
            {introduction.whyItMatters && (
              <div className="lesson-card lesson-card--intro">
                <h4 className="lesson-card-title">Why It Matters in Interviews</h4>
                <p className="lesson-card-text">{introduction.whyItMatters}</p>
              </div>
            )}
            {introduction.realWorldUse && (
              <div className="lesson-card lesson-card--intro">
                <h4 className="lesson-card-title">Production Engineering Application</h4>
                <p className="lesson-card-text">{introduction.realWorldUse}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 2: Core Concepts */}
      {coreConcepts && coreConcepts.length > 0 && (
        <section className="lesson-section" aria-labelledby="lesson-sec-concepts">
          <h3 id="lesson-sec-concepts" className="lesson-section-heading">
            <Layers size={18} />
            <span>2. Core Concepts &amp; Invariants</span>
          </h3>

          <div className="lesson-concepts-stack">
            {coreConcepts.map((concept, i) => (
              <div key={i} className="lesson-concept-card">
                <div className="lesson-concept-term-row">
                  <span className="lesson-concept-index">{String(i + 1).padStart(2, '0')}</span>
                  <h4 className="lesson-concept-term">{concept.term}</h4>
                </div>
                <p className="lesson-concept-def">{concept.definition}</p>
                {concept.principles && (
                  <div className="lesson-concept-principles">
                    <strong>Algorithmic Principle:</strong> {concept.principles}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: Step-by-Step Explanation */}
      {stepByStep && stepByStep.length > 0 && (
        <section className="lesson-section" aria-labelledby="lesson-sec-steps">
          <h3 id="lesson-sec-steps" className="lesson-section-heading">
            <Cpu size={18} />
            <span>3. Step-by-Step Algorithmic Mechanics</span>
          </h3>

          <div className="lesson-steps-timeline">
            {stepByStep.map((step, i) => (
              <div key={i} className="lesson-step-item">
                <div className="lesson-step-badge">
                  <span>{step.stepNumber || i + 1}</span>
                </div>
                <div className="lesson-step-content">
                  <h4 className="lesson-step-heading">{step.heading}</h4>
                  <p className="lesson-step-explanation">{step.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 4: Practical Examples (Code & Attribution) */}
      {practicalExamples && practicalExamples.length > 0 && (
        <section className="lesson-section" aria-labelledby="lesson-sec-examples">
          <h3 id="lesson-sec-examples" className="lesson-section-heading">
            <Code2 size={18} />
            <span>4. Practical Implementation &amp; Code Exemplar</span>
          </h3>

          <div className="lesson-examples-stack">
            {practicalExamples.map((ex, i) => (
              <div key={i} className="lesson-example-card">
                <div className="lesson-example-header">
                  <div>
                    <h4 className="lesson-example-title">{ex.title}</h4>
                    {ex.explanation && (
                      <p className="lesson-example-explanation">{ex.explanation}</p>
                    )}
                  </div>
                  <div className="lesson-example-badges">
                    <span className="lesson-lang-pill">
                      <Terminal size={11} />
                      <span>{(ex.language || 'python').toUpperCase()}</span>
                    </span>
                    <span className="lesson-attribution-pill" title="Authorship provenance">
                      <ShieldCheck size={11} />
                      <span>{ex.attribution || 'CareerLaunch Engineering'}</span>
                    </span>
                  </div>
                </div>

                {/* Input / Output Vectors if present */}
                {(ex.input || ex.output) && (
                  <div className="lesson-io-box">
                    {ex.input && (
                      <div className="lesson-io-item">
                        <span className="lesson-io-label">Input:</span>
                        <code className="lesson-io-code">{ex.input}</code>
                      </div>
                    )}
                    {ex.output && (
                      <div className="lesson-io-item">
                        <span className="lesson-io-label">Expected Output:</span>
                        <code className="lesson-io-code">{ex.output}</code>
                      </div>
                    )}
                  </div>
                )}

                {/* Code Block Container */}
                <div className="lesson-code-wrapper">
                  <div className="lesson-code-toolbar">
                    <span className="lesson-code-lang">
                      {ex.language || 'python'} &bull; {ex.attribution || 'CareerLaunch Engineering'}
                    </span>
                    <button
                      type="button"
                      className="lesson-copy-btn"
                      onClick={() => handleCopyCode(ex.code, i)}
                      aria-label="Copy code snippet to clipboard"
                    >
                      {copiedIndex === i ? (
                        <>
                          <Check size={13} className="copy-icon-success" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="lesson-code-pre">
                    <code>{ex.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 5: Complexity Analysis */}
      {complexityAnalysis && (
        <section className="lesson-section" aria-labelledby="lesson-sec-complexity">
          <h3 id="lesson-sec-complexity" className="lesson-section-heading">
            <Clock size={18} />
            <span>5. Time &amp; Space Complexity Analysis</span>
          </h3>

          <div className="lesson-complexity-box">
            <div className="lesson-complexity-cards-row">
              <div className="lesson-complexity-badge-card">
                <span className="complexity-metric-label">Time Complexity</span>
                <span className="complexity-metric-value">
                  {complexityAnalysis.timeComplexity || 'N/A'}
                </span>
              </div>
              <div className="lesson-complexity-badge-card">
                <span className="complexity-metric-label">Space Complexity</span>
                <span className="complexity-metric-value">
                  {complexityAnalysis.spaceComplexity || 'N/A'}
                </span>
              </div>
            </div>

            {complexityAnalysis.explanation && (
              <div className="lesson-complexity-detail">
                <h4 className="complexity-detail-title">Asymptotic Derivation:</h4>
                <p className="complexity-detail-text">{complexityAnalysis.explanation}</p>
              </div>
            )}

            {complexityAnalysis.assumptions && (
              <div className="lesson-complexity-assumptions">
                <strong>Assumptions:</strong> {complexityAnalysis.assumptions}
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 6: Common Mistakes & Pitfalls */}
      {commonMistakes && commonMistakes.length > 0 && (
        <section className="lesson-section" aria-labelledby="lesson-sec-mistakes">
          <h3 id="lesson-sec-mistakes" className="lesson-section-heading">
            <AlertCircle size={18} />
            <span>6. Common Pitfalls &amp; Edge Cases</span>
          </h3>

          <div className="lesson-mistakes-stack">
            {commonMistakes.map((m, i) => (
              <div key={i} className="lesson-mistake-card">
                <div className="lesson-mistake-header">
                  <span className="lesson-mistake-tag">Pitfall #{i + 1}</span>
                  <h4 className="lesson-mistake-title">{m.mistake}</h4>
                </div>
                <div className="lesson-mistake-body">
                  <div className="lesson-consequence-row">
                    <span className="mistake-label mistake-label--consequence">Consequence:</span>
                    <span className="mistake-text">{m.consequence}</span>
                  </div>
                  <div className="lesson-correction-row">
                    <span className="mistake-label mistake-label--correction">Correction:</span>
                    <span className="mistake-text">{m.correction}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 7: Interview Insights */}
      {interviewInsights && (
        <section className="lesson-section" aria-labelledby="lesson-sec-insights">
          <h3 id="lesson-sec-insights" className="lesson-section-heading">
            <Lightbulb size={18} />
            <span>7. Technical Interview Strategy</span>
          </h3>

          <div className="lesson-insights-card">
            {interviewInsights.advice && (
              <div className="lesson-advice-box">
                <div className="lesson-advice-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="lesson-advice-title">Whiteboard &amp; Screening Advice</h4>
                  <p className="lesson-advice-text">{interviewInsights.advice}</p>
                </div>
              </div>
            )}

            <div className="lesson-insights-grid">
              {interviewInsights.focusAreas && interviewInsights.focusAreas.length > 0 && (
                <div className="lesson-insights-column">
                  <h4 className="lesson-column-heading">
                    <CheckCircle2 size={15} />
                    <span>Focus Areas to Emphasize</span>
                  </h4>
                  <ul className="lesson-bullet-list">
                    {interviewInsights.focusAreas.map((area, i) => (
                      <li key={i}>{area}</li>
                    ))}
                  </ul>
                </div>
              )}

              {interviewInsights.followUpQuestions && interviewInsights.followUpQuestions.length > 0 && (
                <div className="lesson-insights-column">
                  <h4 className="lesson-column-heading">
                    <HelpCircle size={15} />
                    <span>Common Interviewer Follow-ups</span>
                  </h4>
                  <ul className="lesson-bullet-list">
                    {interviewInsights.followUpQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 8: Summary */}
      {summary && summary.length > 0 && (
        <section className="lesson-section" aria-labelledby="lesson-sec-summary">
          <h3 id="lesson-sec-summary" className="lesson-section-heading">
            <CheckCircle2 size={18} />
            <span>8. Key Takeaways</span>
          </h3>

          <div className="lesson-summary-card">
            <ul className="lesson-summary-list">
              {summary.map((point, i) => (
                <li key={i} className="lesson-summary-item">
                  <span className="lesson-summary-marker">{i + 1}</span>
                  <span className="lesson-summary-text">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* SECTION 9: Source References & Provenance */}
      {references && references.length > 0 && (
        <section className="lesson-section" aria-labelledby="lesson-sec-references">
          <h3 id="lesson-sec-references" className="lesson-section-heading">
            <ShieldCheck size={18} />
            <span>9. Canonical Source References &amp; Evidence</span>
          </h3>

          <div className="lesson-references-stack">
            {references.map((ref, i) => (
              <div key={i} className="lesson-reference-card">
                <div className="lesson-ref-header">
                  <div className="lesson-ref-titles">
                    <span className="lesson-ref-source">{ref.sourceTitle || ref.sourceId}</span>
                    {ref.section && <span className="lesson-ref-section">&bull; {ref.section}</span>}
                  </div>
                  {ref.canonicalUrl && (
                    <a
                      href={ref.canonicalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lesson-ref-link"
                      title="Open canonical source documentation in a new tab"
                    >
                      <span>Canonical Source</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                {ref.groundingSnippet && (
                  <blockquote className="lesson-ref-quote">
                    &ldquo;{ref.groundingSnippet}&rdquo;
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/**
 * Polished pulsing skeleton loader matching CareerLaunch tokens.
 */
export function LessonLoadingSkeleton() {
  return (
    <div className="lesson-skeleton" aria-busy="true" aria-label="Loading technical lesson">
      <div className="skeleton-bar skeleton-bar--badge" />
      <div className="skeleton-bar skeleton-bar--title" />
      <div className="skeleton-bar skeleton-bar--desc" />
      <div className="skeleton-card" />
      <div className="skeleton-grid">
        <div className="skeleton-subcard" />
        <div className="skeleton-subcard" />
      </div>
      <div className="skeleton-card skeleton-card--code" />
    </div>
  )
}

/**
 * Friendly empty state for non-pilot topics whose AI lessons are in preparation.
 */
export function LessonUnavailableState({ topicTitle, roleTitle, onBack }) {
  return (
    <div className="lesson-unavailable-card" role="status">
      <div className="unavailable-icon-wrapper">
        <Sparkles size={24} />
      </div>
      <h3 className="unavailable-title">AI Learning Module In Preparation</h3>
      <p className="unavailable-desc">
        The source-grounded technical lesson for <strong>&ldquo;{topicTitle}&rdquo;</strong> is scheduled for generation as part of the{' '}
        <strong>{roleTitle}</strong> curriculum expansion.
      </p>
      <div className="unavailable-pilot-note">
        <Compass size={14} />
        <span>
          Five foundational pilot modules are currently active under the Software Engineer track: Arrays &amp; Two-Pointers, Binary Search, BST Invariants, Graph Cycles, and Dynamic Programming.
        </span>
      </div>
      {onBack && (
        <button type="button" onClick={onBack} className="prep-btn-secondary" style={{ marginTop: 16 }}>
          <span>Explore Other {roleTitle} Milestones</span>
        </button>
      )}
    </div>
  )
}

/**
 * Recoverable error state with a retry button.
 */
export function LessonErrorState({ error, onRetry }) {
  return (
    <div className="lesson-error-card" role="alert">
      <div className="error-icon-wrapper">
        <AlertCircle size={24} />
      </div>
      <h3 className="error-title">Unable to Load Technical Lesson</h3>
      <p className="error-desc">
        {error || 'A temporary communication error occurred while retrieving this lesson from the knowledge repository.'}
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="prep-btn-primary" style={{ marginTop: 16 }}>
          <span>Retry Loading Lesson</span>
        </button>
      )}
    </div>
  )
}
