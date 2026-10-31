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
