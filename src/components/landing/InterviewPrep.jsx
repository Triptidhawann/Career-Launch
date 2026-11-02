import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Compass,
  FileQuestion,
  LayoutGrid,
  Orbit,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { CircularCarousel } from '@/components/ui/CircularCarousel'
import { useAuth } from '@/hooks/useAuth'

// Capabilities matching the section's actual verbiage from the design
const CAPABILITY_ITEMS = [
  {
    id: '1',
    num: '01',
    tag: '01 • Role Paths',
    icon: Compass,
    title: 'Role-based preparation paths',
    description:
      'Structured curricula designed around actual campus hiring rubrics for backend, frontend, systems, and cloud engineering roles.',
  },
  {
    id: '2',
    num: '02',
    tag: '02 • Skill Gap',
    icon: BrainCircuit,
    title: 'Personalised skill-gap analysis',
    description:
      'Pinpoints specific concepts and patterns holding back your scores, turning vague interview anxiety into clear weekly improvement targets.',
  },
  {
    id: '3',
    num: '03',
    tag: '03 • Practice Drills',
    icon: FileQuestion,
    title: 'Topic-wise practice questions',
    description:
      'Hand-picked technical challenges and system design drills complete with detailed editorial notes, alternate patterns, and complexity tradeoffs.',
  },
  {
    id: '4',
    num: '04',
    tag: '04 • AI Feedback',
    icon: Sparkles,
    title: 'AI-assisted mock interviews & feedback',
    description:
      'Simulate high-stakes screening rounds with natural speech analysis, STAR-method rubric scoring, and objective suggestions for improvement.',
  },
  {
    id: '5',
    num: '05',
    tag: '05 • System Design',
    icon: Terminal,
    title: 'System architecture drills',
    description:
      'Hands-on distributed systems challenges covering deduplication locks, at-least-once message queues, and poison-pill routing.',
  },
  {
    id: '6',
    num: '06',
    tag: '06 • Benchmark',
    icon: CheckCircle2,
    title: 'Placement readiness benchmarking',
    description:
      'Calibrated evaluations measuring algorithmic depth, problem-solving speed, and architecture trade-offs against real placement bars.',
  },
]

// Dynamic drill preview details synchronized with each active capability track
const DRILL_PREVIEWS = [
  {
    roleTitle: 'Backend Systems Path',
    moduleTag: 'Module 04: Concurrency & In-Memory Stores',
    readiness: '88% Readiness',
    drillTag: 'Technical Design Drill',
    difficulty: 'Medium • 30 mins',
    drillTitle: 'Design an Idempotent Webhook Consumer with Dead-Letter Handling',
    rubrics: [
      'Deduplication key strategy with distributed lock (Redis SETNX)',
      'Handling duplicate delivery in at-least-once message queues',
      'Exponential backoff and poison pill routing to DLQ',
    ],
    metric1: { label: 'System Architecture', val: '92%' },
    metric2: { label: 'Algorithm Complexity', val: '85%' },
  },
  {
    roleTitle: 'Personalised Skill-Gap Analysis',
    moduleTag: 'Module 02: Advanced Graph Algorithms & DP',
    readiness: '84% Readiness',
    drillTag: 'Targeted Remediation Drill',
    difficulty: 'Hard • 45 mins',
    drillTitle: 'Shortest Path with Dynamic Obstacle Re-Routing',
    rubrics: [
      'Bidirectional Dijkstra vs. A* search heuristic comparison',
      'Minimizing state space explosions with bitmask memoization',
      'Space-time complexity tradeoff analysis for real-time dispatch',
    ],
    metric1: { label: 'Graph Modeling', val: '89%' },
    metric2: { label: 'Memory Efficiency', val: '82%' },
  },
  {
    roleTitle: 'Topic-Wise Question Bank',
    moduleTag: 'Module 07: Distributed Storage & Cache Invalidation',
    readiness: '91% Readiness',
    drillTag: 'System Architecture Challenge',
    difficulty: 'Medium • 35 mins',
    drillTitle: 'Cache-Aside Pattern with Write-Through Invalidation Strategy',
    rubrics: [
      'Cache stampede mitigation using probabilistic early expiration',
      'Handling replication lag between write and read replicas',
      'Strict consistency guarantees with two-phase commit fallbacks',
    ],
    metric1: { label: 'Concurrency Control', val: '94%' },
    metric2: { label: 'Throughput Optimization', val: '88%' },
  },
  {
    roleTitle: 'AI-Assisted Mock Interview',
    moduleTag: 'Module 05: Behavioral & Technical Screening Simulation',
    readiness: '93% Readiness',
    drillTag: 'Real-Time Voice Simulation',
    difficulty: 'High-Stakes • 40 mins',
    drillTitle: 'System Failure Defense & STAR Conflict Resolution Drill',
    rubrics: [
      'Structuring engineering tradeoffs with STAR methodology',
      'Defending scalability choices under real-time interviewer pushback',
      'Clear articulation of incident root causes and prevention guards',
    ],
    metric1: { label: 'STAR Articulation', val: '95%' },
    metric2: { label: 'Technical Defense', val: '90%' },
  },
  {
    roleTitle: 'Distributed Systems & Microservices',
    moduleTag: 'Module 08: Event-Driven Architectures & Sagas',
    readiness: '86% Readiness',
    drillTag: 'High-Scale Reliability Drill',
    difficulty: 'Advanced • 50 mins',
    drillTitle: 'Choreographed Saga Pattern with Compensating Transactions',
    rubrics: [
      'Partition tolerance in multi-region Kafka event streams',
      'Outbox pattern to guarantee atomic database updates and emits',
      'Compensating transaction workflows on payment reconciliation failure',
    ],
    metric1: { label: 'Resilience Engineering', val: '91%' },
    metric2: { label: 'Fault Recovery', val: '87%' },
  },
  {
    roleTitle: 'Placement Readiness Benchmark',
    moduleTag: 'Comprehensive Assessment • Tier-1 Hiring Rubric',
    readiness: '90% Readiness',
    drillTag: 'Campus Hiring Simulation',
    difficulty: 'Calibrated • 60 mins',
    drillTitle: 'Full-Stack Performance & Algorithmic Bar-Raiser Evaluation',
    rubrics: [
      'Data structures problem solving speed and edge-case coverage',
      'Production-grade code structuring with clean separation of concerns',
      'System design scalability evaluation against real campus rubrics',
    ],
    metric1: { label: 'Overall Readiness', val: '92%' },
    metric2: { label: 'Interview Calibration', val: '89%' },
  },
]

