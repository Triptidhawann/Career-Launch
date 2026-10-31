import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Compass,
  MessageSquare,
  Target,
  Terminal,
  TrendingUp,
} from 'lucide-react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

const STAGES = [
  {
    id: 'stage-1',
    number: '01',
    badge: 'Discovery',
    title: 'Discover your direction',
    description:
      'Explore career roles that match your interests, academic background, and problem-solving strengths before you invest months in preparation.',
    checklist: [
      'Role alignment diagnostic matching 40+ engineering paths',
      'Industry trend data on placement volume and growth',
      'Day-in-the-life technical breakdown for each discipline',
    ],
    previewTitle: 'Target Role Matching Matrix',
    previewIcon: Compass,
    previewTag: 'AI Matched',
    previewItems: [
      {
        title: 'Backend Systems Engineer',
        sub: 'High concurrency, distributed databases, Go & Java',
        badge: '96% Fit',
        badgeType: 'terracotta',
      },
      {
        title: 'Full-Stack Applications Lead',
        sub: 'React, TypeScript, GraphQL, cloud infrastructure',
        badge: '91% Fit',
        badgeType: 'sage',
      },
      {
        title: 'Cloud & Infrastructure Specialist',
        sub: 'Kubernetes, Terraform, AWS architecture',
        badge: '84% Fit',
        badgeType: 'sage',
      },
    ],
  },
  {
    id: 'stage-2',
    number: '02',
    badge: 'Diagnostic',
    title: 'Understand your skills',
    description:
      'Gain clear visibility into your verified strengths and pinpoint the exact knowledge gaps holding you back from clearing screening rounds.',
    checklist: [
      'Multi-dimensional skill benchmark against top campus recruiters',
      'Targeted gap analysis down to specific algorithmic topics',
      'Instant feedback on practical code readability and efficiency',
    ],
    previewTitle: 'Skills Diagnostic & Gap Report',
    previewIcon: Target,
    previewTag: 'Deep Analysis',
    previewItems: [
      {
        title: 'Data Structures & Algorithms',
        sub: 'Trees, Graphs, Dynamic Programming, Complexity',
        badge: 'Strong • 92%',
        badgeType: 'sage',
      },
      {
        title: 'System Design Principles',
        sub: 'Load balancing, caching, sharding, CAP theorem',
        badge: 'Focus • 68%',
        badgeType: 'terracotta',
      },
      {
        title: 'Database & Transaction Isolation',
        sub: 'Indexing, ACID compliance, query optimization',
        badge: 'Strong • 88%',
        badgeType: 'sage',
      },
    ],
  },
  {
    id: 'stage-3',
    number: '03',
    badge: 'Planning',
    title: 'Build your roadmap',
    description:
      'Follow an adaptive, role-specific preparation journey organized into manageable weekly sprints with clear completion criteria.',
    checklist: [
      'Curated learning sequence avoiding tutorial fatigue',
      'Time-estimated milestones synchronized with your campus calendar',
      'Automated adjustment based on your practice test performance',
    ],
    previewTitle: 'Sprint 03: Distributed Architecture',
    previewIcon: TrendingUp,
    previewTag: 'Week 4 of 8',
    previewItems: [
      {
        title: 'Milestone 1: Cache Invalidation Strategies',
        sub: 'Redis, Memcached, Write-through vs Write-back',
        badge: 'Completed',
        badgeType: 'sage',
      },
      {
        title: 'Milestone 2: Message Brokers & Kafka Streams',
        sub: 'Event-driven architectures, idempotent consumers',
        badge: 'In Progress',
        badgeType: 'terracotta',
      },
      {
        title: 'Milestone 3: Peer-Review Mock Checkpoint',
        sub: 'Live diagnostic with technical mentor',
        badge: 'Upcoming',
        badgeType: 'sage',
      },
    ],
  },
  {
    id: 'stage-4',
    number: '04',
    badge: 'Practice',
    title: 'Practise with purpose',
    description:
      'Improve continuously through hand-picked technical questions with structured explanations, hints, and alternate solution analysis.',
    checklist: [
      '800+ role-tailored technical & system design challenges',
      'Step-by-step editorial explanations focusing on intuition',
      'Real recruiter evaluation criteria for each question type',
    ],
    previewTitle: 'Technical Challenge #142',
    previewIcon: Terminal,
    previewTag: 'Algorithms Drill',
    previewItems: [
      {
        title: 'LRU Cache with O(1) Operations',
        sub: 'Doubly-linked list + hash map coordination',
        badge: 'Solved • 94%',
        badgeType: 'sage',
      },
      {
        title: 'Design a Distributed Rate Limiter',
        sub: 'Token bucket vs sliding window counter in Redis',
        badge: 'Editorial Available',
        badgeType: 'terracotta',
      },
      {
        title: 'Consistent Hashing Ring Implementation',
        sub: 'Virtual nodes and partition redistribution',
        badge: 'Recommended',
        badgeType: 'sage',
      },
    ],
  },
  {
    id: 'stage-5',
    number: '05',
    badge: 'Simulation',
    title: 'Experience mock interviews',
    description:
      'Practise under realistic pressure with structured technical and behavioral interview sessions, receiving actionable feedback instantly.',
    checklist: [
      'Realistic simulation of technical screenings & hiring manager rounds',
      'Detailed breakdown of the STAR behavioral framework',
      'Metrics on speech pacing, clarity, and architectural trade-offs',
    ],
    previewTitle: 'Mock Session Evaluation Console',
    previewIcon: MessageSquare,
    previewTag: 'Live Simulation',
    previewItems: [
      {
        title: 'Behavioral STAR Framework Score',
        sub: 'Clear conflict resolution and quantifiable impact',
        badge: 'Score: 9.2/10',
        badgeType: 'sage',
      },
      {
        title: 'Technical Communication & Clarity',
        sub: 'Explained trade-offs before writing pseudocode',
        badge: 'Score: 8.8/10',
        badgeType: 'sage',
      },
      {
        title: 'Actionable Improvement Note',
        sub: 'Spend 2 minutes confirming edge cases before designing',
        badge: 'Priority Tip',
        badgeType: 'terracotta',
      },
    ],
  },
  {
    id: 'stage-6',
    number: '06',
    badge: 'Discovery',
    title: 'Find your opportunities',
    description:
      'Connect your hard-earned preparation directly to curated internships, graduate programs, hackathons, and placement drives matching your profile.',
    checklist: [
      'Curated opportunities from tier-1 technology employers',
      'Match score indicator showing readiness for each listing',
      'Direct application checklists with verified recruiter deadlines',
    ],
    previewTitle: 'Verified Placement & Cohort Hub',
    previewIcon: Briefcase,
    previewTag: 'Active Drives',
    previewItems: [
      {
        title: 'Backend Systems Fellow — Stripe',
        sub: 'Campus Placement Drive • Remote / London • 94% Match',
        badge: 'Apply Active',
        badgeType: 'terracotta',
      },
      {
        title: 'Infrastructure Intern — Cloudflare',
        sub: 'Summer Cohort 2026 • Hybrid • 91% Match',
        badge: 'Shortlisted',
        badgeType: 'sage',
      },
      {
        title: 'Global Systems Hackathon 2026',
        sub: 'Annual competition • Cash awards & interview fast-tracks',
        badge: 'Registration Open',
        badgeType: 'sage',
      },
    ],
  },
]

