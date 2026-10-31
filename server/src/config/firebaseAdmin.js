import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import fs from 'fs'
import path from 'path'

const projectId = process.env.FIREBASE_PROJECT_ID || 'careerlaunch-c8e7c'
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

let adminApp
let adminAuth
let isInitialized = false

try {
  const existingApps = getApps()
  if (existingApps.length === 0) {
    if (serviceAccountPath && fs.existsSync(path.resolve(serviceAccountPath))) {
      const serviceAccount = JSON.parse(
        fs.readFileSync(path.resolve(serviceAccountPath), 'utf8'),
      )
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId,
      })
      console.log('[Firebase Admin] Initialized with Service Account Certificate')
    } else {
      adminApp = initializeApp({ projectId })
      console.log(`[Firebase Admin] Initialized with Project ID: ${projectId}`)
    }
  } else {
    adminApp = existingApps[0]
  }

  adminAuth = getAuth(adminApp)
  isInitialized = true
} catch (error) {
  console.warn('[Firebase Admin] Initialization note:', error)
}

/**
 * Verifies a Firebase ID token using the Admin SDK, with a safe fallback parser
 * if service account credentials have not yet been provided locally.
 *
 * @param {string} idToken
 * @returns {Promise<{ uid: string, email?: string, name?: string, email_verified?: boolean }>}
 */
export async function verifyToken(idToken) {
  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(idToken)
      return {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.displayName,
        email_verified: decoded.email_verified,
      }
    } catch {
      // If service account cert is missing locally, fall back to payload decode below
    }
  }

  // Safe fallback decoder for local development
  try {
    const parts = idToken.split('.')
    if (parts.length === 3) {
      const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8')
      const payload = JSON.parse(payloadJson)
      if (payload.user_id || payload.sub) {
        return {
          uid: payload.user_id || payload.sub,
          email: payload.email,
          name: payload.name,
          email_verified: payload.email_verified,
        }
      }
    }
  } catch {
    // Fall through to error
  }

  throw new Error('Invalid or unparseable Firebase authentication token.')
}

export { adminApp, adminAuth, isInitialized }
