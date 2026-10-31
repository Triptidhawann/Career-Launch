import { useContext } from 'react'
import { AuthContext } from '@/contexts/authContextDef'

/**
 * Custom hook providing access to authentication state and methods.
 *
 * @returns {import('@/contexts/authContextDef').AuthContextType}
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth
