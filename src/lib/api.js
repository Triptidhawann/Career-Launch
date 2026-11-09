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
