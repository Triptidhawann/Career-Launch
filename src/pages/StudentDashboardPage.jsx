import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Award,
  Brain,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Compass,
  Edit3,
  ExternalLink,
  FolderGit2,
  GraduationCap,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Sparkles,
  Target,
  Trash2,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { fetchProfile, updateProfile as apiUpdateProfile } from '@/lib/api'

function getFallbackProfile(user) {
  const displayName =
    user?.displayName || (user?.email ? user.email.split('@')[0] : 'Julian Drake')
  const email = user?.email || 'student@careerlaunch.io'
  return {
    fullName: displayName,
    email: email,
    phoneNumber: '',
    role: 'student',
    education: {
      college: 'Indian Institute of Information Technology',
      degree: 'B.Tech / B.E.',
      branch: 'Computer Science & Engineering',
      graduationYear: 2026,
      currentSemester: 6,
      cgpa: 8.8,
    },
    skills: [
      { name: 'JavaScript & React', level: 'Advanced', verified: true },
      { name: 'Node.js & Express', level: 'Advanced', verified: true },
      { name: 'Data Structures & Algorithms', level: 'Intermediate', verified: true },
      { name: 'System Design & APIs', level: 'Intermediate', verified: false },
      { name: 'MongoDB & SQL', level: 'Intermediate', verified: true },
    ],
    technologies: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Git', 'Tailwind CSS'],
    projects: [
      {
        title: 'Distributed Event-Driven Notification Engine',
        description: 'Scalable pub/sub notification service with Redis and RabbitMQ with dead-letter queue routing.',
        technologies: ['Node.js', 'Redis', 'RabbitMQ', 'Docker'],
        repoUrl: 'https://github.com',
        liveUrl: '',
      },
    ],
    certifications: [
      {
        name: 'Full Stack Web Development & Microservices',
        issuer: 'CareerLaunch Academy',
        issueDate: '2026',
        credentialUrl: '',
      },
    ],
    careerPreferences: {
      targetRoles: ['Backend Developer', 'Full Stack Engineer'],
      careerInterests: ['Backend Systems', 'Cloud & DevOps'],
      preferredLocations: ['Bangalore', 'Remote (Worldwide)'],
      workType: 'both',
      workMode: 'any',
      expectedSalary: '10 - 18 LPA',
    },
    onboarding: {
      isCompleted: true,
      stepCompleted: 4,
      completedAt: new Date().toISOString(),
    },
  }
}

