import { useEffect, useState, type ReactNode } from 'react'
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
  type User,
  type UserCredential,
} from 'firebase/auth'
import { auth, getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase'
import { AuthContext, type AuthContextType } from './authContextDef'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(isFirebaseConfigured && Boolean(auth))

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      return
    }

    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsLoading(false)
    })

    // Clean up subscription on unmount
    return () => unsubscribe()
  }, [])

  const signUp = async (
    fullName: string,
    email: string,
    password: string,
  ): Promise<UserCredential> => {
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

  const signIn = async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<UserCredential> => {
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

  const signOut = async (): Promise<void> => {
    const authInstance = getFirebaseAuth()
    await firebaseSignOut(authInstance)
    setUser(null)
  }

  const sendVerificationEmail = async (): Promise<void> => {
    const authInstance = getFirebaseAuth()
    if (!authInstance.currentUser) {
      throw new Error('No authenticated user found to send verification email to.')
    }
    await sendEmailVerification(authInstance.currentUser)
  }

  const sendPasswordReset = async (email: string): Promise<void> => {
    const authInstance = getFirebaseAuth()
    await sendPasswordResetEmail(authInstance, email)
  }

  const refreshUser = async (): Promise<User | null> => {
    const authInstance = getFirebaseAuth()
    if (authInstance.currentUser) {
      await authInstance.currentUser.reload()
      const updatedUser = authInstance.currentUser
      setUser({ ...updatedUser } as User)
      return updatedUser
    }
    return null
  }

  const value: AuthContextType = {
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
