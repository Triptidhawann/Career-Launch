import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
} from 'lucide-react'

interface Opportunity {
  id: string
  company: string
  initials: string
  type: string
  category: 'internship' | 'entry' | 'hackathon'
  title: string
  location: string
  deadline: string
  matchScore: number
  tags: string[]
}

const OPPORTUNITIES_DATA: Opportunity[] = [
  {
    id: 'opp-1',
    company: 'Stripe',
    initials: 'ST',
    type: 'Summer Fellowship 2026',
    category: 'internship',
    title: 'Backend Systems Fellow',
    location: 'Hybrid • London / Dublin',
    deadline: 'Closes in 4 days',
    matchScore: 96,
    tags: ['Go', 'Concurrency', 'Distributed DBs'],
  },
  {
    id: 'opp-2',
    company: 'Cloudflare',
    initials: 'CF',
    type: 'Engineering Internship',
    category: 'internship',
    title: 'Edge Infrastructure Intern',
    location: 'Remote • Global',
    deadline: 'Closes in 6 days',
    matchScore: 92,
    tags: ['Rust', 'Networking', 'Linux Kernels'],
  },
  {
    id: 'opp-3',
    company: 'Monzo',
    initials: 'MZ',
    type: 'Graduate Placement',
    category: 'entry',
    title: 'Junior Platform Engineer',
    location: 'London • On-site',
    deadline: 'Closes in 10 days',
    matchScore: 90,
    tags: ['Microservices', 'Kubernetes', 'Go'],
  },
  {
    id: 'opp-4',
    company: 'Datadog',
    initials: 'DD',
    type: 'Early Career Path',
    category: 'entry',
    title: 'Site Reliability Apprentice',
    location: 'Paris / Amsterdam',
    deadline: 'Closes in 12 days',
    matchScore: 88,
    tags: ['Observability', 'Python', 'Cloud Arch'],
  },
  {
    id: 'opp-5',
    company: 'Systems Foundation',
    initials: 'SF',
    type: 'Annual Student Hackathon',
    category: 'hackathon',
    title: 'Global High-Throughput Challenge',
    location: 'Virtual • International',
    deadline: 'Registration closes Sunday',
    matchScore: 95,
    tags: ['Distributed Systems', '$25k Prize Pool', 'Mentorship'],
  },
  {
    id: 'opp-6',
    company: 'Campus Placement Council',
    initials: 'CP',
    type: 'Technical Masterclass',
    category: 'hackathon',
    title: 'Mastering Systems Screenings',
    location: 'Virtual • Live AMA',
    deadline: 'Live this Thursday',
    matchScore: 100,
    tags: ['Interactive Q&A', 'Recruiter Rubric', 'Resume Reviews'],
  },
]

export function Opportunities() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [savedIds, setSavedIds] = useState<string[]>(['opp-1'])

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const filteredOpportunities =
    selectedCategory === 'all'
      ? OPPORTUNITIES_DATA
      : OPPORTUNITIES_DATA.filter((opp) => opp.category === selectedCategory)

  return (
    <section id="opportunities" className="opportunities-section" aria-label="Opportunities">
      <div className="container">
        {/* Section Header */}
        <div className="opp-header-row">
          <div className="opp-header-info">
            <div className="section-eyebrow section-eyebrow--sage">
              <span className="section-eyebrow__dot" />
              <span>Opportunities That Matter</span>
            </div>

            <h2 className="section-title">
              Your next opportunity is out there.
            </h2>

            <p className="section-desc">
              Discover relevant internships, entry-level roles, hackathons, workshops,
              and career events based on your interests and skills.
            </p>
          </div>

          <Link to="/signup" className="btn btn-forest">
            <span>Discover Opportunities</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Category Filter Tabs */}
        <div className="opp-filter-tabs">
          <button
            type="button"
            className={`opp-filter-btn ${selectedCategory === 'all' ? 'opp-filter-btn--active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Opportunities ({OPPORTUNITIES_DATA.length})
          </button>
          <button
            type="button"
            className={`opp-filter-btn ${selectedCategory === 'internship' ? 'opp-filter-btn--active' : ''}`}
            onClick={() => setSelectedCategory('internship')}
          >
            Internships (2)
          </button>
          <button
            type="button"
            className={`opp-filter-btn ${selectedCategory === 'entry' ? 'opp-filter-btn--active' : ''}`}
            onClick={() => setSelectedCategory('entry')}
          >
            Entry-Level Roles (2)
          </button>
          <button
            type="button"
            className={`opp-filter-btn ${selectedCategory === 'hackathon' ? 'opp-filter-btn--active' : ''}`}
            onClick={() => setSelectedCategory('hackathon')}
          >
            Hackathons & Events (2)
          </button>
        </div>

        {/* Opportunity Card Grid */}
        <div className="opp-grid">
          {filteredOpportunities.map((opp) => {
            const isSaved = savedIds.includes(opp.id)
            return (
              <div key={opp.id} className="opp-card">
                <div>
                  <div className="opp-card__top">
                    <div className="opp-card__company">
                      <div className="opp-card__logo">{opp.initials}</div>
                      <div>
                        <div className="opp-card__company-name">{opp.company}</div>
                        <div className="opp-card__type">{opp.type}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`opp-card__save-btn ${isSaved ? 'opp-card__save-btn--saved' : ''}`}
                      onClick={() => toggleSave(opp.id)}
                      aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
                    >
                      <Bookmark size={15} fill={isSaved ? '#C66A4A' : 'none'} />
                    </button>
                  </div>

                  <h3 className="opp-card__title">{opp.title}</h3>

                  <div className="opp-card__meta-row">
                    <span className="opp-card__meta-item">
                      <MapPin size={12} />
                      {opp.location}
                    </span>
                    <span className="opp-card__meta-item">
                      <Clock size={12} color="#C66A4A" />
                      {opp.deadline}
                    </span>
                  </div>

                  <div className="opp-card__match-row">
                    <span className="opp-card__match-label">
                      <CheckCircle2 size={13} color="#879477" />
                      Readiness Match
                    </span>
                    <span className="opp-card__match-badge">{opp.matchScore}% Match</span>
                  </div>

                  <div className="opp-card__tags">
                    {opp.tags.map((tag, i) => (
                      <span key={i} className="opp-card__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <Link to="/signup" className="opp-card__action">
                  <span>View Placement Details</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )
          })}
        </div>

        {/* Bottom Editorial Strip */}
        <div className="opp-cta-strip">
          <div className="opp-cta-strip__text">
            <h3>Verified Campus Placements & Real Recruiter Deadlines</h3>
            <p>Direct employer listings connected to your verified preparation benchmarks.</p>
          </div>
          <Link to="/signup" className="btn btn-terracotta">
            <span>Explore All Listings</span>
            <ExternalLink size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Opportunities
