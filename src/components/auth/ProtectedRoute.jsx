import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { fetchOnboardingStatus, fetchProfile } from '@/lib/api'

/**
 * Route protection wrapper requiring authentication, email verification, or onboarding completion.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children - Protected children components
 * @param {boolean} [props.requireVerifiedEmail=false] - Requires email verification before access
 * @param {boolean} [props.requireOnboarding=false] - Requires completed student onboarding
 */
export function ProtectedRoute({
  children,
  requireVerifiedEmail = false,
  requireOnboarding = false,
}) {
  const { user, isLoading, isAuthenticated, isEmailVerified } = useAuth()
  const location = useLocation()

  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(null)

  const needOnboardingCheck = isAuthenticated && requireOnboarding

  useEffect(() => {
    if (!needOnboardingCheck || !user) return

    let isMounted = true

    fetchOnboardingStatus()
      .then((res) => {
        if (isMounted) {
          setIsOnboardingCompleted(res.isCompleted)
        }
      })
      .catch(async (err) => {
        console.warn('Failed to verify onboarding status in ProtectedRoute, trying profile fallback:', err)
        try {
          const profRes = await fetchProfile()
          if (isMounted) {
            setIsOnboardingCompleted(Boolean(profRes.profile && profRes.profile.onboarding?.isCompleted))
          }
        } catch {
          if (isMounted) {
            setIsOnboardingCompleted(false)
          }
        }
      })

    return () => {
      isMounted = false
    }
  }, [needOnboardingCheck, user])

  const isCheckingOnboarding = needOnboardingCheck && isOnboardingCompleted === null

  if (isLoading || isCheckingOnboarding) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-ivory)',
          color: 'var(--color-forest)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--color-sand)',
            borderTopColor: 'var(--color-terracotta)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-charcoal-muted)' }}>
          Preparing your workspace...
        </p>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verification required but unverified
  if (requireVerifiedEmail && !isEmailVerified) {
    return <Navigate to="/verify-email" replace />
  }

  // Onboarding required but not yet completed
  if (requireOnboarding && isOnboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
