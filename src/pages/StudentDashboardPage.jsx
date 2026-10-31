import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Briefcase,
  Check,
  CheckCircle2,
  Code2,
  Compass,
  Edit3,
  ExternalLink,
  FolderGit2,
  GraduationCap,
  Info,
  Layers,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Sparkles,
  Target,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { fetchProfile, updateProfile as apiUpdateProfile } from '@/lib/api'

export function StudentDashboardPage() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Expanded Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeEditTab, setActiveEditTab] = useState('academic')
  const [editSaving, setEditSaving] = useState(false)
  const [modalError, setModalError] = useState(null)

  // Modal Form States
  const [editFullName, setEditFullName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEducation, setEditEducation] = useState({
    college: '',
    degree: '',
    branch: '',
    graduationYear: 2026,
    currentSemester: 6,
    cgpa: undefined,
  })

  // Skills Tab State
  const [editSkills, setEditSkills] = useState([])
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate')
  const [skillWarning, setSkillWarning] = useState(null)

  // Projects Tab State
  const [editProjects, setEditProjects] = useState([])

  // Certifications Tab State
  const [editCertifications, setEditCertifications] = useState([])

  // Career Preferences Tab State
  const [editTargetRoles, setEditTargetRoles] = useState([])
  const [newTargetRole, setNewTargetRole] = useState('')
  const [editWorkMode, setEditWorkMode] = useState('any')
  const [editWorkType, setEditWorkType] = useState('both')
  const [editPreferredLocations, setEditPreferredLocations] = useState([])
  const [newLocation, setNewLocation] = useState('')
  const [editExpectedSalary, setEditExpectedSalary] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      try {
        const data = await fetchProfile()
        if (isMounted) {
          if (!data.profile) {
            navigate('/onboarding')
            return
          }
          setProfile(data.profile)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load profile')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [navigate])

  // Escape key closes mobile menu or edit modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        setIsEditModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const handleSignOut = async () => {
    try {
      setMobileMenuOpen(false)
      await signOut()
      navigate('/login')
    } catch {
      navigate('/login')
    }
  }

  // Open Edit Modal seeded with existing profile data
  const handleOpenEditModal = (tab = 'academic') => {
    if (!profile) return
    setActiveEditTab(tab)
    setModalError(null)
    setSkillWarning(null)

    setEditFullName(profile.fullName || '')
    setEditPhone(profile.phoneNumber || '')
    setEditEducation({
      college: profile.education?.college || '',
      degree: profile.education?.degree || '',
      branch: profile.education?.branch || '',
      graduationYear: profile.education?.graduationYear || 2026,
      currentSemester: profile.education?.currentSemester || 6,
      cgpa: profile.education?.cgpa,
    })

    setEditSkills(profile.skills ? JSON.parse(JSON.stringify(profile.skills)) : [])
    setNewSkillName('')
    setNewSkillLevel('Intermediate')

    setEditProjects(profile.projects ? JSON.parse(JSON.stringify(profile.projects)) : [])
    setEditCertifications(
      profile.certifications ? JSON.parse(JSON.stringify(profile.certifications)) : [],
    )

    setEditTargetRoles(profile.careerPreferences?.targetRoles ? [...profile.careerPreferences.targetRoles] : [])
    setNewTargetRole('')
    setEditWorkMode(profile.careerPreferences?.workMode || 'any')
    setEditWorkType(profile.careerPreferences?.workType || 'both')
    setEditPreferredLocations(
      profile.careerPreferences?.preferredLocations ? [...profile.careerPreferences.preferredLocations] : [],
    )
    setNewLocation('')
    setEditExpectedSalary(profile.careerPreferences?.expectedSalary || '')

    setIsEditModalOpen(true)
  }

  // Skill management helpers
  const handleAddSkill = () => {
    setSkillWarning(null)
    const trimmed = newSkillName.trim()
    if (!trimmed) return

    const isDuplicate = editSkills.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase(),
    )
    if (isDuplicate) {
      setSkillWarning(`"${trimmed}" is already in your skills list.`)
      return
    }

    setEditSkills([...editSkills, { name: trimmed, level: newSkillLevel }])
    setNewSkillName('')
  }

  const handleRemoveSkill = (index) => {
    setEditSkills(editSkills.filter((_, i) => i !== index))
  }

  const handleChangeSkillLevel = (index, level) => {
    const updated = [...editSkills]
    updated[index].level = level
    setEditSkills(updated)
  }

  // Projects management helpers
  const handleAddProject = () => {
    setEditProjects([
      ...editProjects,
      { title: '', description: '', technologies: [], repoUrl: '', liveUrl: '' },
    ])
  }

  const handleUpdateProject = (index, field, value) => {
    const updated = [...editProjects]
    updated[index] = { ...updated[index], [field]: value }
    setEditProjects(updated)
  }

  const handleRemoveProject = (index) => {
    setEditProjects(editProjects.filter((_, i) => i !== index))
  }

  // Certifications management helpers
  const handleAddCertification = () => {
    setEditCertifications([
      ...editCertifications,
      { name: '', issuer: '', issueDate: '', credentialUrl: '' },
    ])
  }

  const handleUpdateCertification = (index, field, value) => {
    const updated = [...editCertifications]
    updated[index] = { ...updated[index], [field]: value }
    setEditCertifications(updated)
  }

  const handleRemoveCertification = (index) => {
    setEditCertifications(editCertifications.filter((_, i) => i !== index))
  }

  // Career Preferences helpers
  const handleAddTargetRole = () => {
    const trimmed = newTargetRole.trim()
    if (!trimmed) return
    if (!editTargetRoles.some((r) => r.toLowerCase() === trimmed.toLowerCase())) {
      setEditTargetRoles([...editTargetRoles, trimmed])
    }
    setNewTargetRole('')
  }

  const handleRemoveTargetRole = (role) => {
    setEditTargetRoles(editTargetRoles.filter((r) => r !== role))
  }

  const handleAddLocation = () => {
    const trimmed = newLocation.trim()
    if (!trimmed) return
    if (!editPreferredLocations.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      setEditPreferredLocations([...editPreferredLocations, trimmed])
    }
    setNewLocation('')
  }

  const handleRemoveLocation = (loc) => {
    setEditPreferredLocations(editPreferredLocations.filter((l) => l !== loc))
  }

  // Save changes to backend MongoDB
  const handleSaveAllEdits = async (e) => {
    e.preventDefault()
    setModalError(null)

    if (!editFullName.trim()) {
      setActiveEditTab('academic')
      setModalError('Full Name is required.')
      return
    }

    if (!editEducation.college.trim()) {
      setActiveEditTab('academic')
      setModalError('College / University name is required.')
      return
    }

    if (!editEducation.branch.trim()) {
      setActiveEditTab('academic')
      setModalError('Academic branch / specialization is required.')
      return
    }

    // Validate projects have titles
    for (let i = 0; i < editProjects.length; i++) {
      if (!editProjects[i].title.trim()) {
        setActiveEditTab('projects')
        setModalError(`Project #${i + 1} requires a title.`)
        return
      }
    }

    // Validate certifications have names
    for (let i = 0; i < editCertifications.length; i++) {
      if (!editCertifications[i].name.trim()) {
        setActiveEditTab('certifications')
        setModalError(`Certification #${i + 1} requires a name.`)
        return
      }
    }

    setEditSaving(true)

    try {
      const sanitizedProjects = editProjects
        .filter((p) => p.title.trim().length > 0)
        .map((p) => ({
          ...p,
          title: p.title.trim(),
          description: p.description?.trim() || '',
          technologies: Array.isArray(p.technologies)
            ? p.technologies
            : typeof p.technologies === 'string'
              ? p.technologies.split(',').map((t) => t.trim()).filter(Boolean)
              : [],
        }))

      const sanitizedCerts = editCertifications
        .filter((c) => c.name.trim().length > 0)
        .map((c) => ({
          ...c,
          name: c.name.trim(),
          issuer: c.issuer?.trim() || '',
          issueDate: c.issueDate?.trim() || '',
          credentialUrl: c.credentialUrl?.trim() || '',
        }))

      const payload = {
        fullName: editFullName.trim(),
        phoneNumber: editPhone.trim(),
        education: {
          college: editEducation.college.trim(),
          degree: editEducation.degree.trim(),
          branch: editEducation.branch.trim(),
          graduationYear: editEducation.graduationYear ? Number(editEducation.graduationYear) : undefined,
          currentSemester: editEducation.currentSemester ? Number(editEducation.currentSemester) : undefined,
          cgpa: editEducation.cgpa !== undefined && editEducation.cgpa !== null ? Number(editEducation.cgpa) : undefined,
        },
        skills: editSkills,
        projects: sanitizedProjects,
        certifications: sanitizedCerts,
        careerPreferences: {
          targetRoles: editTargetRoles,
          careerInterests: editTargetRoles,
          preferredLocations: editPreferredLocations,
          workType: editWorkType,
          workMode: editWorkMode,
          expectedSalary: editExpectedSalary.trim(),
        },
      }

      const res = await apiUpdateProfile(payload)
      setProfile(res.profile)
      setIsEditModalOpen(false)
      setToastMessage('Profile updated successfully! All changes are saved.')
    } catch (err) {
      setModalError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setEditSaving(false)
    }
  }

  // Calculate Profile Completeness (40% base + 20% skills + 20% projects + 10% certs + 10% roles)
  const getProfileCompleteness = (prof) => {
    if (!prof) return { score: 0, items: [] }

    const items = [
      {
        id: 'academic',
        label: 'Academic Foundation',
        weight: 40,
        isCompleted: Boolean(prof.education?.college && prof.education?.branch),
        tip: 'College, degree, and branch verified',
      },
      {
        id: 'skills',
        label: 'Technical Skills (3+ items)',
        weight: 20,
        isCompleted: Boolean(prof.skills && prof.skills.length >= 3),
        tip:
          prof.skills && prof.skills.length >= 3
            ? `${prof.skills.length} skills documented`
            : `Add ${Math.max(0, 3 - (prof.skills?.length || 0))} more skills (+20%)`,
      },
      {
        id: 'projects',
        label: 'Showcase Projects (1+ items)',
        weight: 20,
        isCompleted: Boolean(prof.projects && prof.projects.length >= 1),
        tip:
          prof.projects && prof.projects.length >= 1
            ? `${prof.projects.length} project documented`
            : 'Add at least 1 showcase project (+20%)',
      },
      {
        id: 'certifications',
        label: 'Industry Certifications (1+ items)',
        weight: 10,
        isCompleted: Boolean(prof.certifications && prof.certifications.length >= 1),
        tip:
          prof.certifications && prof.certifications.length >= 1
            ? `${prof.certifications.length} credentials documented`
            : 'Add industry credentials (+10%)',
      },
      {
        id: 'roles',
        label: 'Career Target Roles',
        weight: 10,
        isCompleted: Boolean(prof.careerPreferences?.targetRoles && prof.careerPreferences.targetRoles.length >= 1),
        tip:
          prof.careerPreferences?.targetRoles && prof.careerPreferences.targetRoles.length >= 1
            ? `${prof.careerPreferences.targetRoles.length} target roles selected`
            : 'Select at least 1 target role (+10%)',
      },
    ]

    let score = 0
    items.forEach((item) => {
      if (item.isCompleted) score += item.weight
    })

    return { score: Math.min(score, 100), items }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-ivory)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid var(--color-sand)',
            borderTopColor: 'var(--color-terracotta)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-charcoal-muted)' }}>
          Loading your student workspace...
        </p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-ivory)',
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem' }}>
          Notice
        </h2>
        <p style={{ color: 'var(--color-charcoal-muted)', maxWidth: 450 }}>
          {error || 'No profile was found. Please complete your onboarding first.'}
        </p>
        <Link to="/onboarding" className="btn btn-terracotta">
          Go to Student Onboarding
        </Link>
      </div>
    )
  }

  const { score: completenessScore, items: completenessChecklist } = getProfileCompleteness(profile)
  const advancedSkills = profile.skills.filter((s) => s.level === 'Advanced')
  const intermediateSkills = profile.skills.filter((s) => s.level === 'Intermediate')
  const beginnerSkills = profile.skills.filter((s) => s.level === 'Beginner')

  return (
    <div className="dashboard-page">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="dashboard-toast dashboard-toast--success">
          <CheckCircle2 size={18} color="var(--color-sage)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Improved Top Navbar */}
      <nav className="dashboard-nav" aria-label="Student Dashboard Navigation">
        <div className="container dashboard-nav__inner">
          <Link to="/" className="dashboard-brand" aria-label="CareerLaunch Home">
            <div className="dashboard-brand__icon">
              <Compass size={20} strokeWidth={2.4} />
            </div>
            <span className="dashboard-brand__name">
              Career<span>Launch</span>
            </span>
          </Link>

          <div className="dashboard-nav__links">
            <Link to="/dashboard" className="dashboard-nav__link active">
              <span>Dashboard</span>
            </Link>
            <Link to="/" className="dashboard-nav__link">
              <span>Platform Overview</span>
            </Link>
          </div>

          <div className="dashboard-nav__user">
            <div className="dashboard-user-pill" title={`Signed in as ${profile.fullName}`}>
              <div className="dashboard-avatar" aria-hidden="true">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="dashboard-user-info">
                <span className="dashboard-user-name">{profile.fullName}</span>
                <span className="dashboard-user-role">Student</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="dashboard-signout-btn"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>

          <button
            type="button"
            className="dashboard-nav__mobile-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`dashboard-nav__mobile-menu ${mobileMenuOpen ? 'is-open' : ''}`}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="dashboard-nav__mobile-user">
            <div className="dashboard-avatar" aria-hidden="true">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="dashboard-user-info">
              <span className="dashboard-user-name">{profile.fullName}</span>
              <span className="dashboard-user-email">{profile.email}</span>
            </div>
          </div>

          <div className="dashboard-nav__mobile-links">
            <Link
              to="/dashboard"
              className="dashboard-nav__mobile-link active"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/"
              className="dashboard-nav__mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Platform Overview
            </Link>
          </div>

          <div className="dashboard-nav__mobile-actions">
            <button
              type="button"
              onClick={handleSignOut}
              className="dashboard-nav__mobile-signout"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <div className="container">
          {/* SECTION 1: Welcome Section */}
          <section className="dashboard-welcome" aria-label="Welcome banner">
            <div className="dashboard-welcome__inner">
              <div>
                <div className="dashboard-welcome__eyebrow">
                  <Sparkles size={14} />
                  <span>Student Readiness Center</span>
                </div>
                <h1 className="dashboard-welcome__title">
                  Welcome back, {profile.fullName}
                </h1>
                <p className="dashboard-welcome__desc">
                  Here is your career preparation overview and academic baseline. Keep your profile
                  thoroughly documented to receive calibrated question sets and interview tracks.
                </p>

                <div className="dashboard-welcome__meta">
                  <div className="dashboard-meta-chip">
                    <GraduationCap size={15} />
                    <span>
                      {profile.education?.degree} &bull; {profile.education?.branch || 'Engineering'}
                    </span>
                  </div>
                  <div className="dashboard-meta-chip">
                    <Briefcase size={15} />
                    <span>
                      Target: {profile.careerPreferences?.targetRoles?.[0] || 'Software Development Engineer'}
                    </span>
                  </div>
                  <div className="dashboard-meta-chip" style={{ backgroundColor: 'rgba(135, 148, 119, 0.25)' }}>
                    <CheckCircle2 size={14} color="var(--color-sage)" />
                    <span>Baseline Verified</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-welcome__actions">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal('academic')}
                  className="dashboard-btn-edit-primary"
                >
                  <Edit3 size={15} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 2: Readiness Overview (Profile Completeness vs Interview Readiness) */}
          <section className="readiness-overview" aria-label="Readiness and baseline assessment">
            <div className="section-heading-row">
              <h2 className="section-heading">
                <Target size={20} color="var(--color-terracotta)" />
                <span>Readiness & Baseline Assessment</span>
              </h2>
              <span className="section-subheading">
                Two distinct metrics for candidate evaluation
              </span>
            </div>

            <div className="readiness-grid">
              {/* Card A: Profile Completeness */}
              <div className="readiness-card readiness-card--completeness">
                <div>
                  <div className="readiness-card__header">
                    <div>
                      <span className="readiness-card__tag readiness-card__tag--completeness">
                        Profile Metric
                      </span>
                      <h3 className="readiness-card__title">Profile Completeness</h3>
                    </div>
                  </div>

                  <div className="readiness-score-display">
                    <span className="readiness-score-number readiness-score-number--terracotta">
                      {completenessScore}%
                    </span>
                    <span className="readiness-score-max">/ 100% complete</span>
                  </div>

                  <div className="completeness-bar">
                    <div
                      className="completeness-bar__fill"
                      style={{ width: `${completenessScore}%` }}
                    />
                  </div>

                  <p className="readiness-card__desc">
                    Measures how thoroughly your academic background, technical proficiencies,
                    showcase projects, and career preferences are documented.
                  </p>
                </div>

                <div className="completeness-checklist">
                  {completenessChecklist.map((item) => (
                    <div key={item.id} className="completeness-item">
                      <div className="completeness-item__left">
                        <div
                          className={`completeness-item__check ${
                            item.isCompleted
                              ? 'completeness-item__check--done'
                              : 'completeness-item__check--pending'
                          }`}
                        >
                          {item.isCompleted ? <Check size={12} strokeWidth={3} /> : <AlertCircle size={12} />}
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <span
                        className={`completeness-item__status ${
                          item.isCompleted ? 'completeness-item__status--done' : ''
                        }`}
                      >
                        {item.tip}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card B: Interview Readiness */}
              <div className="readiness-card readiness-card--readiness">
                <div>
                  <div className="readiness-card__header">
                    <div>
                      <span className="readiness-card__tag readiness-card__tag--pending">
                        Preparation Metric
                      </span>
                      <h3 className="readiness-card__title">Interview Readiness</h3>
                    </div>
                    <span className="readiness-untested-badge">
                      <Brain size={16} color="var(--color-sage)" />
                      <span>Not Assessed Yet</span>
                    </span>
                  </div>

                  <p className="readiness-card__desc">
                    Interview readiness evaluates your verified problem-solving speed, data structure
                    proficiency, and simulated technical interview performance.
                  </p>

                  <div className="readiness-honest-box">
                    <div className="readiness-honest-box__title">
                      <Info size={16} color="var(--color-terracotta)" />
                      <span>Requires Genuine Assessment Data</span>
                    </div>
                    <p className="readiness-honest-box__text">
                      Unlike profile completeness, interview readiness cannot be calculated from
                      registration details alone. In the upcoming Interview Preparation phase, you
                      will solve coding challenges and complete adaptive mock interviews to establish
                      your verified benchmark.
                    </p>
                  </div>
                </div>

                <div>
                  <a
                    href="#roadmap"
                    className="btn btn-outline-dark"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.825rem' }}
                  >
                    <span>View Placement Roadmap</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: Career Snapshot */}
          <section className="career-snapshot-card" aria-label="Career snapshot">
            <div className="card-header-action">
              <h2 className="card-title-sm">
                <GraduationCap size={18} color="var(--color-forest)" />
                <span>Career Snapshot</span>
              </h2>
              <button
                type="button"
                onClick={() => handleOpenEditModal('academic')}
                className="btn-card-action"
              >
                <Edit3 size={13} />
                <span>Edit Academic & Career Info</span>
              </button>
            </div>

            <div className="career-snapshot-grid">
              {/* Column 1: Academic & Contact */}
              <div className="career-snapshot-column">
                <span className="career-snapshot-column__title">
                  <User size={14} />
                  <span>Academic & Contact Baseline</span>
                </span>

                <div className="snapshot-detail-row">
                  <span className="snapshot-label">College / University</span>
                  <span className="snapshot-value">
                    {profile.education?.college || 'Not specified'}
                  </span>
                </div>

                <div className="snapshot-detail-row">
                  <span className="snapshot-label">Degree & Branch</span>
                  <span className="snapshot-value">
                    {profile.education?.degree} &bull; {profile.education?.branch}
                  </span>
                </div>

                <div className="snapshot-detail-row">
                  <span className="snapshot-label">Graduation Batch & Semester</span>
                  <span className="snapshot-value">
                    Class of {profile.education?.graduationYear || '2026'}{' '}
                    {profile.education?.currentSemester
                      ? `• Semester ${profile.education.currentSemester}`
                      : ''}
                  </span>
                </div>

                <div className="snapshot-detail-row">
                  <span className="snapshot-label">Cumulative GPA / Score</span>
                  <span className="snapshot-value">
                    {profile.education?.cgpa !== undefined && profile.education?.cgpa !== null
                      ? `${profile.education.cgpa} / 10.0`
                      : 'Not provided'}
                  </span>
                </div>

                <div className="snapshot-detail-row">
                  <span className="snapshot-label">Email & Phone</span>
                  <span className="snapshot-value snapshot-value--sub">
                    {profile.email} {profile.phoneNumber ? `• ${profile.phoneNumber}` : ''}
                  </span>
                </div>
              </div>

              {/* Column 2: Career Preferences */}
              <div className="career-snapshot-column">
                <span className="career-snapshot-column__title">
                  <Briefcase size={14} />
                  <span>Placement Preferences</span>
                </span>

                <div className="snapshot-detail-row">
                  <span className="snapshot-label">Target Positions</span>
                  <div className="snapshot-tags-wrap">
                    {profile.careerPreferences?.targetRoles && profile.careerPreferences.targetRoles.length > 0 ? (
                      profile.careerPreferences.targetRoles.map((role) => (
                        <span key={role} className="snapshot-tag snapshot-tag--primary">
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="snapshot-value snapshot-value--sub">No target roles selected</span>
                    )}
                  </div>
                </div>

                <div className="snapshot-detail-row">
                  <span className="snapshot-label">Preferred Locations</span>
                  <div className="snapshot-tags-wrap">
                    {profile.careerPreferences?.preferredLocations && profile.careerPreferences.preferredLocations.length > 0 ? (
                      profile.careerPreferences.preferredLocations.map((loc) => (
                        <span key={loc} className="snapshot-tag">
                          <MapPin size={11} style={{ display: 'inline', marginRight: 3 }} />
                          {loc}
                        </span>
                      ))
                    ) : (
                      <span className="snapshot-value snapshot-value--sub">Open to any location</span>
                    )}
                  </div>
                </div>

                <div className="snapshot-detail-row">
                  <span className="snapshot-label">Work Environment & Type</span>
                  <span className="snapshot-value snapshot-value--sub" style={{ textTransform: 'capitalize' }}>
                    {profile.careerPreferences?.workMode || 'Any mode'}{' '}
                    &bull; {profile.careerPreferences?.workType || 'Full-time / Internship'}
                  </span>
                </div>

                <div className="snapshot-detail-row">
                  <span className="snapshot-label">Target CTC / Salary Range</span>
                  <span className="snapshot-value">
                    {profile.careerPreferences?.expectedSalary || 'Open to industry standards'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: Skills and Technologies */}
          <section className="skills-showcase-card" aria-label="Skills and technologies">
            <div className="card-header-action">
              <h2 className="card-title-sm">
                <Code2 size={18} color="var(--color-forest)" />
                <span>Documented Skills & Competencies ({profile.skills?.length || 0})</span>
              </h2>
              <button
                type="button"
                onClick={() => handleOpenEditModal('skills')}
                className="btn-card-action"
              >
                <Plus size={13} />
                <span>Manage Skills</span>
              </button>
            </div>

            {profile.skills && profile.skills.length > 0 ? (
              <div>
                {advancedSkills.length > 0 && (
                  <div className="skills-tier-group">
                    <div className="skills-tier-header">
                      <span>Advanced Proficiency ({advancedSkills.length})</span>
                    </div>
                    <div className="skills-chips-wrap">
                      {advancedSkills.map((s) => (
                        <span key={s.name} className="skill-chip skill-chip--advanced">
                          <CheckCircle2 size={13} color="var(--color-forest)" />
                          <span>{s.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {intermediateSkills.length > 0 && (
                  <div className="skills-tier-group">
                    <div className="skills-tier-header">
                      <span>Intermediate Proficiency ({intermediateSkills.length})</span>
                    </div>
                    <div className="skills-chips-wrap">
                      {intermediateSkills.map((s) => (
                        <span key={s.name} className="skill-chip skill-chip--intermediate">
                          <span>{s.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {beginnerSkills.length > 0 && (
                  <div className="skills-tier-group">
                    <div className="skills-tier-header">
                      <span>Foundational / Beginner ({beginnerSkills.length})</span>
                    </div>
                    <div className="skills-chips-wrap">
                      {beginnerSkills.map((s) => (
                        <span key={s.name} className="skill-chip skill-chip--beginner">
                          <span>{s.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.technologies && profile.technologies.length > 0 && (
                  <div className="tech-tag-cloud">
                    <div className="tech-tag-cloud__title">
                      Technologies Across Stack & Projects ({profile.technologies.length})
                    </div>
                    <div className="skills-chips-wrap">
                      {profile.technologies.map((tech) => (
                        <span key={tech} className="tech-tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state-box">
                <Code2 size={24} color="var(--color-charcoal-muted)" />
                <p>No technical skills documented yet.</p>
                <button
                  type="button"
                  onClick={() => handleOpenEditModal('skills')}
                  className="empty-state-btn"
                >
                  <Plus size={13} />
                  <span>Add Technical Skills</span>
                </button>
              </div>
            )}
          </section>

          {/* SECTION 5: Projects and Certifications */}
          <section className="projects-certs-grid" aria-label="Projects and certifications">
            {/* Column 1: Projects */}
            <div className="projects-column-card">
              <div className="card-header-action">
                <h2 className="card-title-sm">
                  <FolderGit2 size={18} color="var(--color-terracotta)" />
                  <span>Showcase Projects ({profile.projects?.length || 0})</span>
                </h2>
                <button
                  type="button"
                  onClick={() => handleOpenEditModal('projects')}
                  className="btn-card-action"
                >
                  <Plus size={13} />
                  <span>Add Project</span>
                </button>
              </div>

              {profile.projects && profile.projects.length > 0 ? (
                <div>
                  {profile.projects.map((proj, idx) => (
                    <div key={idx} className="project-item">
                      <div className="project-item__top">
                        <span className="project-item__title">{proj.title}</span>
                        <div className="project-item__links">
                          {proj.repoUrl && (
                            <a
                              href={proj.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="project-link-pill"
                              title="View repository"
                            >
                              <span>Code</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="project-link-pill"
                              title="View live deployment"
                            >
                              <span>Demo</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>

                      {proj.description && (
                        <p className="project-item__desc">{proj.description}</p>
                      )}

                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="project-item__techs">
                          {proj.technologies.map((tech) => (
                            <span key={tech} className="tech-tag">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-box">
                  <FolderGit2 size={24} color="var(--color-charcoal-muted)" />
                  <p>No showcase projects documented yet.</p>
                  <span style={{ fontSize: '0.775rem' }}>
                    Documenting at least 1 project increases profile completeness by +20%.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal('projects')}
                    className="empty-state-btn"
                  >
                    <Plus size={13} />
                    <span>Add Project</span>
                  </button>
                </div>
              )}
            </div>

            {/* Column 2: Certifications */}
            <div className="certs-column-card">
              <div className="card-header-action">
                <h2 className="card-title-sm">
                  <Award size={18} color="var(--color-sage)" />
                  <span>Industry Credentials ({profile.certifications?.length || 0})</span>
                </h2>
                <button
                  type="button"
                  onClick={() => handleOpenEditModal('certifications')}
                  className="btn-card-action"
                >
                  <Plus size={13} />
                  <span>Add Credential</span>
                </button>
              </div>

              {profile.certifications && profile.certifications.length > 0 ? (
                <div>
                  {profile.certifications.map((cert, idx) => (
                    <div key={idx} className="cert-item-row">
                      <div>
                        <div className="cert-item__name">{cert.name}</div>
                        <div className="cert-item__issuer">
                          {cert.issuer} {cert.issueDate ? `• ${cert.issueDate}` : ''}
                        </div>
                      </div>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="project-link-pill"
                          title="Verify credential"
                        >
                          <span>Verify</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-box">
                  <Award size={24} color="var(--color-charcoal-muted)" />
                  <p>No industry certifications added yet.</p>
                  <span style={{ fontSize: '0.775rem' }}>
                    Adding credentials validates specialized engineering competency.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal('certifications')}
                    className="empty-state-btn"
                  >
                    <Plus size={13} />
                    <span>Add Certification</span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 6: Placement Roadmap */}
          <section id="roadmap" className="placement-roadmap-card" aria-label="Placement roadmap">
            <div className="card-header-action">
              <h2 className="card-title-sm">
                <BookOpen size={18} color="var(--color-forest)" />
                <span>Placement Roadmap & Milestone Progress</span>
              </h2>
              <span className="section-subheading">
                Step-by-step technical progression
              </span>
            </div>

            <div className="roadmap-timeline">
              {/* Milestone 1: Profile & Baseline */}
              <div
                className={`roadmap-milestone ${
                  profile.onboarding?.isCompleted
                    ? 'roadmap-milestone--completed'
                    : 'roadmap-milestone--in-progress'
                }`}
              >
                <div className="milestone-badge">
                  {profile.onboarding?.isCompleted ? <Check size={18} strokeWidth={2.6} /> : '1'}
                </div>
                <div className="milestone-content">
                  <div className="milestone-header">
                    <div className="milestone-title-wrap">
                      <span className="milestone-title">Profile & Career Baseline</span>
                      <span className="milestone-subtitle">&bull; Candidate Foundation</span>
                    </div>
                    <span className="milestone-status-pill milestone-status-pill--completed">
                      {profile.onboarding?.isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <p className="milestone-desc">
                    Academic details, verified technical competencies, showcase projects, and target
                    career preferences successfully documented in your permanent record.
                  </p>
                  <div className="milestone-meta">
                    ✓ Completed and verified in database
                  </div>
                </div>
              </div>

              {/* Milestone 2: DSA & Problem Solving */}
              <div className="roadmap-milestone roadmap-milestone--not-started">
                <div className="milestone-badge">2</div>
                <div className="milestone-content">
                  <div className="milestone-header">
                    <div className="milestone-title-wrap">
                      <span className="milestone-title">DSA & Problem Solving</span>
                      <span className="milestone-subtitle">&bull; Algorithmic Mastery</span>
                    </div>
                    <span className="milestone-status-pill milestone-status-pill--not-started">
                      Not Started
                    </span>
                  </div>
                  <p className="milestone-desc">
                    Role-calibrated algorithmic question bank: Arrays, Two Pointers, Trees, Graphs,
                    and Dynamic Programming patterns designed for top tech placement drives.
                  </p>
                  <div className="milestone-meta" style={{ color: 'var(--color-charcoal-muted)' }}>
                    • Preparation module unlocks in Phase 4 &bull; 0 / 150 problems solved
                  </div>
                </div>
              </div>

              {/* Milestone 3: System Architecture */}
              <div className="roadmap-milestone roadmap-milestone--not-started">
                <div className="milestone-badge">3</div>
                <div className="milestone-content">
                  <div className="milestone-header">
                    <div className="milestone-title-wrap">
                      <span className="milestone-title">System Architecture & Engineering Depth</span>
                      <span className="milestone-subtitle">&bull; Core CS & Design</span>
                    </div>
                    <span className="milestone-status-pill milestone-status-pill--not-started">
                      Not Started
                    </span>
                  </div>
                  <p className="milestone-desc">
                    Database indexing, distributed caching, RESTful API contract design, and scalable
                    microservice architectural trade-offs.
                  </p>
                  <div className="milestone-meta" style={{ color: 'var(--color-charcoal-muted)' }}>
                    • Prerequisite: Complete DSA coding baseline
                  </div>
                </div>
              </div>

              {/* Milestone 4: Adaptive AI Mock Interview */}
              <div className="roadmap-milestone roadmap-milestone--not-started">
                <div className="milestone-badge">4</div>
                <div className="milestone-content">
                  <div className="milestone-header">
                    <div className="milestone-title-wrap">
                      <span className="milestone-title">Adaptive AI Mock Interview</span>
                      <span className="milestone-subtitle">&bull; Simulated Rounds</span>
                    </div>
                    <span className="milestone-status-pill milestone-status-pill--not-started">
                      Not Started
                    </span>
                  </div>
                  <p className="milestone-desc">
                    Simulated real-time technical and behavioral interview with automated evaluation
                    rubric and personalized score feedback.
                  </p>
                  <div className="milestone-meta" style={{ color: 'var(--color-charcoal-muted)' }}>
                    • Prerequisite: Complete foundational milestones
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 7: Quick Actions */}
          <section className="quick-actions-section" aria-label="Quick actions">
            <div className="section-heading-row">
              <h2 className="section-heading">
                <Layers size={18} color="var(--color-forest)" />
                <span>Quick Actions</span>
              </h2>
            </div>

            <div className="quick-actions-grid">
              <button
                type="button"
                onClick={() => handleOpenEditModal('academic')}
                className="quick-action-card"
              >
                <div className="quick-action-icon quick-action-icon--terracotta">
                  <Edit3 size={18} />
                </div>
                <div>
                  <div className="quick-action-title">Edit Full Profile</div>
                  <div className="quick-action-subtitle">Update academics, skills & projects</div>
                </div>
              </button>

              <Link to="/onboarding" className="quick-action-card">
                <div className="quick-action-icon quick-action-icon--forest">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <div className="quick-action-title">Review Onboarding</div>
                  <div className="quick-action-subtitle">Re-run setup wizard</div>
                </div>
              </Link>

              <Link to="/" className="quick-action-card">
                <div className="quick-action-icon quick-action-icon--sage">
                  <Compass size={18} />
                </div>
                <div>
                  <div className="quick-action-title">Platform Overview</div>
                  <div className="quick-action-subtitle">Explore product features</div>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => handleOpenEditModal('preferences')}
                className="quick-action-card"
              >
                <div className="quick-action-icon quick-action-icon--sand">
                  <Briefcase size={18} />
                </div>
                <div>
                  <div className="quick-action-title">Career Preferences</div>
                  <div className="quick-action-subtitle">Adjust target roles & mode</div>
                </div>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* SECTION 5: Expanded Profile Editing Modal (5 Tabs) */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-header__title">
                <Edit3 size={20} color="var(--color-terracotta)" />
                <span>Edit Student Profile</span>
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* 5-Tab Navigation Bar */}
            <div className="modal-tabs" role="tablist">
              <button
                type="button"
                className={`modal-tab-btn ${activeEditTab === 'academic' ? 'is-active' : ''}`}
                onClick={() => setActiveEditTab('academic')}
              >
                <GraduationCap size={15} />
                <span>Academic & Contact</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${activeEditTab === 'skills' ? 'is-active' : ''}`}
                onClick={() => setActiveEditTab('skills')}
              >
                <Code2 size={15} />
                <span>Skills ({editSkills.length})</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${activeEditTab === 'projects' ? 'is-active' : ''}`}
                onClick={() => setActiveEditTab('projects')}
              >
                <FolderGit2 size={15} />
                <span>Projects ({editProjects.length})</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${activeEditTab === 'certifications' ? 'is-active' : ''}`}
                onClick={() => setActiveEditTab('certifications')}
              >
                <Award size={15} />
                <span>Certifications ({editCertifications.length})</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${activeEditTab === 'preferences' ? 'is-active' : ''}`}
                onClick={() => setActiveEditTab('preferences')}
              >
                <Briefcase size={15} />
                <span>Preferences</span>
              </button>
            </div>

            {/* Modal Body & Forms */}
            <form onSubmit={handleSaveAllEdits} style={{ display: 'contents' }}>
              <div className="modal-body">
                {modalError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(198, 106, 74, 0.12)',
                      border: '1px solid rgba(198, 106, 74, 0.35)',
                      color: '#8A3B22',
                      fontSize: '0.825rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* TAB 1: Academic & Contact */}
                {activeEditTab === 'academic' && (
                  <div>
                    <div className="modal-form-grid">
                      <div className="modal-form-field">
                        <label htmlFor="editFullName">Full Name *</label>
                        <input
                          id="editFullName"
                          type="text"
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          required
                        />
                      </div>

                      <div className="modal-form-field">
                        <label htmlFor="editPhone">Phone Number</label>
                        <input
                          id="editPhone"
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="modal-form-field">
                      <label htmlFor="editCollege">College / University *</label>
                      <input
                        id="editCollege"
                        type="text"
                        value={editEducation.college}
                        onChange={(e) =>
                          setEditEducation({ ...editEducation, college: e.target.value })
                        }
                        placeholder="e.g. Indian Institute of Technology"
                        required
                      />
                    </div>

                    <div className="modal-form-grid">
                      <div className="modal-form-field">
                        <label htmlFor="editDegree">Degree</label>
                        <input
                          id="editDegree"
                          type="text"
                          value={editEducation.degree}
                          onChange={(e) =>
                            setEditEducation({ ...editEducation, degree: e.target.value })
                          }
                          placeholder="e.g. B.Tech"
                        />
                      </div>

                      <div className="modal-form-field">
                        <label htmlFor="editBranch">Branch / Specialization *</label>
                        <input
                          id="editBranch"
                          type="text"
                          value={editEducation.branch}
                          onChange={(e) =>
                            setEditEducation({ ...editEducation, branch: e.target.value })
                          }
                          placeholder="e.g. Computer Science & Engineering"
                          required
                        />
                      </div>
                    </div>

                    <div className="modal-form-grid">
                      <div className="modal-form-field">
                        <label htmlFor="editGradYear">Expected Graduation Year</label>
                        <input
                          id="editGradYear"
                          type="number"
                          value={editEducation.graduationYear || 2026}
                          onChange={(e) =>
                            setEditEducation({
                              ...editEducation,
                              graduationYear: Number(e.target.value),
                            })
                          }
                        />
                      </div>

                      <div className="modal-form-field">
                        <label htmlFor="editCgpa">Current CGPA (out of 10.0)</label>
                        <input
                          id="editCgpa"
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={editEducation.cgpa !== undefined && editEducation.cgpa !== null ? editEducation.cgpa : ''}
                          onChange={(e) =>
                            setEditEducation({
                              ...editEducation,
                              cgpa: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                          }
                          placeholder="e.g. 8.4"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Skills */}
                {activeEditTab === 'skills' && (
                  <div>
                    {skillWarning && (
                      <div
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(198, 106, 74, 0.1)',
                          color: '#8A3B22',
                          fontSize: '0.8rem',
                          marginBottom: 12,
                        }}
                      >
                        {skillWarning}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                      <input
                        type="text"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        placeholder="Add skill (e.g. TypeScript, Redis, Docker...)"
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-sand-dark)' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddSkill()
                          }
                        }}
                      />
                      <select
                        value={newSkillLevel}
                        onChange={(e) => setNewSkillLevel(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-sand-dark)' }}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="btn btn-forest"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.825rem' }}
                      >
                        <Plus size={14} />
                        <span>Add</span>
                      </button>
                    </div>

                    <div className="modal-item-list">
                      {editSkills.map((skill, index) => (
                        <div
                          key={skill.name}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            backgroundColor: 'var(--color-ivory)',
                            borderRadius: '6px',
                            border: '1px solid var(--color-sand)',
                          }}
                        >
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {skill.name}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <select
                              value={skill.level}
                              onChange={(e) =>
                                handleChangeSkillLevel(index, e.target.value)
                              }
                              style={{
                                fontSize: '0.75rem',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                border: '1px solid var(--color-sand-dark)',
                              }}
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(index)}
                              className="btn-remove-sm"
                              title="Delete skill"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: Projects */}
                {activeEditTab === 'projects' && (
                  <div>
                    <div className="modal-item-list">
                      {editProjects.map((proj, idx) => (
                        <div key={idx} className="modal-item-card">
                          <div className="modal-item-card__header">
                            <span className="modal-item-card__title">Project #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveProject(idx)}
                              className="btn-remove-sm"
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </button>
                          </div>

                          <div className="modal-form-field">
                            <label>Project Title *</label>
                            <input
                              type="text"
                              value={proj.title}
                              onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                              placeholder="e.g. Distributed Task Queue"
                              required
                            />
                          </div>

                          <div className="modal-form-field">
                            <label>Description & Scope</label>
                            <textarea
                              rows={2}
                              value={proj.description}
                              onChange={(e) =>
                                handleUpdateProject(idx, 'description', e.target.value)
                              }
                              placeholder="What does it do and what technical problem did it solve?"
                            />
                          </div>

                          <div className="modal-form-field">
                            <label>Technologies Used (comma separated)</label>
                            <input
                              type="text"
                              value={
                                Array.isArray(proj.technologies)
                                  ? proj.technologies.join(', ')
                                  : (proj.technologies || '')
                              }
                              onChange={(e) =>
                                handleUpdateProject(
                                  idx,
                                  'technologies',
                                  e.target.value.split(',').map((t) => t.trim()),
                                )
                              }
                              placeholder="e.g. React, Node.js, Redis, Docker"
                            />
                          </div>

                          <div className="modal-form-grid">
                            <div className="modal-form-field">
                              <label>GitHub Repo URL</label>
                              <input
                                type="url"
                                value={proj.repoUrl || ''}
                                onChange={(e) =>
                                  handleUpdateProject(idx, 'repoUrl', e.target.value)
                                }
                                placeholder="https://github.com/..."
                              />
                            </div>
                            <div className="modal-form-field">
                              <label>Live Demo URL</label>
                              <input
                                type="url"
                                value={proj.liveUrl || ''}
                                onChange={(e) =>
                                  handleUpdateProject(idx, 'liveUrl', e.target.value)
                                }
                                placeholder="https://project.dev"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="btn-add-repeater"
                    >
                      <Plus size={14} />
                      <span>Add Another Project</span>
                    </button>
                  </div>
                )}

                {/* TAB 4: Certifications */}
                {activeEditTab === 'certifications' && (
                  <div>
                    <div className="modal-item-list">
                      {editCertifications.map((cert, idx) => (
                        <div key={idx} className="modal-item-card">
                          <div className="modal-item-card__header">
                            <span className="modal-item-card__title">
                              Certification #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCertification(idx)}
                              className="btn-remove-sm"
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </button>
                          </div>

                          <div className="modal-form-grid">
                            <div className="modal-form-field">
                              <label>Certification Name *</label>
                              <input
                                type="text"
                                value={cert.name}
                                onChange={(e) =>
                                  handleUpdateCertification(idx, 'name', e.target.value)
                                }
                                placeholder="e.g. AWS Certified Solutions Architect"
                                required
                              />
                            </div>

                            <div className="modal-form-field">
                              <label>Issuing Body</label>
                              <input
                                type="text"
                                value={cert.issuer}
                                onChange={(e) =>
                                  handleUpdateCertification(idx, 'issuer', e.target.value)
                                }
                                placeholder="e.g. Amazon Web Services, Meta"
                              />
                            </div>
                          </div>

                          <div className="modal-form-grid">
                            <div className="modal-form-field">
                              <label>Issue Date</label>
                              <input
                                type="text"
                                value={cert.issueDate || ''}
                                onChange={(e) =>
                                  handleUpdateCertification(idx, 'issueDate', e.target.value)
                                }
                                placeholder="e.g. Dec 2025"
                              />
                            </div>

                            <div className="modal-form-field">
                              <label>Credential Verification URL</label>
                              <input
                                type="url"
                                value={cert.credentialUrl || ''}
                                onChange={(e) =>
                                  handleUpdateCertification(idx, 'credentialUrl', e.target.value)
                                }
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCertification}
                      className="btn-add-repeater"
                    >
                      <Plus size={14} />
                      <span>Add Another Certification</span>
                    </button>
                  </div>
                )}

                {/* TAB 5: Career Preferences */}
                {activeEditTab === 'preferences' && (
                  <div>
                    <div className="modal-form-field">
                      <label>Target Roles</label>
                      <div className="snapshot-tags-wrap" style={{ marginBottom: 8 }}>
                        {editTargetRoles.map((role) => (
                          <span
                            key={role}
                            className="snapshot-tag snapshot-tag--primary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          >
                            <span>{role}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTargetRole(role)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          value={newTargetRole}
                          onChange={(e) => setNewTargetRole(e.target.value)}
                          placeholder="e.g. Backend Engineer, Full Stack Developer..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddTargetRole()
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddTargetRole}
                          className="btn btn-forest"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.825rem' }}
                        >
                          <Plus size={14} />
                          <span>Add Role</span>
                        </button>
                      </div>
                    </div>

                    <div className="modal-form-grid">
                      <div className="modal-form-field">
                        <label htmlFor="editWorkMode">Work Mode</label>
                        <select
                          id="editWorkMode"
                          value={editWorkMode}
                          onChange={(e) => setEditWorkMode(e.target.value)}
                        >
                          <option value="any">Open to Any (Remote / Hybrid / On-site)</option>
                          <option value="remote">Remote Only</option>
                          <option value="hybrid">Hybrid</option>
                          <option value="on-site">On-Site</option>
                        </select>
                      </div>

                      <div className="modal-form-field">
                        <label htmlFor="editWorkType">Employment Type</label>
                        <select
                          id="editWorkType"
                          value={editWorkType}
                          onChange={(e) => setEditWorkType(e.target.value)}
                        >
                          <option value="both">Both (Full-time & Internship)</option>
                          <option value="full-time">Full-time Only</option>
                          <option value="internship">Internship Only</option>
                        </select>
                      </div>
                    </div>

                    <div className="modal-form-field">
                      <label>Preferred Locations</label>
                      <div className="snapshot-tags-wrap" style={{ marginBottom: 8 }}>
                        {editPreferredLocations.map((loc) => (
                          <span
                            key={loc}
                            className="snapshot-tag"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          >
                            <span>{loc}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveLocation(loc)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          placeholder="e.g. Bangalore, Pune, Remote..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddLocation()
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddLocation}
                          className="btn btn-forest"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.825rem' }}
                        >
                          <Plus size={14} />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>

                    <div className="modal-form-field">
                      <label htmlFor="editExpectedSalary">Expected Salary / CTC Range</label>
                      <input
                        id="editExpectedSalary"
                        type="text"
                        value={editExpectedSalary}
                        onChange={(e) => setEditExpectedSalary(e.target.value)}
                        placeholder="e.g. 10 - 18 LPA"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Action Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="btn btn-terracotta"
                >
                  <span>{editSaving ? 'Saving Changes...' : 'Save All Changes'}</span>
                  <Check size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboardPage
