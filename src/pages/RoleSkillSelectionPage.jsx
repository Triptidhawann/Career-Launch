import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Compass,
  Edit3,
  Layers,
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
import { FRONTEND_DEVELOPER_SKILL_TAXONOMY } from '@/data/roleSkillTaxonomy'
import '@/styles/skill-selection.css'

export function RoleSkillSelectionPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const roleId = 'frontend-developer'

  // Data state
  const [taxonomy, setTaxonomy] = useState(FRONTEND_DEVELOPER_SKILL_TAXONOMY)
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
  const [expandedCategories, setExpandedCategories] = useState(new Set())

  // Initial load: fetch taxonomy and existing student selection
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        setLoading(true)
        setErrorMessage(null)

        // 1. Fetch official role skills taxonomy
        try {
          const taxData = await fetchRoleSkills(roleId)
          if (isMounted && taxData?.categories) {
            setTaxonomy(taxData)
            // By default expand first 3 categories
            const initialExpanded = new Set(
              taxData.categories.slice(0, 3).map((c) => c.categoryId),
            )
            setExpandedCategories(initialExpanded)
          }
        } catch (err) {
          console.warn('Falling back to local skill taxonomy:', err)
          if (isMounted) {
            const initialExpanded = new Set(
              FRONTEND_DEVELOPER_SKILL_TAXONOMY.categories.slice(0, 3).map((c) => c.categoryId),
            )
            setExpandedCategories(initialExpanded)
          }
        }

        // 2. Fetch student's existing saved selection if authenticated
        try {
          const selectionData = await fetchStudentSkillSelection(roleId)
          if (isMounted && selectionData?.exists) {
            const savedIds = new Set(selectionData.selectedSkills.map((s) => s.skillId))
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

  // Flat lookup of all official skills in current taxonomy
  const allSkillsFlat = useMemo(() => {
    const list = []
    if (!taxonomy?.categories) return list
    for (const cat of taxonomy.categories) {
      for (const skill of cat.skills) {
        list.push({
          ...skill,
          categoryId: cat.categoryId,
          categoryName: cat.categoryName,
        })
      }
    }
    return list
  }, [taxonomy])

  const skillLookupMap = useMemo(() => {
    const map = new Map()
    for (const skill of allSkillsFlat) {
      map.set(skill.skillId, skill)
    }
    return map
  }, [allSkillsFlat])

  // Filtered categories based on search query
  const filteredCategories = useMemo(() => {
    if (!taxonomy?.categories) return []
    const q = searchQuery.trim().toLowerCase()
    if (!q) return taxonomy.categories

    return taxonomy.categories
      .map((cat) => {
        const matchesCategory =
          cat.categoryName.toLowerCase().includes(q) ||
          cat.description.toLowerCase().includes(q)

        const matchingSkills = cat.skills.filter((skill) => {
          return (
            skill.name.toLowerCase().includes(q) ||
            skill.description.toLowerCase().includes(q) ||
            (skill.officialTopicId && skill.officialTopicId.toLowerCase().includes(q)) ||
            skill.interviewWeight.toLowerCase().includes(q)
          )
        })

        if (matchesCategory || matchingSkills.length > 0) {
          return {
            ...cat,
            skills: matchesCategory ? cat.skills : matchingSkills,
          }
        }
        return null
      })
      .filter(Boolean)
  }, [taxonomy, searchQuery])

  // Toggle individual category accordion
  const toggleCategory = (catId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(catId)) {
        next.delete(catId)
      } else {
        next.add(catId)
      }
      return next
    })
  }

  // Expand / Collapse all categories
  const handleToggleAllCategories = () => {
    if (expandedCategories.size === taxonomy.categories.length) {
      setExpandedCategories(new Set())
    } else {
      setExpandedCategories(new Set(taxonomy.categories.map((c) => c.categoryId)))
    }
  }

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

  // Category quick select/deselect
  const handleToggleAllInCategory = (cat) => {
    const catSkillIds = cat.skills.map((s) => s.skillId)
    const allSelected = catSkillIds.every((id) => selectedSkillIds.has(id))

    setSelectedSkillIds((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        catSkillIds.forEach((id) => next.delete(id))
      } else {
        catSkillIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  // Select all visible skills
  const handleSelectAllVisible = () => {
    const visibleIds = []
    filteredCategories.forEach((cat) => {
      cat.skills.forEach((s) => visibleIds.push(s.skillId))
    })

    setSelectedSkillIds((prev) => {
      const next = new Set(prev)
      visibleIds.forEach((id) => next.add(id))
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
      allSkillsFlat.some((s) => s.name.toLowerCase() === lower)

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

  // If in saved confirmation state
  if (saveSuccess) {
    // Group selected skills by category for structured summary
    const selectedGrouped = new Map()

    selectedSkillIds.forEach((id) => {
      const skill = skillLookupMap.get(id)
      if (skill) {
        if (!selectedGrouped.has(skill.categoryName)) {
          selectedGrouped.set(skill.categoryName, [])
        }
        selectedGrouped.get(skill.categoryName).push(skill)
      }
    })

    return (
      <div className="skill-sel-page">
        <header className="skill-sel-topbar">
          <div className="skill-sel-topbar__brand">
            <Compass size={22} color="var(--color-terracotta)" />
            <span>CareerLaunch</span>
            <span className="skill-sel-topbar__role-pill">
              <Sparkles size={12} />
              <span>{taxonomy.roleTitle}</span>
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
                  Preparation Skills Saved Successfully!
                </h2>
                <p className="skill-sel-saved-card__banner-desc">
                  Your personalized skill focus for <strong>{taxonomy.roleTitle}</strong> has
                  been saved. You selected {totalSelected} skill{totalSelected > 1 ? 's' : ''}.
                </p>
              </div>
            </div>

            <div className="skill-sel-saved-groups">
              {Array.from(selectedGrouped.entries()).map(([catName, skills]) => (
                <div key={catName} className="skill-sel-saved-group">
                  <h3 className="skill-sel-saved-group__title">{catName}</h3>
                  <div className="skill-sel-saved-group__chips">
                    {skills.map((s) => (
                      <span key={s.skillId} className="skill-sel-saved-chip">
                        <CheckCircle2 size={12} color="var(--color-sage)" />
                        <span>{s.name}</span>
                        {s.officialTopicId && (
                          <span className="skill-tag skill-tag--topic">
                            {s.officialTopicId}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {customSkills.length > 0 && (
                <div className="skill-sel-saved-group">
                  <h3 className="skill-sel-saved-group__title">Custom Selected Skills</h3>
                  <div className="skill-sel-saved-group__chips">
                    {customSkills.map((c) => (
                      <span key={c} className="skill-sel-saved-chip">
                        <Sparkles size={12} color="var(--color-terracotta)" />
                        <span>{c}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="skill-sel-next-box">
              <h4 className="skill-sel-next-box__title">
                Next Stage: Dedicated AI Learning Assistant (Phase 3)
              </h4>
              <p className="skill-sel-next-box__desc">
                In the upcoming Phase 3, your AI learning assistant will conduct conversational,
                deep-dive sessions focused specifically on these {totalSelected} technical
                skills. Your selections will guide your dynamic curriculum, interview questions,
                and hands-on exercises.
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
            <span>{taxonomy.roleTitle}</span>
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
          <h1 className="skill-sel-hero__title">What would you like to prepare?</h1>
          <p className="skill-sel-hero__desc">
            Choose the skills you want to learn or improve. You can select one or multiple
            skills across the 12 core domains of modern frontend engineering.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="skill-sel-error-banner" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#FDF2F0', border: '1px solid #F5C6CB', borderRadius: '8px', color: '#721C24' }}>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Toolbar: Search & Global Actions */}
        <div className="skill-sel-toolbar">
          <div className="skill-sel-search">
            <Search size={16} className="skill-sel-search__icon" />
            <input
              type="text"
              className="skill-sel-search__input"
              placeholder="Filter skills by name, topic, or keyword (e.g. React, Box Model, Async)..."
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
              onClick={handleToggleAllCategories}
            >
              <Layers size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              {expandedCategories.size === taxonomy.categories.length
                ? 'Collapse All'
                : 'Expand All'}
            </button>

            <button
              type="button"
              className="skill-sel-actions__btn"
              onClick={handleSelectAllVisible}
            >
              Select Visible
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
            <p>Loading {taxonomy.roleTitle} technical taxonomy...</p>
          </div>
        ) : (
          <>
            {/* Categories Accordion */}
            <div className="skill-sel-categories">
              {filteredCategories.map((cat) => {
                const isExpanded =
                  Boolean(searchQuery.trim()) || expandedCategories.has(cat.categoryId)
                const catSkillIds = cat.skills.map((s) => s.skillId)
                const selectedInCat = catSkillIds.filter((id) => selectedSkillIds.has(id))
                const isAllSelected =
                  catSkillIds.length > 0 && selectedInCat.length === catSkillIds.length

                return (
                  <section
                    key={cat.categoryId}
                    className={`skill-cat-card ${isExpanded ? 'skill-cat-card--expanded' : ''}`}
                  >
                    <header
                      className="skill-cat-header"
                      onClick={() => toggleCategory(cat.categoryId)}
                    >
                      <div className="skill-cat-header__left">
                        <ChevronDown
                          size={18}
                          className="skill-cat-header__toggle-icon"
                        />
                        <div className="skill-cat-header__title-group">
                          <div className="skill-cat-header__title-row">
                            <h2 className="skill-cat-header__name">{cat.categoryName}</h2>
                            <span
                              className={`skill-cat-header__badge ${
                                selectedInCat.length > 0
                                  ? 'skill-cat-header__badge--active'
                                  : ''
                              }`}
                            >
                              {selectedInCat.length} of {cat.skills.length} selected
                            </span>
                          </div>
                          <p className="skill-cat-header__desc">{cat.description}</p>
                        </div>
                      </div>

                      <div
                        className="skill-cat-header__right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="skill-cat-header__quick-toggle"
                          onClick={() => handleToggleAllInCategory(cat)}
                        >
                          {isAllSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                    </header>

                    {isExpanded && (
                      <div className="skill-cat-body">
                        {cat.skills.map((skill) => {
                          const isChecked = selectedSkillIds.has(skill.skillId)

                          return (
                            <div
                              key={skill.skillId}
                              className={`skill-item ${
                                isChecked ? 'skill-item--selected' : ''
                              }`}
                              onClick={() => handleToggleSkill(skill.skillId)}
                            >
                              <input
                                type="checkbox"
                                className="skill-item__checkbox"
                                checked={isChecked}
                                onChange={() => {}} // handled by parent onClick
                                aria-label={skill.name}
                              />

                              <div className="skill-item__content">
                                <div className="skill-item__header-row">
                                  <h3 className="skill-item__name">{skill.name}</h3>

                                  <div className="skill-item__tags">
                                    {skill.interviewWeight === 'critical' && (
                                      <span className="skill-tag skill-tag--critical">
                                        Critical Weight
                                      </span>
                                    )}
                                    {skill.interviewWeight === 'high' && (
                                      <span className="skill-tag skill-tag--high">
                                        High Relevance
                                      </span>
                                    )}
                                    {skill.interviewWeight === 'medium' && (
                                      <span className="skill-tag skill-tag--medium">
                                        Medium Relevance
                                      </span>
                                    )}

                                    {skill.officialTopicId && (
                                      <span
                                        className="skill-tag skill-tag--topic"
                                        title={`Mapped to syllabus topic ${skill.officialTopicId}`}
                                      >
                                        <BookOpen
                                          size={10}
                                          style={{
                                            marginRight: '2px',
                                            display: 'inline-block',
                                          }}
                                        />
                                        {skill.officialTopicId}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <p className="skill-item__desc">{skill.description}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </section>
                )
              })}
            </div>

            {/* Custom Skills Section ("Other") */}
            <section className="skill-custom-section">
              <h2 className="skill-custom-section__title">
                Other — Add Your Own Technical Skills
              </h2>
              <p className="skill-custom-section__desc">
                Have specific tools, libraries, or concepts you want to include (e.g. Three.js,
                GraphQL, Tailwind CSS, WebGL)? Add them here.
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
                  const s = skillLookupMap.get(id)
                  if (!s) return null
                  return (
                    <span key={id} className="skill-sel-tray__chip">
                      <span>{s.name}</span>
                      <button
                        type="button"
                        className="skill-sel-tray__chip-remove"
                        onClick={() => handleToggleSkill(id)}
                        aria-label={`Remove ${s.name}`}
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
                    <span>Save & Continue</span>
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