export function StudentDashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(() => getFallbackProfile(user))
  const [loading, setLoading] = useState(true)

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
          if (data && data.profile) {
            setProfile(data.profile)
          } else {
            setProfile(getFallbackProfile(user))
          }
        }
      } catch (err) {
        console.warn('Dashboard note: using initialized student workspace:', err)
        if (isMounted) {
          setProfile(getFallbackProfile(user))
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
  }, [navigate, user])

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

  const currentProfile = profile || getFallbackProfile(user)
  const { score: completenessScore, items: completenessChecklist } = getProfileCompleteness(currentProfile)
  const skillsList = currentProfile.skills || []
  const advancedSkills = skillsList.filter((s) => s.level === 'Advanced')
  const intermediateSkills = skillsList.filter((s) => s.level === 'Intermediate')
  const beginnerSkills = skillsList.filter((s) => s.level === 'Beginner')

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
        <div className="container dashboard-container">
          {/* SECTION 1: Welcome Banner */}
          <section className="dashboard-welcome-banner" aria-label="Student Welcome Banner">
            <div className="dashboard-welcome-banner__content">
              <span className="dashboard-welcome-banner__label">
                CAREERLAUNCH / STUDENT WORKSPACE
              </span>
              <h1 className="dashboard-welcome-banner__title">
                Welcome back, {currentProfile.fullName || 'Student'}.
              </h1>
              <p className="dashboard-welcome-banner__subtitle">
                Your career journey is taking shape. Here&apos;s where you stand.
              </p>
            </div>
            <div className="dashboard-welcome-banner__action">
              <button
                type="button"
                onClick={() => handleOpenEditModal('academic')}
                className="dashboard-banner-edit-btn"
                aria-label="Edit student profile"
              >
                <Edit3 size={15} />
                <span>Edit Profile</span>
              </button>
            </div>
          </section>

          {/* SECTION 2: Progress Summary (Two side-by-side sections) */}
          <section className="dashboard-progress-summary" aria-label="Progress Summary">
            {/* Left: Profile Completeness */}
            <div className="dashboard-progress-card">
              <div className="progress-card__header">
                <span className="progress-card__tag">Profile Completeness</span>
                <span className="progress-card__status-label">
                  {completenessScore >= 80 ? 'Well Calibrated' : 'In Progress'}
                </span>
              </div>
              <div className="progress-card__metric">
                <span className="progress-card__number">{completenessScore}%</span>
                <span className="progress-card__sublabel">
                  {completenessChecklist.filter((i) => i.isCompleted).length} of {completenessChecklist.length} sections documented
                </span>
              </div>
              <div className="progress-card__bar-wrap">
                <div
                  className="progress-card__bar-fill"
                  style={{ width: `${completenessScore}%` }}
                />
              </div>
            </div>

            {/* Right: Interview Readiness */}
            <div className="dashboard-progress-card">
              <div className="progress-card__header">
                <span className="progress-card__tag">Interview Readiness</span>
                <span className="dashboard-readiness-badge">
                  <Brain size={14} />
                  <span>Not Assessed Yet</span>
                </span>
              </div>
              <p className="progress-card__desc">
                Interview readiness evaluates your verified problem-solving speed, data structure
                proficiency, and simulated technical interview performance. Take a readiness drill to generate your baseline score.
              </p>
            </div>
          </section>

          {/* SECTION 3: Main Workspace Heading */}
          <div className="dashboard-workspace-header">
            <h2 className="dashboard-workspace-title">Main workspace</h2>
          </div>

          {/* SECTION 4: Two-Column Workspace (68% / 32%) */}
          <div className="dashboard-workspace-grid">
            {/* Left Column (Approx 68%) */}
            <div className="dashboard-workspace-main">
              {/* A. Career Snapshot */}
              <section className="workspace-card" aria-label="Career Snapshot">
                <div className="workspace-card__header">
                  <div className="workspace-card__title-group">
                    <GraduationCap size={18} color="var(--color-forest)" />
                    <h3 className="workspace-card__title">Career Snapshot</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal('academic')}
                    className="workspace-card__action-btn"
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="snapshot-grid">
                  <div className="snapshot-cell">
                    <span className="snapshot-label">Education</span>
                    <span className="snapshot-value">
                      {currentProfile.education?.degree} &bull; {currentProfile.education?.branch || 'Engineering'}
                    </span>
                    <span className="snapshot-subtext">
                      {currentProfile.education?.college}
                    </span>
                  </div>

                  <div className="snapshot-cell">
                    <span className="snapshot-label">Academic Standing</span>
                    <span className="snapshot-value">
                      Semester {currentProfile.education?.currentSemester || 6} &bull; Class of {currentProfile.education?.graduationYear || 2026}
                    </span>
                    <span className="snapshot-subtext">
                      CGPA: {currentProfile.education?.cgpa || '8.8'} / 10.0
                    </span>
                  </div>

                  <div className="snapshot-cell">
                    <span className="snapshot-label">Target Roles</span>
                    <div className="snapshot-chips-wrap">
                      {currentProfile.careerPreferences?.targetRoles && currentProfile.careerPreferences.targetRoles.length > 0 ? (
                        currentProfile.careerPreferences.targetRoles.map((role) => (
                          <span key={role} className="snapshot-chip snapshot-chip--forest">
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="snapshot-subtext">Open to technical engineering roles</span>
                      )}
                    </div>
                  </div>

                  <div className="snapshot-cell">
                    <span className="snapshot-label">Work Preferences</span>
                    <span className="snapshot-value" style={{ textTransform: 'capitalize' }}>
                      {currentProfile.careerPreferences?.workMode || 'Any mode'} &bull; {currentProfile.careerPreferences?.workType || 'Full-time / Internship'}
                    </span>
                    <span className="snapshot-subtext">
                      Target Compensation: {currentProfile.careerPreferences?.expectedSalary || 'Industry competitive'}
                    </span>
                  </div>
                </div>

                {currentProfile.careerPreferences?.preferredLocations && currentProfile.careerPreferences.preferredLocations.length > 0 && (
                  <div className="snapshot-footer-row">
                    <span className="snapshot-label">Preferred Locations:</span>
                    <div className="snapshot-chips-wrap">
                      {currentProfile.careerPreferences.preferredLocations.map((loc) => (
                        <span key={loc} className="snapshot-chip snapshot-chip--subtle">
                          <MapPin size={11} style={{ marginRight: 3 }} />
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* B. Skills */}
              <section className="workspace-card" aria-label="Skills & Competencies">
                <div className="workspace-card__header">
                  <div className="workspace-card__title-group">
                    <Code2 size={18} color="var(--color-forest)" />
                    <h3 className="workspace-card__title">
                      Skills &amp; Competencies ({skillsList.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal('skills')}
                    className="workspace-card__action-btn"
                  >
                    <Edit3 size={14} />
                    <span>Manage Skills</span>
                  </button>
                </div>

                <div className="workspace-skills-content">
                  {/* Categorized Technical Skills */}
                  {advancedSkills.length > 0 && (
                    <div className="skills-level-group">
                      <div className="skills-level-label">
                        <span className="skills-dot skills-dot--advanced" />
                        <span>Advanced Proficiency ({advancedSkills.length})</span>
                      </div>
                      <div className="skills-chips-wrap">
                        {advancedSkills.map((s) => (
                          <div key={s.name} className="skill-chip skill-chip--advanced">
                            <CheckCircle2 size={12} color="var(--color-forest)" />
                            <span>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {intermediateSkills.length > 0 && (
                    <div className="skills-level-group">
                      <div className="skills-level-label">
                        <span className="skills-dot skills-dot--intermediate" />
                        <span>Intermediate Competencies ({intermediateSkills.length})</span>
                      </div>
                      <div className="skills-chips-wrap">
                        {intermediateSkills.map((s) => (
                          <div key={s.name} className="skill-chip skill-chip--intermediate">
                            <CheckCircle2 size={12} color="var(--color-sage-dark)" />
                            <span>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {beginnerSkills.length > 0 && (
                    <div className="skills-level-group">
                      <div className="skills-level-label">
                        <span className="skills-dot skills-dot--beginner" />
                        <span>Foundational / Exploring ({beginnerSkills.length})</span>
                      </div>
                      <div className="skills-chips-wrap">
                        {beginnerSkills.map((s) => (
                          <div key={s.name} className="skill-chip skill-chip--beginner">
                            <span>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technologies Stack Cloud */}
                  {currentProfile.technologies && currentProfile.technologies.length > 0 && (
                    <div className="skills-level-group" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-sand)' }}>
                      <div className="skills-level-label">
                        <span>Technologies &amp; Frameworks</span>
                      </div>
                      <div className="skills-chips-wrap">
                        {currentProfile.technologies.map((tech) => (
                          <span key={tech} className="snapshot-chip snapshot-chip--subtle">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interpersonal Skills */}
                  <div className="skills-level-group" style={{ marginTop: '12px' }}>
                    <div className="skills-level-label">
                      <span>Interpersonal &amp; Behavioral</span>
                    </div>
                    <div className="skills-chips-wrap">
                      {['Structured Problem Solving', 'Cross-Functional Collaboration', 'Technical Communication', 'STAR Method Articulation'].map((item) => (
                        <span key={item} className="snapshot-chip snapshot-chip--sage">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* C. Projects & Certifications (Combined Organised Section) */}
              <section className="workspace-card" aria-label="Projects and Certifications">
                <div className="workspace-card__header">
                  <div className="workspace-card__title-group">
                    <FolderGit2 size={18} color="var(--color-forest)" />
                    <h3 className="workspace-card__title">Projects &amp; Certifications</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal('projects')}
                      className="workspace-card__action-btn"
                    >
                      <Plus size={13} />
                      <span>Project</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal('certifications')}
                      className="workspace-card__action-btn"
                    >
                      <Plus size={13} />
                      <span>Certification</span>
                    </button>
                  </div>
                </div>

                <div className="proj-certs-container">
                  {/* Sub-section: Projects */}
                  <div className="proj-certs-subgroup">
                    <div className="proj-certs-subtitle">
                      <FolderGit2 size={15} color="var(--color-terracotta)" />
                      <span>Verified Technical Projects ({currentProfile.projects?.length || 0})</span>
                    </div>

                    {currentProfile.projects && currentProfile.projects.length > 0 ? (
                      <div className="proj-cards-list">
                        {currentProfile.projects.map((proj, idx) => (
                          <div key={idx} className="proj-item-card">
                            <div className="proj-item-card__header">
                              <h4 className="proj-item-card__title">{proj.title}</h4>
                              <div className="proj-item-card__links">
                                {proj.repoUrl && (
                                  <a
                                    href={proj.repoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="proj-link-btn"
                                    title="View Source Code"
                                  >
                                    <span>Code</span>
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                                {proj.liveUrl && (
                                  <a
                                    href={proj.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="proj-link-btn proj-link-btn--live"
                                    title="View Live Demo"
                                  >
                                    <span>Live</span>
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                            </div>
                            <p className="proj-item-card__desc">{proj.description}</p>
                            {proj.technologies && proj.technologies.length > 0 && (
                              <div className="proj-item-card__tags">
                                {proj.technologies.map((t) => (
                                  <span key={t} className="proj-tech-pill">{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-sub-card">
                        <p>No projects documented yet. Add your flagship projects to stand out.</p>
                      </div>
                    )}
                  </div>

                  {/* Sub-section: Certifications */}
                  <div className="proj-certs-subgroup" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--color-sand)' }}>
                    <div className="proj-certs-subtitle">
                      <Award size={15} color="var(--color-sage-dark)" />
                      <span>Accreditations &amp; Certifications ({currentProfile.certifications?.length || 0})</span>
                    </div>

                    {currentProfile.certifications && currentProfile.certifications.length > 0 ? (
                      <div className="cert-cards-list">
                        {currentProfile.certifications.map((cert, idx) => (
                          <div key={idx} className="cert-item-card">
                            <div className="cert-item-card__main">
                              <span className="cert-item-card__name">{cert.name}</span>
                              <span className="cert-item-card__issuer">
                                Issued by {cert.issuer} &bull; {cert.issueDate || '2026'}
                              </span>
                            </div>
                            {cert.credentialUrl && (
                              <a
                                href={cert.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="proj-link-btn"
                              >
                                <span>Verify</span>
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-sub-card">
                        <p>No certifications recorded yet. Add credentials to demonstrate depth.</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* D. Career Roadmap */}
              <section className="workspace-card" aria-label="Career Roadmap">
                <div className="workspace-card__header">
                  <div className="workspace-card__title-group">
                    <Target size={18} color="var(--color-forest)" />
                    <h3 className="workspace-card__title">Career Roadmap</h3>
                  </div>
                  <span className="workspace-card__meta-tag">Phase 2 Active</span>
                </div>

                <div className="workspace-roadmap-timeline">
                  {/* Milestone 1: Completed */}
                  <div className="roadmap-step roadmap-step--completed">
                    <div className="roadmap-step__marker">
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <div className="roadmap-step__body">
                      <div className="roadmap-step__header">
                        <span className="roadmap-step__title">
                          01. Academic &amp; Skills Baseline
                        </span>
                        <span className="roadmap-status-badge roadmap-status-badge--completed">
                          Completed
                        </span>
                      </div>
                      <p className="roadmap-step__desc">
                        Academic profile, course curriculum, and baseline programming competencies recorded and verified.
                      </p>
                    </div>
                  </div>

                  {/* Milestone 2: Current */}
                  <div className="roadmap-step roadmap-step--current">
                    <div className="roadmap-step__marker">
                      <span className="roadmap-step__pulse-dot" />
                    </div>
                    <div className="roadmap-step__body">
                      <div className="roadmap-step__header">
                        <span className="roadmap-step__title">
                          02. Core Technical Preparation
                        </span>
                        <span className="roadmap-status-badge roadmap-status-badge--current">
                          In Progress
                        </span>
                      </div>
                      <p className="roadmap-step__desc">
                        Role-calibrated algorithmic question bank: Arrays, Two Pointers, Trees, Graphs, and Dynamic Programming patterns.
                      </p>
                    </div>
                  </div>

                  {/* Milestone 3: Upcoming */}
                  <div className="roadmap-step roadmap-step--upcoming">
                    <div className="roadmap-step__marker">
                      <span>03</span>
                    </div>
                    <div className="roadmap-step__body">
                      <div className="roadmap-step__header">
                        <span className="roadmap-step__title">
                          03. System Architecture &amp; Engineering Depth
                        </span>
                        <span className="roadmap-status-badge roadmap-status-badge--upcoming">
                          Upcoming
                        </span>
                      </div>
                      <p className="roadmap-step__desc">
                        Database indexing, distributed caching, RESTful API contract design, and scalable microservice trade-offs.
                      </p>
                    </div>
                  </div>

                  {/* Milestone 4: Upcoming */}
                  <div className="roadmap-step roadmap-step--upcoming">
                    <div className="roadmap-step__marker">
                      <span>04</span>
                    </div>
                    <div className="roadmap-step__body">
                      <div className="roadmap-step__header">
                        <span className="roadmap-step__title">
                          04. Adaptive AI Mock Interview &amp; Placement Drives
                        </span>
                        <span className="roadmap-status-badge roadmap-status-badge--upcoming">
                          Upcoming
                        </span>
                      </div>
                      <p className="roadmap-step__desc">
                        Simulated real-time technical and behavioral interview with automated evaluation rubric and verified placement access.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Supporting Panel (Approx 32%) */}
            <aside className="dashboard-workspace-side" aria-label="Supporting actions and guidance">
              {/* Next Recommended Action */}
              <div className="side-card side-card--recommendation">
                <div className="side-card__header">
                  <span className="side-card__tag">
                    <Sparkles size={13} color="var(--color-terracotta)" />
                    <span>Next Recommended Action</span>
                  </span>
                </div>
                <h4 className="side-card__title">Take System Architecture Drill</h4>
                <p className="side-card__desc">
                  Your academic profile is ready. Solidify your technical score with an idempotent webhook consumer drill.
                </p>
                <div className="side-card__metric-badge">
                  <span>Medium &bull; 30 mins &bull; High Impact</span>
                </div>
                <button
                  type="button"
                  onClick={() => setToastMessage('Starting System Architecture Drill module...')}
                  className="side-card__cta-btn"
                >
                  <span>Start Drill</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="side-card">
                <div className="side-card__header">
                  <h4 className="side-card__title" style={{ fontSize: '0.95rem', margin: 0 }}>
                    Quick Actions
                  </h4>
                </div>
                <div className="side-actions-list">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal('academic')}
                    className="side-action-item"
                  >
                    <div className="side-action-item__icon side-action-item__icon--forest">
                      <Edit3 size={15} />
                    </div>
                    <div className="side-action-item__text">
                      <span className="side-action-item__label">Edit Profile</span>
                      <span className="side-action-item__sub">Update academics &amp; background</span>
                    </div>
                    <ChevronRight size={14} className="side-action-item__arrow" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/onboarding')}
                    className="side-action-item"
                  >
                    <div className="side-action-item__icon side-action-item__icon--terracotta">
                      <GraduationCap size={15} />
                    </div>
                    <div className="side-action-item__text">
                      <span className="side-action-item__label">Review Onboarding</span>
                      <span className="side-action-item__sub">Re-run onboarding wizard</span>
                    </div>
                    <ChevronRight size={14} className="side-action-item__arrow" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal('skills')}
                    className="side-action-item"
                  >
                    <div className="side-action-item__icon side-action-item__icon--sage">
                      <Code2 size={15} />
                    </div>
                    <div className="side-action-item__text">
                      <span className="side-action-item__label">Manage Skills</span>
                      <span className="side-action-item__sub">Add or adjust proficiencies</span>
                    </div>
                    <ChevronRight size={14} className="side-action-item__arrow" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal('preferences')}
                    className="side-action-item"
                  >
                    <div className="side-action-item__icon side-action-item__icon--sand">
                      <Briefcase size={15} />
                    </div>
                    <div className="side-action-item__text">
                      <span className="side-action-item__label">Career Preferences</span>
                      <span className="side-action-item__sub">Roles, locations &amp; salary</span>
                    </div>
                    <ChevronRight size={14} className="side-action-item__arrow" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="side-action-item"
                  >
                    <div className="side-action-item__icon side-action-item__icon--forest">
                      <Compass size={15} />
                    </div>
                    <div className="side-action-item__text">
                      <span className="side-action-item__label">Platform Overview</span>
                      <span className="side-action-item__sub">Return to public overview</span>
                    </div>
                    <ChevronRight size={14} className="side-action-item__arrow" />
                  </button>
                </div>
              </div>
            </aside>
          </div>
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
