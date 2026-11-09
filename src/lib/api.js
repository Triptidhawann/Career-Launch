import { auth } from './firebase'

const API_BASE = '/api'

/**
 * Retrieves authorization headers attaching Firebase Bearer ID token if user is signed in.
 *
 * @returns {Promise<Record<string, string>>}
 */
async function getAuthHeader() {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (auth && auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    } catch (err) {
      console.warn('Failed to retrieve Firebase ID token:', err)
    }
  }

  // Development/preview fallback from localStorage if not signed into Firebase in browser
  if (!headers['Authorization'] && typeof window !== 'undefined' && window.localStorage) {
    try {
      const previewToken = window.localStorage.getItem('careerlaunch_preview_token')
      if (previewToken) {
        headers['Authorization'] = `Bearer ${previewToken}`
      }
    } catch {
      // Ignore in non-browser context
    }
  }

  return headers
}

/**
 * Checks the authenticated student's onboarding completion status.
 *
 * @returns {Promise<{ exists: boolean, isCompleted: boolean, stepCompleted: number, fullName?: string, role?: string }>}
 */
export async function fetchOnboardingStatus() {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/profile/status`, {
    headers,
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error ${res.status}`)
  }

  return res.json()
}

/**
 * Retrieves the full student profile for the currently logged-in user.
 *
 * @returns {Promise<{ profile: object | null, isCompleted: boolean, message?: string }>}
 */
export async function fetchProfile() {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/profile/me`, {
    headers,
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error ${res.status}`)
  }

  return res.json()
}

/**
 * Submits the complete onboarding data payload to create/update student profile.
 *
 * @param {object} data - Onboarding payload
 * @returns {Promise<{ success: boolean, message: string, profile: object }>}
 */
export async function submitOnboarding(data) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/profile/onboarding`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || errorData.details || `HTTP error ${res.status}`)
  }

  return res.json()
}

/**
 * Updates an existing student profile.
 *
 * @param {object} data - Partial profile updates
 * @returns {Promise<{ success: boolean, message: string, profile: object }>}
 */
export async function updateProfile(data) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/profile/me`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || errorData.details || `HTTP error ${res.status}`)
  }

  return res.json()
}


/**
 * Fetches the AI-generated technical lesson for a topic and role.
 *
 * @param {string} topicId - The unique ID of the technical topic (e.g. "swe-top-1")
 * @param {string} [roleId='software-engineer'] - The specialization track ID
 * @returns {Promise<{ success: boolean, available: boolean, lesson: object | null, message?: string }>}
 */
export async function fetchTopicLesson(topicId, roleId = 'software-engineer') {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/lessons/${encodeURIComponent(topicId)}?roleId=${encodeURIComponent(roleId)}`, {
    headers,
  })

  if (res.status === 404) {
    const errorData = await res.json().catch(() => ({}))
    return {
      success: false,
      available: false,
      lesson: null,
      message: errorData.message || 'Learning content for this topic is not available yet.',
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    if (res.status === 502 || res.status === 503) {
      throw new Error(
        errorData.error ||
          errorData.message ||
          `Backend service is temporarily unavailable (HTTP ${res.status}). Please verify that the API server is active on port 5000.`
      )
    }
    throw new Error(errorData.error || errorData.message || `Failed to fetch lesson (HTTP ${res.status})`)
  }

  return res.json()
}

/**
 * Saves or updates student's personalised interview preparation setup.
 *
 * @param {object} payload - Setup payload (roleId, goalPrompt, experienceLevel, etc.)
 * @returns {Promise<{ success: boolean, message: string, session: object }>}
 */
export async function savePreparationSetup(payload) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/prep/setup`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to save preparation setup (HTTP ${res.status})`)
  }

  return data
}

/**
 * Retrieves a saved preparation setup session by its ID.
 *
 * @param {string} sessionId - PreparationSession ObjectId
 * @returns {Promise<{ success: boolean, session: object }>}
 */
export async function fetchPreparationSetup(sessionId) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/prep/setup/${encodeURIComponent(sessionId)}`, {
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch preparation setup (HTTP ${res.status})`)
  }

  return data
}

/**
 * Retrieves the latest preparation session for a role.
 *
 * @param {string} [roleId] - Optional role filter (e.g. 'frontend-developer')
 * @returns {Promise<{ success: boolean, session: object | null }>}
 */
export async function fetchLatestPreparationSession(roleId) {
  const headers = await getAuthHeader()
  const url = roleId
    ? `${API_BASE}/prep/session/latest?roleId=${encodeURIComponent(roleId)}`
    : `${API_BASE}/prep/session/latest`
  const res = await fetch(url, { headers })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch latest session (HTTP ${res.status})`)
  }

  return data
}

