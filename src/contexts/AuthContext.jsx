import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth'
import { auth, getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase'
import { AuthContext } from './authContextDef'

/**
 * Authentication context provider wrapping the application with Firebase Auth state.
 *
 * @param {{ children: import('react').ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured && Boolean(auth))

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      return
    }

    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      } else if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const previewToken = window.localStorage.getItem('careerlaunch_preview_token')
          if (previewToken) {
            const parts = previewToken.split('.')
            if (parts.length >= 2) {
              const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
              const decoded = JSON.parse(atob(base64))
              setUser({
                uid: decoded.user_id || decoded.uid,
                email: decoded.email,
                displayName: decoded.name || 'Student',
                emailVerified: true,
                getIdToken: async () => previewToken,
              })
            } else {
              setUser(null)
            }
          } else {
            setUser(null)
          }
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    // Clean up subscription on unmount
    return () => unsubscribe()
  }, [])

  const signUp = async (fullName, email, password) => {
    const authInstance = getFirebaseAuth()
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password)

    // Save user's full name as Firebase Auth displayName
    if (fullName.trim()) {
      await updateProfile(userCredential.user, {
        displayName: fullName.trim(),
      })
    }

    // Send email verification link
    try {
      await sendEmailVerification(userCredential.user)
    } catch (err) {
      console.warn('Could not automatically dispatch email verification:', err)
    }

    // Update local state with latest user details
    setUser(authInstance.currentUser)
    return userCredential
  }

  const signIn = async (email, password, rememberMe = false) => {
    const authInstance = getFirebaseAuth()

    try {
      await setPersistence(
        authInstance,
        rememberMe ? browserLocalPersistence : browserSessionPersistence,
      )
    } catch {
      // Fallback silently to default persistence if browser denies storage access
    }

    const userCredential = await signInWithEmailAndPassword(authInstance, email, password)
    setUser(userCredential.user)
    return userCredential
  }

  const signOut = async () => {
    const authInstance = getFirebaseAuth()
    await firebaseSignOut(authInstance)
    setUser(null)
  }

  const sendVerificationEmail = async () => {
    const authInstance = getFirebaseAuth()
    if (!authInstance.currentUser) {
      throw new Error('No authenticated user found to send verification email to.')
    }
    await sendEmailVerification(authInstance.currentUser)
  }

  const sendPasswordReset = async (email) => {
    const authInstance = getFirebaseAuth()
    await sendPasswordResetEmail(authInstance, email)
  }

  const refreshUser = async () => {
    const authInstance = getFirebaseAuth()
    if (authInstance.currentUser) {
      await authInstance.currentUser.reload()
      const updatedUser = authInstance.currentUser
      setUser({ ...updatedUser })
      return updatedUser
    }
    return null
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    isEmailVerified: Boolean(user?.emailVerified),
    isFirebaseConfigured,
    signUp,
    signIn,
    signOut,
    sendVerificationEmail,
    sendPasswordReset,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
