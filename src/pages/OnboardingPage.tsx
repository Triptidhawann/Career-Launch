import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  CheckCircle2,
  Code2,
  FolderGit2,
  GraduationCap,
  LogOut,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { fetchOnboardingStatus, fetchProfile, submitOnboarding } from '@/lib/api'
import type {
  Certification,
  Education,
  Project,
  Skill,
  SkillLevel,
} from '@/types/profile'

const CURATED_SKILLS = [
  'Data Structures & Algorithms',
  'Java',
  'Python',
  'C++',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Express.js',
  'SQL / MySQL',
  'MongoDB',
  'System Design',
  'Git & GitHub',
  'AWS',
  'Docker',
  'Machine Learning',
  'REST APIs',
  'Next.js',
]

const TARGET_ROLE_OPTIONS = [
  'Software Development Engineer (SDE)',
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'Data Analyst / Scientist',
  'Machine Learning Engineer',
  'DevOps / Cloud Engineer',
  'Quality Assurance Engineer',
]

const LOCATION_OPTIONS = [
  'Bangalore',
  'Hyderabad',
  'Pune',
  'Delhi NCR',
  'Mumbai',
  'Chennai',
  'Remote (Worldwide)',
]

export function OnboardingPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [checkingOnboarded, setCheckingOnboarded] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Academic & Contact
  const [fullName, setFullName] = useState(user?.displayName || '')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [education, setEducation] = useState<Education>({
    college: '',
    degree: 'B.Tech / B.E.',
    branch: 'Computer Science & Engineering',
    graduationYear: 2026,
    currentSemester: 6,
    cgpa: 8.0,
  })

  // Step 2: Skills
  const [skills, setSkills] = useState<Skill[]>([
    { name: 'Data Structures & Algorithms', level: 'Intermediate' },
    { name: 'Java', level: 'Intermediate' },
    { name: 'React', level: 'Intermediate' },
  ])
  const [customSkillInput, setCustomSkillInput] = useState('')

  // Step 3: Projects & Certifications
  const [projects, setProjects] = useState<Project[]>([
    {
      title: 'Placement Preparation Platform',
      description: 'A full-stack web application for interview mock practice and tracking.',
      technologies: ['React', 'Node.js', 'MongoDB'],
      repoUrl: '',
      liveUrl: '',
    },
  ])
  const [certifications, setCertifications] = useState<Certification[]>([])

  // Step 4: Career Preferences
  const [targetRoles, setTargetRoles] = useState<string[]>([
    'Software Development Engineer (SDE)',
    'Full Stack Developer',
  ])
  const [workMode, setWorkMode] = useState<'remote' | 'hybrid' | 'on-site' | 'any'>('any')
  const [workType, setWorkType] = useState<'full-time' | 'internship' | 'both'>('both')
  const [preferredLocations, setPreferredLocations] = useState<string[]>([
    'Bangalore',
    'Remote (Worldwide)',
  ])
  const [expectedSalary, setExpectedSalary] = useState('8 - 14 LPA')

  // Ensure already-onboarded students never get stuck in onboarding
  useEffect(() => {
    let isMounted = true

    async function checkExistingStatus() {
      try {
        const status = await fetchOnboardingStatus()
        if (isMounted && status.isCompleted) {
          navigate('/dashboard', { replace: true })
          return
        }

        // If not completed but existing draft exists, prefill
        const profRes = await fetchProfile()
        if (isMounted && profRes.profile) {
          const p = profRes.profile
          if (p.fullName) setFullName(p.fullName)
          if (p.phoneNumber) setPhoneNumber(p.phoneNumber)
          if (p.education) {
            setEducation({
              college: p.education.college || '',
              degree: p.education.degree || 'B.Tech / B.E.',
              branch: p.education.branch || 'Computer Science & Engineering',
              graduationYear: p.education.graduationYear || 2026,
              currentSemester: p.education.currentSemester || 6,
              cgpa: p.education.cgpa || 8.0,
            })
          }
          if (p.skills && p.skills.length > 0) setSkills(p.skills)
          if (p.projects && p.projects.length > 0) setProjects(p.projects)
          if (p.certifications && p.certifications.length > 0) setCertifications(p.certifications)
          if (p.careerPreferences) {
            if (p.careerPreferences.targetRoles) setTargetRoles(p.careerPreferences.targetRoles)
            if (p.careerPreferences.workMode) setWorkMode(p.careerPreferences.workMode)
            if (p.careerPreferences.workType) setWorkType(p.careerPreferences.workType)
            if (p.careerPreferences.preferredLocations) setPreferredLocations(p.careerPreferences.preferredLocations)
            if (p.careerPreferences.expectedSalary) setExpectedSalary(p.careerPreferences.expectedSalary)
          }
        }
      } catch (err) {
        console.warn('Onboarding check warning:', err)
      } finally {
        if (isMounted) {
          setCheckingOnboarded(false)
        }
      }
    }

    checkExistingStatus()

    return () => {
      isMounted = false
    }
  }, [navigate])

  // Helper methods for Skills
  const toggleQuickSkill = (skillName: string) => {
    const exists = skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())
    if (exists) {
      setSkills(skills.filter((s) => s.name.toLowerCase() !== skillName.toLowerCase()))
    } else {
      setSkills([...skills, { name: skillName, level: 'Intermediate' }])
    }
  }

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim()
    if (!trimmed) return
    if (!skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, { name: trimmed, level: 'Intermediate' }])
    }
    setCustomSkillInput('')
  }

  const updateSkillLevel = (index: number, level: SkillLevel) => {
    const updated = [...skills]
    updated[index].level = level
    setSkills(updated)
  }

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  // Helper methods for Projects
  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        title: '',
        description: '',
        technologies: [],
        repoUrl: '',
        liveUrl: '',
      },
    ])
  }

  const handleUpdateProject = (index: number, field: keyof Project, value: any) => {
    const updated = [...projects]
    updated[index] = { ...updated[index], [field]: value }
    setProjects(updated)
  }

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index))
  }

  // Helper methods for Certifications
  const handleAddCertification = () => {
    setCertifications([
      ...certifications,
      { name: '', issuer: '', issueDate: '', credentialUrl: '' },
    ])
  }

  const handleUpdateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications]
    updated[index] = { ...updated[index], [field]: value }
    setCertifications(updated)
  }

  const handleRemoveCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index))
  }

  // Helper methods for Roles & Locations
  const toggleRole = (role: string) => {
    if (targetRoles.includes(role)) {
      setTargetRoles(targetRoles.filter((r) => r !== role))
    } else {
      setTargetRoles([...targetRoles, role])
    }
  }

  const toggleLocation = (loc: string) => {
    if (preferredLocations.includes(loc)) {
      setPreferredLocations(preferredLocations.filter((l) => l !== loc))
    } else {
      setPreferredLocations([...preferredLocations, loc])
    }
  }

  // Validation
  const validateStep = (step: number): boolean => {
    setErrorMessage(null)

    if (step === 1) {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.')
        return false
      }
      if (!education.college.trim()) {
        setErrorMessage('Please specify your college or university name.')
        return false
      }
      if (!education.branch.trim()) {
        setErrorMessage('Please specify your academic branch or specialization.')
        return false
      }
      return true
    }

    if (step === 2) {
      if (skills.length === 0) {
        setErrorMessage('Please select or add at least one technical skill to continue.')
        return false
      }
      return true
    }

    if (step === 3) {
      // Step 3 projects are optional, but if entered title must not be empty
      for (let i = 0; i < projects.length; i++) {
        if (!projects[i].title.trim() && projects.length > 1) {
          setErrorMessage(`Please provide a title for Project #${i + 1} or remove it.`)
          return false
        }
      }
      return true
    }

    if (step === 4) {
      if (targetRoles.length === 0) {
        setErrorMessage('Please select at least one target role.')
        return false
      }
      return true
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setErrorMessage(null)
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFinish = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateStep(4)) return

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // Filter out incomplete projects
      const sanitizedProjects = projects.filter((p) => p.title.trim().length > 0)
      const sanitizedCerts = certifications.filter((c) => c.name.trim().length > 0)

      // Collect all technologies from skills and projects
      const techSet = new Set<string>()
      skills.forEach((s) => techSet.add(s.name))
      sanitizedProjects.forEach((p) => {
        p.technologies.forEach((t) => techSet.add(t))
      })

      const payload = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        education,
        skills,
        technologies: Array.from(techSet),
        projects: sanitizedProjects,
        certifications: sanitizedCerts,
        careerPreferences: {
          targetRoles,
          careerInterests: targetRoles,
          preferredLocations,
          workType,
          workMode,
          expectedSalary,
        },
      }

      await submitOnboarding(payload)
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Failed to submit onboarding:', err)
      setErrorMessage(
        err.message || 'Failed to save student profile. Please verify your connection.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (checkingOnboarded) {
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
          Checking your profile status...
        </p>
      </div>
    )
  }

  return (
    <div className="onboarding-page">
      {/* Top Header */}
      <header className="onboarding-header">
        <div className="container onboarding-header__inner">
          <div className="onboarding-brand">
            <div className="onboarding-brand__icon">
              <Sparkles size={18} />
            </div>
            <span className="onboarding-brand__name">CareerLaunch</span>
          </div>

          <div className="onboarding-header__user">
            <div className="onboarding-user-badge">
              <div className="onboarding-user-avatar">
                {user?.email?.charAt(0).toUpperCase() || 'S'}
              </div>
              <span>{user?.email}</span>
            </div>
            <button
              type="button"
              onClick={() => signOut().then(() => navigate('/login'))}
              className="onboarding-signout-btn"
              title="Sign Out"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="onboarding-main">
        <div className="onboarding-container">
          {/* Progress Indicators */}
          <div className="onboarding-steps">
            <div className="onboarding-steps__line">
              <div
                className="onboarding-steps__line-fill"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>

            {[
              { num: 1, label: 'Academic', icon: GraduationCap },
              { num: 2, label: 'Skills', icon: Code2 },
              { num: 3, label: 'Projects', icon: FolderGit2 },
              { num: 4, label: 'Career Goals', icon: Briefcase },
            ].map((step) => {
              const isActive = currentStep === step.num
              const isCompleted = currentStep > step.num

              return (
                <button
                  key={step.num}
                  type="button"
                  className={`onboarding-step-item ${isActive ? 'is-active' : ''} ${
                    isCompleted ? 'is-completed' : ''
                  }`}
                  onClick={() => {
                    if (isCompleted) setCurrentStep(step.num)
                  }}
                  disabled={!isCompleted && !isActive}
                >
                  <div className="onboarding-step-circle">
                    {isCompleted ? <Check size={16} /> : step.num}
                  </div>
                  <span className="onboarding-step-label">{step.label}</span>
                </button>
              )
            })}
          </div>

          {/* Form Card */}
          <div className="onboarding-card">
            {errorMessage && (
              <div className="onboarding-alert onboarding-alert--error">
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: Academic & Contact */}
            {currentStep === 1 && (
              <div>
                <div className="onboarding-card__header">
                  <span className="onboarding-card__step-tag">Step 1 of 4</span>
                  <h1 className="onboarding-card__title">Academic Foundation</h1>
                  <p className="onboarding-card__subtitle">
                    Tell us about your educational background so we can calibrate your placement
                    timeline and target benchmarks.
                  </p>
                </div>

                <div className="onboarding-form">
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label htmlFor="fullName">Full Name</label>
                      <input
                        id="fullName"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Alex Morgan"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="phoneNumber">
                        Phone Number <span className="optional">(Optional)</span>
                      </label>
                      <input
                        id="phoneNumber"
                        type="tel"
                        className="form-input"
                        placeholder="e.g. +91 98765 43210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="college">College / University Name</label>
                    <input
                      id="college"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Indian Institute of Technology, Bombay"
                      value={education.college}
                      onChange={(e) =>
                        setEducation({ ...education, college: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label htmlFor="degree">Degree</label>
                      <select
                        id="degree"
                        className="form-select"
                        value={education.degree}
                        onChange={(e) =>
                          setEducation({ ...education, degree: e.target.value })
                        }
                      >
                        <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                        <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                        <option value="MCA">MCA (Master of Computer Applications)</option>
                        <option value="B.Sc Computer Science">B.Sc Computer Science / IT</option>
                        <option value="M.Tech / M.E.">M.Tech / M.E.</option>
                        <option value="Other">Other Degree</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="branch">Branch / Specialization</label>
                      <input
                        id="branch"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Computer Science & Engineering"
                        value={education.branch}
                        onChange={(e) =>
                          setEducation({ ...education, branch: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label htmlFor="gradYear">Expected Graduation Year</label>
                      <select
                        id="gradYear"
                        className="form-select"
                        value={education.graduationYear}
                        onChange={(e) =>
                          setEducation({
                            ...education,
                            graduationYear: Number(e.target.value),
                          })
                        }
                      >
                        <option value="2025">2025</option>
                        <option value="2026">2026 (Upcoming batch)</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                        <option value="2029">2029</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="cgpa">Current CGPA / Percentage</label>
                      <input
                        id="cgpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        className="form-input"
                        placeholder="e.g. 8.4"
                        value={education.cgpa || ''}
                        onChange={(e) =>
                          setEducation({
                            ...education,
                            cgpa: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Technical Skills */}
            {currentStep === 2 && (
              <div>
                <div className="onboarding-card__header">
                  <span className="onboarding-card__step-tag">Step 2 of 4</span>
                  <h1 className="onboarding-card__title">Skills & Technical Proficiencies</h1>
                  <p className="onboarding-card__subtitle">
                    Select your competencies and mark your current confidence level. We will use
                    these to curate relevant interview questions.
                  </p>
                </div>

                <div className="onboarding-form">
                  {/* Curated quick selector */}
                  <div className="skills-quick-group">
                    <div className="skills-quick-title">Frequently Selected by Placement Aspirants</div>
                    <div className="skills-chips-wrap">
                      {CURATED_SKILLS.map((item) => {
                        const isSelected = skills.some(
                          (s) => s.name.toLowerCase() === item.toLowerCase(),
                        )
                        return (
                          <button
                            key={item}
                            type="button"
                            className={`skill-quick-chip ${isSelected ? 'is-selected' : ''}`}
                            onClick={() => toggleQuickSkill(item)}
                          >
                            <span>{item}</span>
                            {isSelected ? <Check size={14} /> : <Plus size={14} />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Custom skill write-in */}
                  <div className="form-field">
                    <label>Add Additional Skill</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Rust, Redis, Tailwind, PyTorch..."
                        value={customSkillInput}
                        onChange={(e) => setCustomSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddCustomSkill()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSkill}
                        className="btn btn-forest"
                        style={{ padding: '0.65rem 1.25rem' }}
                      >
                        <Plus size={16} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Selected skills list with proficiency level toggle */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Selected Skills ({skills.length})
                    </label>
                    {skills.length === 0 ? (
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--color-charcoal-muted)',
                          marginTop: 8,
                        }}
                      >
                        No skills selected yet. Tap above or type a skill to add.
                      </p>
                    ) : (
                      <div className="selected-skills-list">
                        {skills.map((skill, index) => (
                          <div key={skill.name} className="selected-skill-row">
                            <span className="selected-skill-name">{skill.name}</span>
                            <div className="selected-skill-controls">
                              {(['Beginner', 'Intermediate', 'Advanced'] as SkillLevel[]).map(
                                (lvl) => (
                                  <button
                                    key={lvl}
                                    type="button"
                                    className={`level-pill ${
                                      skill.level === lvl ? 'active' : ''
                                    }`}
                                    onClick={() => updateSkillLevel(index, lvl)}
                                  >
                                    {lvl}
                                  </button>
                                ),
                              )}
                              <button
                                type="button"
                                className="skill-remove-btn"
                                onClick={() => removeSkill(index)}
                                title="Remove skill"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Projects & Certifications */}
            {currentStep === 3 && (
              <div>
                <div className="onboarding-card__header">
                  <span className="onboarding-card__step-tag">Step 3 of 4</span>
                  <h1 className="onboarding-card__title">Projects & Credentials</h1>
                  <p className="onboarding-card__subtitle">
                    Highlight your best practical engineering projects and earned certifications
                    to build interview discussion points.
                  </p>
                </div>

                <div className="onboarding-form">
                  {/* Projects List */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '14px',
                      }}
                    >
                      <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                        Showcase Projects ({projects.length})
                      </label>
                      <button
                        type="button"
                        onClick={handleAddProject}
                        className="add-repeater-btn"
                      >
                        <Plus size={14} />
                        <span>Add Project</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {projects.map((project, index) => (
                        <div key={index} className="repeater-card">
                          <div className="repeater-card__header">
                            <span>Project #{index + 1}</span>
                            {projects.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveProject(index)}
                                className="repeater-remove-btn"
                              >
                                <Trash2 size={14} />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>

                          <div className="form-field">
                            <label>Project Title</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g. Distributed Task Scheduler"
                              value={project.title}
                              onChange={(e) =>
                                handleUpdateProject(index, 'title', e.target.value)
                              }
                            />
                          </div>

                          <div className="form-field">
                            <label>Short Description & Impact</label>
                            <textarea
                              className="form-textarea"
                              placeholder="Briefly describe what it does, key challenges solved, and performance gains..."
                              value={project.description}
                              onChange={(e) =>
                                handleUpdateProject(index, 'description', e.target.value)
                              }
                            />
                          </div>

                          <div className="form-field">
                            <label>Technologies Used (comma separated)</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g. React, Node.js, Redis, Docker"
                              value={project.technologies.join(', ')}
                              onChange={(e) =>
                                handleUpdateProject(
                                  index,
                                  'technologies',
                                  e.target.value.split(',').map((t) => t.trim()),
                                )
                              }
                            />
                          </div>

                          <div className="form-grid-2">
                            <div className="form-field">
                              <label>
                                GitHub Repo URL <span className="optional">(Optional)</span>
                              </label>
                              <input
                                type="url"
                                className="form-input"
                                placeholder="https://github.com/username/project"
                                value={project.repoUrl || ''}
                                onChange={(e) =>
                                  handleUpdateProject(index, 'repoUrl', e.target.value)
                                }
                              />
                            </div>
                            <div className="form-field">
                              <label>
                                Live Demo URL <span className="optional">(Optional)</span>
                              </label>
                              <input
                                type="url"
                                className="form-input"
                                placeholder="https://myproject.dev"
                                value={project.liveUrl || ''}
                                onChange={(e) =>
                                  handleUpdateProject(index, 'liveUrl', e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications List */}
                  <div style={{ marginTop: '20px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '14px',
                      }}
                    >
                      <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                        Certifications & Licenses ({certifications.length})
                      </label>
                      <button
                        type="button"
                        onClick={handleAddCertification}
                        className="add-repeater-btn"
                      >
                        <Plus size={14} />
                        <span>Add Certification</span>
                      </button>
                    </div>

                    {certifications.length === 0 ? (
                      <div
                        style={{
                          padding: '16px',
                          border: '1px dashed var(--color-sand-dark)',
                          borderRadius: '8px',
                          textAlign: 'center',
                          color: 'var(--color-charcoal-muted)',
                          fontSize: '0.85rem',
                        }}
                      >
                        No certifications added yet. Click "+ Add Certification" if you have any
                        industry credentials (AWS, Meta, Coursera, etc.).
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {certifications.map((cert, index) => (
                          <div key={index} className="repeater-card">
                            <div className="repeater-card__header">
                              <span>Certification #{index + 1}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCertification(index)}
                                className="repeater-remove-btn"
                              >
                                <Trash2 size={14} />
                                <span>Remove</span>
                              </button>
                            </div>

                            <div className="form-grid-2">
                              <div className="form-field">
                                <label>Certification Name</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  placeholder="e.g. AWS Certified Solutions Architect"
                                  value={cert.name}
                                  onChange={(e) =>
                                    handleUpdateCertification(index, 'name', e.target.value)
                                  }
                                />
                              </div>
                              <div className="form-field">
                                <label>Issuing Organization</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  placeholder="e.g. Amazon Web Services"
                                  value={cert.issuer}
                                  onChange={(e) =>
                                    handleUpdateCertification(index, 'issuer', e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Target Roles & Career Preferences */}
            {currentStep === 4 && (
              <div>
                <div className="onboarding-card__header">
                  <span className="onboarding-card__step-tag">Step 4 of 4</span>
                  <h1 className="onboarding-card__title">Placement Goals & Preferences</h1>
                  <p className="onboarding-card__subtitle">
                    Select the roles you are aiming for so CareerLaunch can tailor company
                    question banks and mock interview difficulty.
                  </p>
                </div>

                <div className="onboarding-form">
                  {/* Target Roles */}
                  <div className="form-field">
                    <label>Target Roles (Select all that apply)</label>
                    <div className="skills-chips-wrap">
                      {TARGET_ROLE_OPTIONS.map((role) => {
                        const isSelected = targetRoles.includes(role)
                        return (
                          <button
                            key={role}
                            type="button"
                            className={`role-chip ${isSelected ? 'is-active' : ''}`}
                            onClick={() => toggleRole(role)}
                          >
                            <span>{role}</span>
                            {isSelected && <Check size={14} />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Work Mode & Type */}
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label htmlFor="workMode">Work Environment</label>
                      <select
                        id="workMode"
                        className="form-select"
                        value={workMode}
                        onChange={(e) => setWorkMode(e.target.value as any)}
                      >
                        <option value="any">Open to Any (Remote / Hybrid / On-site)</option>
                        <option value="remote">Remote Only</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="on-site">On-Site</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="workType">Employment Type</label>
                      <select
                        id="workType"
                        className="form-select"
                        value={workType}
                        onChange={(e) => setWorkType(e.target.value as any)}
                      >
                        <option value="both">Open to Both (Full-time & Internship)</option>
                        <option value="full-time">Full-time Only</option>
                        <option value="internship">Internship Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Preferred Locations */}
                  <div className="form-field">
                    <label>Preferred Placement Locations</label>
                    <div className="skills-chips-wrap">
                      {LOCATION_OPTIONS.map((loc) => {
                        const isSelected = preferredLocations.includes(loc)
                        return (
                          <button
                            key={loc}
                            type="button"
                            className={`role-chip ${isSelected ? 'is-active' : ''}`}
                            onClick={() => toggleLocation(loc)}
                          >
                            <span>{loc}</span>
                            {isSelected && <Check size={14} />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Expected Salary */}
                  <div className="form-field">
                    <label htmlFor="expectedSalary">Target CTC / Salary Expectation</label>
                    <input
                      id="expectedSalary"
                      type="text"
                      className="form-input"
                      placeholder="e.g. 10 - 18 LPA"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Actions */}
            <div className="onboarding-actions">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="onboarding-back-btn"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="onboarding-next-btn"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="onboarding-next-btn"
                >
                  <span>
                    {isSubmitting ? 'Finalizing Profile...' : 'Complete Onboarding'}
                  </span>
                  <CheckCircle2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