// =============================================================================
// PHASE B2: ADAPTIVE DIAGNOSTIC & PERSONALISED PREPARATION PLAN API
// =============================================================================

/**
 * Starts or resumes an adaptive knowledge diagnostic session.
 *
 * @param {object} params
 * @param {string} params.sessionId
 * @returns {Promise<{ success: boolean, diagnostic: object }>}
 */
export async function startDiagnostic({ sessionId }) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/prep/diagnostic/start`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sessionId }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to start diagnostic (HTTP ${res.status})`)
  }

  return data
}

/**
 * Submits an answer to a diagnostic question and retrieves formative feedback + next adaptive question.
 *
 * @param {object} params
 * @param {string} params.diagnosticId
 * @param {string} params.questionId
 * @param {string|number|null} params.studentAnswer
 * @param {boolean} [params.isSkipped=false]
 * @returns {Promise<{ success: boolean, isFinished: boolean, evaluation: object, nextQuestion: object | null, diagnostic: object }>}
 */
export async function submitDiagnosticAnswer({ diagnosticId, questionId, studentAnswer, isSkipped = false }) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/prep/diagnostic/answer`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ diagnosticId, questionId, studentAnswer, isSkipped }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to evaluate answer (HTTP ${res.status})`)
  }

  return data
}

/**
 * Completes or skips the diagnostic session early.
 *
 * @param {object} params
 * @param {string} params.diagnosticId
 * @param {boolean} [params.skipped=false]
 * @returns {Promise<{ success: boolean, diagnostic: object }>}
 */
export async function completeDiagnostic({ diagnosticId, skipped = false }) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/prep/diagnostic/complete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ diagnosticId, skipped }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to complete diagnostic (HTTP ${res.status})`)
  }

  return data
}

/**
 * Retrieves diagnostic session details by ID.
 *
 * @param {string} diagnosticId
 * @returns {Promise<{ success: boolean, diagnostic: object }>}
 */
export async function fetchDiagnosticSession(diagnosticId) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/prep/diagnostic/${encodeURIComponent(diagnosticId)}`, {
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch diagnostic session (HTTP ${res.status})`)
  }

  return data
}

/**
 * Requests Groq AI synthesis of a personalised preparation plan.
 *
 * @param {object} params
 * @param {string} params.sessionId
 * @param {string} [params.diagnosticId]
 * @returns {Promise<{ success: boolean, planId: string, plan: object }>}
 */
export async function generatePreparationPlan({ sessionId, diagnosticId }) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/prep/plan/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sessionId, diagnosticId }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to generate preparation plan (HTTP ${res.status})`)
  }

  return data
}

/**
 * Retrieves a preparation plan by ID.
 *
 * @param {string} planId
 * @returns {Promise<{ success: boolean, plan: object }>}
 */
export async function fetchPreparationPlan(planId) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/prep/plan/${encodeURIComponent(planId)}`, {
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch preparation plan (HTTP ${res.status})`)
  }

  return data
}

/**
 * Retrieves latest preparation plan for a role.
 *
 * @param {string} [roleId]
 * @returns {Promise<{ success: boolean, plan: object | null }>}
 */