export function InterviewPrep() {
  const { isAuthenticated } = useAuth()
  const [activeIndex, setActiveIndex] = useState(0)
  const [viewMode, setViewMode] = useState('orbit') // 'orbit' (movable cards) | 'grid'

  const activeDrill = DRILL_PREVIEWS[activeIndex] || DRILL_PREVIEWS[0]

  return (
    <section id="features" className="prep-section" aria-label="Interview Preparation">
      <div className="container">
        {/* Header with Title and Mode Toggle */}
        <div className="prep-header-row">
          <div className="prep-header" style={{ marginBottom: 0 }}>
            <div className="section-eyebrow">
              <span className="section-eyebrow__dot" />
              <span>Prepare With Purpose</span>
            </div>

            <h2 className="section-title">
              Confidence isn't a coincidence.
            </h2>

            <p className="section-desc">
              Know what to learn, understand what you're missing, and practise for the roles you want.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="prep-view-toggle" role="radiogroup" aria-label="Carousel presentation mode">
            <button
              type="button"
              className={`prep-view-btn ${viewMode === 'orbit' ? 'is-active' : ''}`}
              onClick={() => setViewMode('orbit')}
              aria-checked={viewMode === 'orbit'}
              role="radio"
            >
              <Orbit size={14} />
              <span>3D Movable Orbit</span>
            </button>
            <button
              type="button"
              className={`prep-view-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-checked={viewMode === 'grid'}
              role="radio"
            >
              <LayoutGrid size={14} />
              <span>Blueprint Grid</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: 3D Movable Orbit Carousel (Default) */}
        {viewMode === 'orbit' && (
          <div className="prep-orbit-layout">
            {/* Movable 3D Circular Carousel Card Container */}
            <div className="circular-carousel-wrapper">
              <div className="circular-carousel-glow" aria-hidden="true" />
              <CircularCarousel
                items={CAPABILITY_ITEMS}
                activeIndex={activeIndex}
                onActiveChange={setActiveIndex}
                autoPlay={true}
                autoPlayInterval={4500}
              />
            </div>

            {/* Synchronized Live Drill Preview Card */}
            <div className="prep-orbit-preview-wrap">
              <div className="prep-dashboard-card">
                <div className="prep-dashboard-top">
                  <div className="prep-dashboard-role">
                    <div className="prep-dashboard-role__icon">
                      <Terminal size={15} />
                    </div>
                    <div>
                      <div className="prep-dashboard-role__title">{activeDrill.roleTitle}</div>
                      <div className="prep-dashboard-role__tag">{activeDrill.moduleTag}</div>
                    </div>
                  </div>
                  <span className="prep-dashboard-score-pill">{activeDrill.readiness}</span>
                </div>

                <div className="prep-dashboard-body">
                  <div className="prep-question-card">
                    <div className="prep-question-header">
                      <span className="prep-question-tag">{activeDrill.drillTag}</span>
                      <span className="prep-question-difficulty">{activeDrill.difficulty}</span>
                    </div>
                    <div className="prep-question-title">
                      {activeDrill.drillTitle}
                    </div>

                    <div className="prep-rubric-list">
                      {activeDrill.rubrics.map((rubric, idx) => (
                        <div key={idx} className="prep-rubric-item">
                          <CheckCircle2 size={14} />
                          <span>{rubric}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="prep-metrics-row">
                    <div className="prep-metric-box">
                      <div className="prep-metric-label">{activeDrill.metric1.label}</div>
                      <div className="prep-metric-val">{activeDrill.metric1.val}</div>
                      <div className="prep-metric-progress">
                        <div
                          className="prep-metric-bar"
                          style={{ width: activeDrill.metric1.val }}
                        />
                      </div>
                    </div>

                    <div className="prep-metric-box">
                      <div className="prep-metric-label">{activeDrill.metric2.label}</div>
                      <div className="prep-metric-val">{activeDrill.metric2.val}</div>
                      <div className="prep-metric-progress">
                        <div
                          className="prep-metric-bar"
                          style={{ width: activeDrill.metric2.val }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA Action */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              <Link to={isAuthenticated ? '/dashboard' : '/signup'} className="btn btn-terracotta">
                <span>Go to Preparation Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* VIEW 2: Classic 2-Column Side-by-Side Blueprint Grid */}
        {viewMode === 'grid' && (
          <div className="prep-grid">
            {/* Left: Interactive Preparation Dashboard Preview */}
            <div className="prep-dashboard-card">
              <div className="prep-dashboard-top">
                <div className="prep-dashboard-role">
                  <div className="prep-dashboard-role__icon">
                    <Terminal size={15} />
                  </div>
                  <div>
                    <div className="prep-dashboard-role__title">{activeDrill.roleTitle}</div>
                    <div className="prep-dashboard-role__tag">{activeDrill.moduleTag}</div>
                  </div>
                </div>
                <span className="prep-dashboard-score-pill">{activeDrill.readiness}</span>
              </div>

              <div className="prep-dashboard-body">
                <div className="prep-question-card">
                  <div className="prep-question-header">
                    <span className="prep-question-tag">{activeDrill.drillTag}</span>
                    <span className="prep-question-difficulty">{activeDrill.difficulty}</span>
                  </div>
                  <div className="prep-question-title">
                    {activeDrill.drillTitle}
                  </div>

                  <div className="prep-rubric-list">
                    {activeDrill.rubrics.map((rubric, idx) => (
                      <div key={idx} className="prep-rubric-item">
                        <CheckCircle2 size={14} />
                        <span>{rubric}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="prep-metrics-row">
                  <div className="prep-metric-box">
                    <div className="prep-metric-label">{activeDrill.metric1.label}</div>
                    <div className="prep-metric-val">{activeDrill.metric1.val}</div>
                    <div className="prep-metric-progress">
                      <div
                        className="prep-metric-bar"
                        style={{ width: activeDrill.metric1.val }}
                      />
                    </div>
                  </div>

                  <div className="prep-metric-box">
                    <div className="prep-metric-label">{activeDrill.metric2.label}</div>
                    <div className="prep-metric-val">{activeDrill.metric2.val}</div>
                    <div className="prep-metric-progress">
                      <div
                        className="prep-metric-bar"
                        style={{ width: activeDrill.metric2.val }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Capabilities Stack */}
            <div className="prep-capabilities-list">
              {CAPABILITY_ITEMS.map((cap, idx) => {
                const Icon = cap.icon
                const isSelected = idx === activeIndex
                return (
                  <div
                    key={cap.id}
                    className={`prep-capability-card ${isSelected ? 'is-active' : ''}`}
                    onClick={() => setActiveIndex(idx)}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setActiveIndex(idx)
                      }
                    }}
                  >
                    <div className="prep-capability-top">
                      <span className="prep-capability-num">{cap.num}</span>
                      <div className="prep-capability-icon">
                        <Icon size={16} />
                      </div>
                    </div>
                    <h3 className="prep-capability-title">{cap.title}</h3>
                    <p className="prep-capability-desc">{cap.description}</p>
                  </div>
                )
              })}

              <div className="prep-bottom-action">
                <Link to={isAuthenticated ? '/dashboard' : '/signup'} className="btn btn-terracotta">
                  <span>Go to Preparation Dashboard</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default InterviewPrep
