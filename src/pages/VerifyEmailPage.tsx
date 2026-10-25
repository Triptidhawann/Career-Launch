import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Mail,
  RefreshCw,
  Send,
  ShieldAlert,
} from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { useAuth } from '@/hooks/useAuth'
import { getFirebaseErrorMessage } from '@/lib/firebase'

export function VerifyEmailPage() {
  const {
    user,
    isEmailVerified,
    refreshUser,
    sendVerificationEmail,
    signOut,
    isFirebaseConfigured,
  } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [isChecking, setIsChecking] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Retrieve email from user session or from signup navigation state
  const targetEmail =
    user?.email || (location.state as { email?: string })?.email || 'your email address'

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Check verification status
  const handleCheckStatus = async () => {
    setIsChecking(true)
    setErrorMessage(null)
    setFeedbackMessage(null)

    try {
      const refreshed = await refreshUser()
      if (refreshed?.emailVerified) {
        setFeedbackMessage('Email verified successfully! You may now proceed.')
      } else {
        setErrorMessage(
          'Email has not yet been verified. Please click the link in your email and try again.',
        )
      }
    } catch (err: any) {
      setErrorMessage(
        err.code ? getFirebaseErrorMessage(err.code) : 'Failed to refresh verification status.',
      )
    } finally {
      setIsChecking(false)
    }
  }

  // Resend verification email
  const handleResend = async () => {
    if (resendCooldown > 0) return
    setIsResending(true)
    setErrorMessage(null)
    setFeedbackMessage(null)

    try {
      await sendVerificationEmail()
      setFeedbackMessage(`A fresh verification link was sent to ${targetEmail}.`)
      setResendCooldown(60)
    } catch (err: any) {
      setErrorMessage(
        err.code ? getFirebaseErrorMessage(err.code) : 'Failed to resend verification email.',
      )
    } finally {
      setIsResending(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch {
      navigate('/login')
    }
  }

  return (
    <AuthLayout
      eyebrow="Account Verification"
      title={isEmailVerified ? 'Email Verified' : 'Verify your email address'}
      subtitle={
        isEmailVerified
          ? 'Your email address has been verified. Welcome to CareerLaunch!'
          : 'Please verify your email address to access your student preparation area.'
      }
      footerPrompt={
        <span>
          Need to use a different email?{' '}
          <button
            type="button"
            onClick={handleSignOut}
            className="auth-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Sign out and switch accounts
          </button>
        </span>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Setup notice if Firebase is not yet configured */}
        {!isFirebaseConfigured && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(198, 106, 74, 0.12)',
              border: '1px solid rgba(198, 106, 74, 0.3)',
              color: '#8A3B22',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Firebase Setup Required:</strong> To enable real email verification dispatch,
              populate <code>VITE_FIREBASE_*</code> credentials in your <code>.env</code> file.
            </div>
          </div>
        )}

        {/* If already verified */}
        {isEmailVerified ? (
          <div
            style={{
              padding: '24px',
              borderRadius: '12px',
              backgroundColor: 'rgba(135, 148, 119, 0.15)',
              border: '1px solid rgba(135, 148, 119, 0.35)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'var(--color-sage)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>
              Verification Complete
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-charcoal-muted)' }}>
              Your account for <strong>{targetEmail}</strong> is verified and ready for preparation.
            </p>
            <Link
              to="/"
              className="btn btn-terracotta"
              style={{ marginTop: 8, padding: '0.65rem 1.4rem' }}
            >
              <span>Explore Platform</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          /* Verification Instructions */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-ivory)',
                border: '1px solid var(--color-sand)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-terracotta)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Mail size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-charcoal-muted)' }}>
                  Verification sent to
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>
                  {targetEmail}
                </div>
              </div>
            </div>

            <ol
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                fontSize: '0.82rem',
                color: 'var(--color-charcoal-muted)',
                lineHeight: 1.5,
                paddingLeft: 20,
              }}
            >
              <li>Open your email client and locate the message from CareerLaunch / Firebase.</li>
              <li>Check your <strong>Spam</strong> or <strong>Promotions</strong> folder if not found within 2 minutes.</li>
              <li>Click the verification link in the email.</li>
              <li>Return to this page and click <strong>Check Verification Status</strong> below.</li>
            </ol>

            {/* Error & Feedback Messages */}
            {errorMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#b91c1c',
                  fontSize: '0.82rem',
                }}
              >
                {errorMessage}
              </div>
            )}

            {feedbackMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(135, 148, 119, 0.15)',
                  border: '1px solid rgba(135, 148, 119, 0.3)',
                  color: '#3B472E',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CheckCircle2 size={16} />
                <span>{feedbackMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={isChecking}
                className="btn btn-terracotta"
                style={{ height: 46, width: '100%' }}
              >
                <RefreshCw size={15} className={isChecking ? 'animate-spin' : ''} />
                <span>{isChecking ? 'Checking status...' : 'Check Verification Status'}</span>
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="btn btn-outline-dark"
                style={{ height: 44, width: '100%' }}
              >
                {resendCooldown > 0 ? (
                  <>
                    <Clock size={15} />
                    <span>Resend link in {resendCooldown}s</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>{isResending ? 'Sending...' : 'Resend Verification Email'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}

export default VerifyEmailPage