export async function fetchLatestPreparationPlan(roleId) {
  const headers = await getAuthHeader()
  const url = roleId
    ? `${API_BASE}/prep/plan/latest?roleId=${encodeURIComponent(roleId)}`
    : `${API_BASE}/prep/plan/latest`
  const res = await fetch(url, { headers })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch latest plan (HTTP ${res.status})`)
  }

  return data
}

/**
 * Customizes milestones or schedule in an existing plan.
 *
 * @param {string} planId
 * @param {object} updates - { milestones, weeklySchedule, overview }
 * @returns {Promise<{ success: boolean, plan: object }>}
 */
export async function customizePreparationPlan(planId, updates) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/prep/plan/${encodeURIComponent(planId)}/customize`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to customize plan (HTTP ${res.status})`)
  }

  return data
}

/**
 * Accepts and finalizes a preparation plan.
 *
 * @param {string} planId
 * @returns {Promise<{ success: boolean, plan: object, message: string }>}
 */
export async function acceptPreparationPlan(planId) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/prep/plan/${encodeURIComponent(planId)}/accept`, {
    method: 'POST',
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to accept plan (HTTP ${res.status})`)
  }

  return data
}

/**
 * Fetches the official skill taxonomy for a specific role.
 *
 * @param {string} roleId
 * @returns {Promise<{ success: boolean, roleId: string, roleTitle: string, subtitle: string, categories: Array }>}
 */
export async function fetchRoleSkills(roleId) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/learning/skills/${encodeURIComponent(roleId)}`, {
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch skills taxonomy (HTTP ${res.status})`)
  }

  return data
}

/**
 * Fetches the authenticated student's saved skill selection for a role.
 *
 * @param {string} roleId
 * @returns {Promise<{ exists: boolean, roleId: string, selectedSkills: Array, customSkills: Array, updatedAt?: string }>}
 */
export async function fetchStudentSkillSelection(roleId) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/learning/selection/${encodeURIComponent(roleId)}`, {
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch skill selection (HTTP ${res.status})`)
  }

  return data
}

/**
 * Saves the authenticated student's selected skills and custom skills for a role.
 *
 * @param {string} roleId
 * @param {{ selectedSkillIds: string[], customSkills: string[] }} payload
 * @returns {Promise<{ success: boolean, selection: object, message: string }>}
 */
export async function saveStudentSkillSelection(roleId, payload) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/learning/selection/${encodeURIComponent(roleId)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to save skill selection (HTTP ${res.status})`)
  }

  return data
}

/**
 * Starts or retrieves the active continuous learning session for a role.
 *
 * @param {string} [roleId='frontend-developer']
 * @returns {Promise<{ success: boolean, isNew: boolean, session: object }>}
 */
export async function startOrGetLearningSession(roleId = 'frontend-developer') {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/learning/sessions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ roleId }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to initialize learning session (HTTP ${res.status})`)
  }

  return data
}

/**
 * Fetches learning session metadata.
 *
 * @param {string} sessionId
 * @returns {Promise<{ success: boolean, session: object }>}
 */
export async function fetchLearningSession(sessionId) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/learning/sessions/${encodeURIComponent(sessionId)}`, {
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to retrieve learning session (HTTP ${res.status})`)
  }

  return data
}

/**
 * Fetches the ordered message history for a learning session.
 *
 * @param {string} sessionId
 * @returns {Promise<{ success: boolean, messages: Array }>}
 */
export async function fetchLearningMessages(sessionId) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/learning/sessions/${encodeURIComponent(sessionId)}/messages`, {
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to retrieve conversation messages (HTTP ${res.status})`)
  }

  return data
}

/**
 * Sends a student message to the learning assistant and receives the AI response.
 *
 * @param {string} sessionId
 * @param {string} content
 * @returns {Promise<{ success: boolean, userMessage: object, assistantMessage: object, sessionContext: object }>}
 */
export async function sendLearningMessage(sessionId, content) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/learning/sessions/${encodeURIComponent(sessionId)}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Failed to send message (HTTP ${res.status})`)
  }

  return data
}
