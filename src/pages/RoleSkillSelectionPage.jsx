import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Edit3,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  fetchRoleSkills,
  fetchStudentSkillSelection,
  saveStudentSkillSelection,
} from '@/lib/api'
import { FRONTEND_DEVELOPER_ROLE } from '@/data/roleSkillTaxonomy'
import '@/styles/skill-selection.css'

export function RoleSkillSelectionPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const roleId = 'frontend-developer'

  // Data state
  const [roleData, setRoleData] = useState(FRONTEND_DEVELOPER_ROLE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // Selection state
  const [selectedSkillIds, setSelectedSkillIds] = useState(new Set())
  const [customSkills, setCustomSkills] = useState([])
  const [customSkillInput, setCustomSkillInput] = useState('')

  // UI state
  const [searchQuery, setSearchQuery] = useState('')

  // Initial load
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        setLoading(true)
        setErrorMessage(null)

        // 1. Fetch official role skills
        try {
          const fetchedData = await fetchRoleSkills(roleId)
          if (isMounted && fetchedData?.skills) {
            setRoleData(fetchedData)
          }
        } catch (err) {
          console.warn('Falling back to local skills list:', err)
        }

        // 2. Fetch student's existing saved selection
        try {
          const selectionData = await fetchStudentSkillSelection(roleId)
          if (isMounted && selectionData?.exists) {
            const savedIds = new Set(
              selectionData.selectedSkills.map((s) => s.skillId || s.id || s.name.toLowerCase()),
            )
            setSelectedSkillIds(savedIds)
            setCustomSkills(selectionData.customSkills.map((c) => c.name))
          }
        } catch (err) {
          console.warn('Could not retrieve existing selection:', err)
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load skill selection data.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [roleId])

  // Lookup map for quick name resolution
  const skillLookup = useMemo(() => {
    const map = new Map()
    if (!roleData?.skills) return map
    for (const skill of roleData.skills) {
      map.set(skill.id, skill.name)
    }
    return map
  }, [roleData])

  // Filter skills by search query
  const filteredSkills = useMemo(() => {
    if (!roleData?.skills) return []
    const q = searchQuery.trim().toLowerCase()
    if (!q) return roleData.skills

    return roleData.skills.filter((skill) =>
      skill.name.toLowerCase().includes(q),
    )
  }, [roleData, searchQuery])

  // Toggle skill selection
  const handleToggleSkill = (skillId) => {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev)
      if (next.has(skillId)) {
        next.delete(skillId)
      } else {
        next.add(skillId)
      }
      return next
    })
  }

  // Select all visible skills
  const handleSelectAllVisible = () => {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev)
      filteredSkills.forEach((s) => next.add(s.id))
      return next
    })
  }

  // Clear all selections
  const handleClearAll = () => {
    setSelectedSkillIds(new Set())
    setCustomSkills([])
  }

  // Add custom skill
  const handleAddCustomSkill = (e) => {
    e?.preventDefault()
    const trimmed = customSkillInput.trim()
    if (!trimmed) return

    if (trimmed.length > 100) {
      alert('Skill name must be under 100 characters.')
      return
    }

    const lower = trimmed.toLowerCase()
    const alreadyExists =
      customSkills.some((c) => c.toLowerCase() === lower) ||
      roleData.skills.some((s) => s.name.toLowerCase() === lower)

    if (alreadyExists) {
      setCustomSkillInput('')
      return
    }

    setCustomSkills((prev) => [...prev, trimmed])
    setCustomSkillInput('')
  }

  // Remove custom skill
  const handleRemoveCustomSkill = (skillName) => {
    setCustomSkills((prev) => prev.filter((s) => s !== skillName))
  }

  // Save selection
  const handleSaveSelection = async () => {
    const totalCount = selectedSkillIds.size + customSkills.length
    if (totalCount === 0) return

    try {
      setSaving(true)
      setErrorMessage(null)

      const payload = {
        selectedSkillIds: Array.from(selectedSkillIds),
        customSkills: customSkills.map((name) => ({ name })),
      }

      await saveStudentSkillSelection(roleId, payload)
      setSaveSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Failed to save selection:', err)
      setErrorMessage(err.message || 'Failed to save skill selection. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const totalSelected = selectedSkillIds.size + customSkills.length
  const userInitials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'ST'

  // Saved Confirmation View
  if (saveSuccess) {
    return (
      <div className="skill-sel-page">
        <header className="skill-sel-topbar">
          <div className="skill-sel-topbar__brand">
            <Compass size={22} color="var(--color-terracotta)" />
            <span>CareerLaunch</span>
            <span className="skill-sel-topbar__role-pill">
              <Sparkles size={12} />
              <span>{roleData.roleTitle}</span>
            </span>
          </div>

          <div className="skill-sel-topbar__user">
            <Link to="/interview-preparation" className="skill-sel-topbar__back-link">
              <ArrowLeft size={14} />
              <span>Target Roles</span>
            </Link>
            <div className="skill-sel-topbar__avatar">{userInitials}</div>
          </div>
        </header>

        <main className="skill-sel-main">
          <div className="skill-sel-saved-card">
            <div className="skill-sel-saved-card__banner">
              <div className="skill-sel-saved-card__icon">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="skill-sel-saved-card__banner-title">
                  Skills Selected Successfully!
                </h2>
                <p className="skill-sel-saved-card__banner-desc">
                  You selected {totalSelected} skill{totalSelected > 1 ? 's' : ''} for{' '}
                  <strong>{roleData.roleTitle}</strong>.
                </p>
              </div>
            </div>

            <div className="skill-sel-saved-group">
              <div className="skill-sel-saved-group__chips">
                {Array.from(selectedSkillIds).map((id) => {
                  const name = skillLookup.get(id) || id
                  return (
                    <span key={id} className="skill-sel-saved-chip">
                      <CheckCircle2 size={14} color="var(--color-sage)" />
                      <span>{name}</span>
                    </span>
                  )
                })}

                {customSkills.map((c) => (
                  <span key={c} className="skill-sel-saved-chip">
                    <Sparkles size={14} color="var(--color-terracotta)" />
                    <span>{c}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="skill-sel-next-box">
              <h4 className="skill-sel-next-box__title">
                Next Stage: One Dedicated AI Chatbot (Phase 3)
              </h4>
              <p className="skill-sel-next-box__desc">
                Your AI tutor will conduct one continuous conversation tailored around these{' '}
                {totalSelected} selected skills. You can ask questions, inspect code examples,
                review prerequisites, and switch between skills seamlessly.
              </p>
            </div>

            <div className="skill-sel-saved-actions">
              <button
                type="button"
                className="skill-sel-btn-primary"
                onClick={() => setSaveSuccess(false)}
              >
                <Edit3 size={16} />
                <span>Update Skill Selection</span>
              </button>

              <button
                type="button"
                className="skill-sel-btn-secondary"
                onClick={() => navigate('/interview-preparation')}
              >
                <ArrowLeft size={16} />
                <span>Return to Role Selection</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="skill-sel-page">
      {/* Top Bar */}
      <header className="skill-sel-topbar">
        <div className="skill-sel-topbar__brand">
          <Compass size={22} color="var(--color-terracotta)" />
          <span>CareerLaunch</span>
          <span className="skill-sel-topbar__role-pill">
            <Sparkles size={12} />
            <span>{roleData.roleTitle}</span>
          </span>
        </div>

        <div className="skill-sel-topbar__user">
          <Link to="/interview-preparation" className="skill-sel-topbar__back-link">
            <ArrowLeft size={14} />
            <span>Change Role</span>
          </Link>
          <div className="skill-sel-topbar__avatar">{userInitials}</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="skill-sel-main">
        {/* Hero Section */}
        <div className="skill-sel-hero">
          <div className="skill-sel-hero__badge">
            <Sparkles size={12} />
            <span>Pilot Preparation Track</span>
          </div>
          <h1 className="skill-sel-hero__title">What skills do you want to learn?</h1>
          <p className="skill-sel-hero__desc">
            Select the technologies you want to prepare for {roleData.roleTitle}. You can select one
            or multiple skills.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: '#FDF2F0',
              border: '1px solid #F5C6CB',
              borderRadius: '8px',
              color: '#721C24',
            }}
          >
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Toolbar: Search & Actions */}
        <div className="skill-sel-toolbar">
          <div className="skill-sel-search">
            <Search size={16} className="skill-sel-search__icon" />
            <input
              type="text"
              className="skill-sel-search__input"
              placeholder="Filter skills (e.g. React, CSS, JavaScript)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="skill-sel-search__clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="skill-sel-actions">
            <button
              type="button"
              className="skill-sel-actions__btn"
              onClick={handleSelectAllVisible}
            >
              Select All
            </button>

            {totalSelected > 0 && (
              <button
                type="button"
                className="skill-sel-actions__btn"
                onClick={handleClearAll}
              >
                <RotateCcw size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="skill-sel-loading">
            <div className="skill-sel-spinner" />
            <p>Loading skills...</p>
          </div>
        ) : (
          <>
            {/* Direct Skill Grid (Skill Name + Select Box Only) */}
            <div className="skill-grid">
              {filteredSkills.map((skill) => {
                const isChecked = selectedSkillIds.has(skill.id)

                return (
                  <div
                    key={skill.id}
                    className={`skill-card ${isChecked ? 'skill-card--selected' : ''}`}
                    onClick={() => handleToggleSkill(skill.id)}
                  >
                    <input
                      type="checkbox"
                      className="skill-card__checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by parent onClick
                      aria-label={skill.name}
                    />
                    <span className="skill-card__name">{skill.name}</span>
                  </div>
                )
              })}
            </div>

            {/* Custom Skills Section ("Other") */}
            <section className="skill-custom-section">
              <h2 className="skill-custom-section__title">
                Other — Add Your Own Technical Skills
              </h2>
              <p className="skill-custom-section__desc">
                Want to prepare specific libraries or tools (e.g. Tailwind CSS, Three.js, Docker,
                GraphQL)? Add them here.
              </p>

              <form onSubmit={handleAddCustomSkill} className="skill-custom-input-row">
                <input
                  type="text"
                  className="skill-custom-input"
                  placeholder="Enter skill or technology name..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="skill-custom-add-btn"
                  disabled={!customSkillInput.trim()}
                >
                  <Plus size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Add Skill
                </button>
              </form>

              {customSkills.length > 0 && (
                <div className="skill-custom-chips">
                  {customSkills.map((c) => (
                    <span key={c} className="skill-custom-chip">
                      <span>{c}</span>
                      <button
                        type="button"
                        className="skill-custom-chip__remove"
                        onClick={() => handleRemoveCustomSkill(c)}
                        aria-label={`Remove ${c}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Sticky Bottom Summary Tray */}
      {totalSelected > 0 && (
        <aside className="skill-sel-tray" aria-label="Selected skills summary">
          <div className="skill-sel-tray__inner">
            <div className="skill-sel-tray__summary">
              <span className="skill-sel-tray__count-badge">
                {totalSelected} Skill{totalSelected > 1 ? 's' : ''} Selected
              </span>

              <div className="skill-sel-tray__chips-scroll">
                {Array.from(selectedSkillIds).map((id) => {
                  const name = skillLookup.get(id) || id
                  return (
                    <span key={id} className="skill-sel-tray__chip">
                      <span>{name}</span>
                      <button
                        type="button"
                        className="skill-sel-tray__chip-remove"
                        onClick={() => handleToggleSkill(id)}
                        aria-label={`Remove ${name}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )
                })}

                {customSkills.map((c) => (
                  <span key={c} className="skill-sel-tray__chip">
                    <span>{c}</span>
                    <button
                      type="button"
                      className="skill-sel-tray__chip-remove"
                      onClick={() => handleRemoveCustomSkill(c)}
                      aria-label={`Remove ${c}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="skill-sel-tray__actions">
              <button
                type="button"
                className="skill-sel-tray__clear-btn"
                onClick={handleClearAll}
              >
                Clear all
              </button>

              <button
                type="button"
                className="skill-sel-tray__save-btn"
                onClick={handleSaveSelection}
                disabled={saving}
              >
                {saving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <span>Start Learning Assistant</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
