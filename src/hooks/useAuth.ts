import { useContext } from 'react'
import { AuthContext, type AuthContextType } from '@/contexts/authContextDef'

/**
 * Custom hook providing access to authentication state and methods.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth
