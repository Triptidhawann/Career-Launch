import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { fetchOnboardingStatus } from '@/lib/api'

interface ProtectedRouteProps {
  children: ReactNode
  requireVerifiedEmail?: boolean
  requireOnboarding?: boolean
}

export function ProtectedRoute({
  children,
  requireVerifiedEmail = false,
  requireOnboarding = false,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, isEmailVerified } = useAuth()
  const location = useLocation()

  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null)

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
      .catch((err) => {
        console.warn('Failed to verify onboarding status in ProtectedRoute:', err)
        if (isMounted) {
          setIsOnboardingCompleted(false)
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
