import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * Checks whether all required Firebase credentials have been configured.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your_api_key_here',
)

let app = null
let auth = null

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
  } catch (err) {
    console.error('Failed to initialize Firebase SDK:', err)
  }
}

/**
 * Returns the initialized Firebase Auth instance.
 * Throws a descriptive error if environment variables have not been configured.
 *
 * @returns {import('firebase/auth').Auth} Initialized Firebase Auth instance
 */
export function getFirebaseAuth() {
  if (!auth) {
    throw new Error(
      'Firebase is not configured. Please supply VITE_FIREBASE_* credentials in your .env file.',
    )
  }
  return auth
}

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 *
 * @param {string} errorCode - Firebase error code string (e.g. 'auth/user-not-found')
 * @returns {string} Human-readable error message
 */
export function getFirebaseErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a password with at least 6 characters.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials and try again.'
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.'
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access has been temporarily restricted. Please try again later.'
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.'
    case 'auth/requires-recent-login':
      return 'This operation is sensitive and requires a fresh login. Please re-authenticate.'
    case 'auth/missing-password':
      return 'Please enter a password.'
    case 'auth/missing-email':
      return 'Please enter an email address.'
    default:
      return 'An unexpected authentication error occurred. Please try again.'
  }
}

export { app, auth }
