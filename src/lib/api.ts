import { auth } from './firebase'
import type {
  OnboardingPayload,
  StudentProfile,
} from '@/types/profile'

const API_BASE = '/api'

async function getAuthHeader(): Promise<HeadersInit> {
  const headers: HeadersInit = {
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

export interface ApiStatusResponse {
  exists: boolean
  isCompleted: boolean
  stepCompleted: number
  fullName?: string
  role?: string
}

export interface ApiProfileResponse {
  profile: StudentProfile | null
  isCompleted: boolean
  message?: string
}

/**
 * Checks the authenticated student's onboarding completion status.
 */
export async function fetchOnboardingStatus(): Promise<ApiStatusResponse> {
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
 */
export async function fetchProfile(): Promise<ApiProfileResponse> {
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
 */
export async function submitOnboarding(
  data: OnboardingPayload,
): Promise<{ success: boolean; message: string; profile: StudentProfile }> {
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
 */
export async function updateProfile(
  data: Partial<StudentProfile>,
): Promise<{ success: boolean; message: string; profile: StudentProfile }> {
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
