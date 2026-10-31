import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Compass,
  FileQuestion,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function InterviewPrep() {
  const { isAuthenticated } = useAuth()
  const capabilities = [
    {
      num: '01',
      icon: Compass,
      title: 'Role-based preparation paths',
      desc: 'Structured curricula designed around actual campus hiring rubrics for backend, frontend, systems, and cloud engineering roles.',
    },
    {
      num: '02',
      icon: BrainCircuit,
      title: 'Personalised skill-gap analysis',
      desc: 'Pinpoints specific concepts and patterns holding back your scores, turning vague interview anxiety into clear weekly improvement targets.',
    },
    {
      num: '03',
      icon: FileQuestion,
      title: 'Topic-wise practice questions',
      desc: 'Hand-picked technical challenges and system design drills complete with detailed editorial notes, alternate patterns, and complexity tradeoffs.',
    },
    {
      num: '04',
      icon: Sparkles,
      title: 'AI-assisted mock interviews & feedback',
      desc: 'Simulate high-stakes screening rounds with natural speech analysis, STAR-method rubric scoring, and objective suggestions for improvement.',
    },
  ]

  return (
    <section id="features" className="prep-section" aria-label="Interview Preparation">
      <div className="container">
        {/* Header */}
        <div className="prep-header">
          <div className="section-eyebrow">
            <span className="section-eyebrow__dot" />
            <span>Prepare With Purpose</span>
          </div>

          <h2 className="section-title">
            Confidence isn't a coincidence.
          </h2>

          <p className="section-desc">
            Know what to learn, understand what you're missing, and practise for the
            roles you want.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="prep-grid">
          {/* Left: Interactive Preparation Dashboard Preview */}
          <div className="prep-dashboard-card">
            <div className="prep-dashboard-top">
              <div className="prep-dashboard-role">
                <div className="prep-dashboard-role__icon">
                  <Terminal size={15} />
                </div>
                <div>
                  <div className="prep-dashboard-role__title">Backend Systems Path</div>
                  <div className="prep-dashboard-role__tag">Module 04: Concurrency & In-Memory Stores</div>
                </div>
              </div>
              <span className="prep-dashboard-score-pill">88% Readiness</span>
            </div>

            <div className="prep-dashboard-body">
              {/* Question Preview Box */}
              <div className="prep-question-card">
                <div className="prep-question-header">
                  <span className="prep-question-tag">Technical Design Drill</span>
                  <span className="prep-question-difficulty">Medium • 30 mins</span>
                </div>
                <div className="prep-question-title">
                  Design an Idempotent Webhook Consumer with Dead-Letter Handling
                </div>

                <div className="prep-rubric-list">
                  <div className="prep-rubric-item">
                    <CheckCircle2 size={14} />
                    <span>Deduplication key strategy with distributed lock (Redis SETNX)</span>
                  </div>
                  <div className="prep-rubric-item">
                    <CheckCircle2 size={14} />
                    <span>Handling duplicate delivery in at-least-once message queues</span>
                  </div>
                  <div className="prep-rubric-item">
                    <CheckCircle2 size={14} />
                    <span>Exponential backoff and poison pill routing to DLQ</span>
                  </div>
                </div>
              </div>

              {/* Diagnostic Metrics */}
              <div className="prep-metrics-row">
                <div className="prep-metric-box">
                  <div className="prep-metric-label">System Architecture</div>
                  <div className="prep-metric-val">92%</div>
                  <div className="prep-metric-progress">
                    <div className="prep-metric-bar" style={{ width: '92%' }} />
                  </div>
                </div>

                <div className="prep-metric-box">
                  <div className="prep-metric-label">Algorithm Complexity</div>
                  <div className="prep-metric-val">85%</div>
                  <div className="prep-metric-progress">
                    <div className="prep-metric-bar" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: 4 Capabilities Stack */}
          <div className="prep-capabilities-list">
            {capabilities.map((cap) => {
              const Icon = cap.icon
              return (
                <div key={cap.num} className="prep-capability-card">
                  <div className="prep-capability-top">
                    <span className="prep-capability-num">{cap.num}</span>
                    <div className="prep-capability-icon">
                      <Icon size={16} />
                    </div>
                  </div>
                  <h3 className="prep-capability-title">{cap.title}</h3>
                  <p className="prep-capability-desc">{cap.desc}</p>
                </div>
              )
            })}

            <div className="prep-bottom-action">
              <Link to={isAuthenticated ? '/dashboard' : '/signup'} className="btn btn-terracotta">
                <span>{isAuthenticated ? 'Go to Preparation Dashboard' : 'Explore Interview Preparation'}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InterviewPrep
