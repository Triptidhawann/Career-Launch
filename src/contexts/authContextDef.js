import { createContext } from 'react'

/**
 * @typedef {Object} AuthContextType
 * @property {import('firebase/auth').User | null} user
 * @property {boolean} isLoading
 * @property {boolean} isAuthenticated
 * @property {boolean} isEmailVerified
 * @property {boolean} isFirebaseConfigured
 * @property {(fullName: string, email: string, password: string) => Promise<import('firebase/auth').UserCredential>} signUp
 * @property {(email: string, password: string, rememberMe?: boolean) => Promise<import('firebase/auth').UserCredential>} signIn
 * @property {() => Promise<void>} signOut
 * @property {() => Promise<void>} sendVerificationEmail
 * @property {(email: string) => Promise<void>} sendPasswordReset
 * @property {() => Promise<import('firebase/auth').User | null>} refreshUser
 */

export const AuthContext = createContext(undefined)
