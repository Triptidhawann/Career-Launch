import { createContext } from 'react'
import type { User, UserCredential } from 'firebase/auth'

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isEmailVerified: boolean
  isFirebaseConfigured: boolean
  signUp: (fullName: string, email: string, password: string) => Promise<UserCredential>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<UserCredential>
  signOut: () => Promise<void>
  sendVerificationEmail: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  refreshUser: () => Promise<User | null>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
