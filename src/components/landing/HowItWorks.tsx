import { useState } from 'react'
import {
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

interface Step {
  num: string
  title: string
  desc: string
  output: string
  detailsTitle: string
  detailsDesc: string
  deliverables: string[]
  flowNodes: string[]
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Build your profile',
    desc: 'Input your academic coursework, personal projects, programming languages, and graduation placement target dates.',
    output: 'Output: Verified Technical Profile',
    detailsTitle: 'Step 01: Intelligent Profile Synthesis',
    detailsDesc:
      'CareerLaunch parses your coursework, GitHub repositories, and core competencies to create an accurate baseline of your current engineering readiness.',
    deliverables: [
      'Comprehensive skill taxonomy indexing 80+ technical competencies',
      'Automatic parsing of coursework, system projects, and data structures familiarity',
      'Target placement cycle timeline integration with key recruiting seasons',
    ],
    flowNodes: ['Academic Profile', 'GitHub Repos', 'Baseline Audit'],
  },
  {
    num: '02',
    title: 'Discover your direction',
    desc: 'Analyze target career pathways matched against your demonstrated problem-solving strengths and recruiter expectations.',
    output: 'Output: Role Blueprint & Gap Matrix',
    detailsTitle: 'Step 02: Directional Role Matching',
    detailsDesc:
      'Compare entry-level software engineering, backend systems, full-stack, and DevOps pathways against current recruiter evaluation benchmarks.',
    deliverables: [
      'Fit percentages calculated from real campus interview question banks',
      'Detailed skill gap breakdown highlighting highest-ROI preparation topics',
      'Competitive compensation and hiring volume trends for your target geography',
    ],
    flowNodes: ['Role Matching', 'Skill-Gap Audit', 'Target Blueprint'],
  },
  {
    num: '03',
    title: 'Prepare and practise',
    desc: 'Complete structured learning modules, topic-based coding questions, and real-time AI mock interviews with objective feedback.',
    output: 'Output: Verified Interview Readiness Score',
    detailsTitle: 'Step 03: Purposeful Preparation & Simulation',
    detailsDesc:
      'Work through progressive technical drills and interactive system design mocks, receiving instantaneous feedback on code efficiency and communication clarity.',
    deliverables: [
      'Topic-wise problem sets with in-depth conceptual editorials and alternative patterns',
      'Simulated audio/video mock rounds evaluating STAR-framework responses',
      'Continuous readiness score progression updated after every completed drill',
    ],
    flowNodes: ['Structured Roadmaps', 'Algorithm Drills', 'Live Mock Rounds'],
  },
  {
    num: '04',
    title: 'Track progress & explore',
    desc: 'Monitor readiness metrics across every hiring stage and apply directly to matching campus placement drives and internships.',
    output: 'Output: Curated Opportunity Pipeline',
    detailsTitle: 'Step 04: Placement Discovery & Direct Application',
    detailsDesc:
      'Unlock verified employer listings where your prepared skill score meets or exceeds the recruiter requirements for fast-track screening.',
    deliverables: [
      'Direct application pipelines to verified partner employers and campus drives',
      'Pre-interview checklist customized for the specific hiring company',
      'Continuous performance analytics tracking interview conversion rates',
    ],
    flowNodes: ['Readiness Badge', 'Curated Listings', 'Interview Offer'],
  },
]

export function HowItWorks() {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const currentStep = STEPS[activeStepIndex]

  return (
    <section id="how-it-works" className="how-section" aria-label="How CareerLaunch Works">
      <div className="container">
        {/* Header */}
        <div className="how-header">
          <div className="section-eyebrow">
            <span className="section-eyebrow__dot" />
            <span>The Connected Journey</span>
          </div>

          <h2 className="section-title">
            How CareerLaunch works
          </h2>

          <p className="section-desc" style={{ margin: '0 auto' }}>
            From your initial skills assessment to your first interview offer, every
            step connects into one continuous, structured progression.
          </p>
        </div>

        {/* 4 Steps Timeline Track */}
        <div className="how-timeline-container">
          <div className="how-timeline-track">
            {STEPS.map((step, idx) => (
              <div
                key={step.num}
                className={`how-step-card ${idx === activeStepIndex ? 'how-step-card--active' : ''}`}
                onClick={() => setActiveStepIndex(idx)}
              >
                <div className="how-step-num-bubble">{step.num}</div>
                <h3 className="how-step-title">{step.title}</h3>
                <p className="how-step-desc">{step.desc}</p>
                <div className="how-step-output">
                  <CheckCircle2 size={13} />
                  <span>{step.output}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deep Dive Preview Panel for Active Step */}
        <div className="how-preview-panel">
          <div className="how-preview-info">
            <div className="section-eyebrow" style={{ marginBottom: 8 }}>
              <span className="section-eyebrow__dot" />
              <span>STAGE {currentStep.num} FOCUS</span>
            </div>
            <h3>{currentStep.detailsTitle}</h3>
            <p>{currentStep.detailsDesc}</p>

            <div className="how-preview-meta-list">
              {currentStep.deliverables.map((item, i) => (
                <div key={i} className="how-preview-meta-item">
                  <CheckCircle2 size={14} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Pipeline Flow */}
          <div className="how-preview-visual">
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#5E605B', marginBottom: 12 }}>
              Continuous Lifecycle Pipeline
            </div>
            <div className="how-pipeline-flow">
              {currentStep.flowNodes.map((node, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="how-flow-node">
                    <Sparkles size={12} color="#C66A4A" />
                    <span>{node}</span>
                  </div>
                  {i < currentStep.flowNodes.length - 1 && (
                    <ChevronRight size={14} className="how-flow-arrow" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