export function CinematicStory() {
  const [activeStageIndex, setActiveStageIndex] = useState(0)
  const sectionRef = useRef(null)
  const pinWrapperRef = useRef(null)
  const cardRef = useRef(null)

  const activeStage = STAGES[activeStageIndex]
  const PreviewIcon = activeStage.previewIcon

  useEffect(() => {
    // Only set up scroll pinning on larger screens
    if (window.innerWidth < 860 || !sectionRef.current || !pinWrapperRef.current) {
      return
    }

    const ctx = gsap.context(() => {
      // Pinning the section for scroll storytelling
      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        pin: pinWrapperRef.current,
        start: 'top top',
        end: '+=2400',
        scrub: 0.6,
        onUpdate: (self) => {
          // Map progress (0 to 1) across the 6 stages
          const newIndex = Math.min(
            STAGES.length - 1,
            Math.floor(self.progress * STAGES.length),
          )
          setActiveStageIndex(newIndex)
        },
      })

      // Smooth card entrance scale on scroll
      gsap.from(cardRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'top top',
          scrub: true,
        },
        scale: 0.94,
        opacity: 0.85,
        y: 40,
        ease: 'power2.out',
      })

      return () => trigger.kill()
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="cinematic-story"
      className="cinematic-story-section"
      ref={sectionRef}
      aria-label="The Career Journey Experience"
    >
      {/* Ambient Forest & Terracotta Lighting */}
      <div className="cinematic-glow cinematic-glow--top" aria-hidden="true" />
      <div className="cinematic-glow cinematic-glow--bottom" aria-hidden="true" />
      <div className="cinematic-grid" aria-hidden="true" />

      <div className="cinematic-pin-wrapper" ref={pinWrapperRef}>
        {/* Opening Editorial Headline */}
        <div className="cinematic-header">
          <div className="section-eyebrow" style={{ color: '#E2A089' }}>
            <span className="section-eyebrow__dot" />
            <span>The Six-Stage Journey</span>
          </div>
          <h2 className="cinematic-headline">
            From where you are,{' '}
            <span className="cinematic-headline__accent">to where you want to be.</span>
          </h2>
        </div>

        {/* Central Transformation Card */}
        <div className="cinematic-stage-card" ref={cardRef}>
          {/* Topbar: Counter, Progress Segment Bars, Badge */}
          <div className="stage-card-topbar">
            <div className="stage-counter">
              <span className="stage-counter__current">{activeStage.number}</span>
              <span className="stage-counter__total">/ 06</span>
            </div>

            {/* Segmented Progress Bars */}
            <div className="stage-progress-bars">
              {STAGES.map((s, idx) => (
                <div
                  key={s.id}
                  className={`stage-progress-bar ${
                    idx === activeStageIndex
                      ? 'stage-progress-bar--active'
                      : idx < activeStageIndex
                      ? 'stage-progress-bar--completed'
                      : ''
                  }`}
                  onClick={() => setActiveStageIndex(idx)}
                  style={{ cursor: 'pointer' }}
                  title={`Stage ${s.number}: ${s.title}`}
                />
              ))}
            </div>

            <div className="stage-badge">{activeStage.badge}</div>
          </div>

          {/* Main Card Body */}
          <div className="stage-card-body">
            {/* Left Narrative */}
            <div className="stage-narrative">
              <span className="stage-narrative__num">STAGE {activeStage.number}</span>
              <h3 className="stage-narrative__title">{activeStage.title}</h3>
              <p className="stage-narrative__desc">{activeStage.description}</p>

              <div className="stage-narrative__features">
                {activeStage.checklist.map((item, i) => (
                  <div key={i} className="stage-feature-item">
                    <CheckCircle2 size={16} className="stage-feature-item__icon" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Interactive Mock Preview */}
            <div className="stage-preview-box">
              <div className="stage-preview-header">
                <div className="stage-preview-title">
                  <PreviewIcon size={16} color="#E2A089" />
                  <span>{activeStage.previewTitle}</span>
                </div>
                <span className="stage-preview-tag">{activeStage.previewTag}</span>
              </div>

              <div className="stage-preview-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeStage.previewItems.map((item, idx) => (
                  <div key={idx} className="stage-item-row">
                    <div className="stage-item-row__left">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#B4BFB1' }}>{item.sub}</div>
                      </div>
                    </div>
                    <span
                      className={`stage-item-row__badge ${
                        item.badgeType === 'terracotta' ? 'badge-terracotta' : 'badge-sage'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Interactive Stage Switcher */}
          <div className="stage-card-footer">
            <div className="stage-tabs">
              {STAGES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  className={`stage-tab-btn ${
                    idx === activeStageIndex ? 'stage-tab-btn--active' : ''
                  }`}
                  onClick={() => setActiveStageIndex(idx)}
                >
                  <span>{s.number}</span>
                  <span style={{ opacity: 0.85 }}>{s.title.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <div className="stage-footer-cta">
              <a href="#interview-prep" className="btn btn-terracotta" style={{ padding: '0.55rem 1.15rem' }}>
                <span>Explore Features</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CinematicStory
