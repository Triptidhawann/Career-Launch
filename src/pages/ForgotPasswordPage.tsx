import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, ShieldAlert } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { useAuth } from '@/hooks/useAuth'
import { getFirebaseErrorMessage } from '@/lib/firebase'

export function ForgotPasswordPage() {
  const { sendPasswordReset, isFirebaseConfigured } = useAuth()

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!isFirebaseConfigured) {
      setErrorMessage(
        'Firebase configuration is missing. Please define VITE_FIREBASE_* variables in your .env file.',
      )
      return
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.')
      return
    }

    setIsSubmitting(true)

    try {
      await sendPasswordReset(email.trim())
      setSuccessMessage(
        `A password recovery link has been dispatched to ${email.trim()}. Please inspect your inbox and spam folder.`,
      )
    } catch (err: any) {
      console.error('Password reset request failed:', err)
      const friendlyMessage = err.code
        ? getFirebaseErrorMessage(err.code)
        : err.message || 'Failed to dispatch password recovery email.'
      setErrorMessage(friendlyMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Account Recovery"
      title="Reset your password"
      subtitle="Enter the email associated with your account, and we will send a password reset verification link."
      footerPrompt={
        <Link
          to="/login"
          className="auth-link"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* Setup Warning if Firebase credentials missing */}
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
              <strong>Firebase Setup Required:</strong> To send recovery links, add your{' '}
              <code>VITE_FIREBASE_*</code> credentials to a <code>.env</code> file.
            </div>
          </div>
        )}

        {/* Email Field */}
        <div className="auth-field">
          <label htmlFor="recoveryEmail" className="auth-label">
            Registered Email Address
          </label>
          <div className="auth-input-wrapper">
            <Mail size={16} className="auth-input-icon" />
            <input
              id="recoveryEmail"
              type="email"
              required
              disabled={isSubmitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              className="auth-input"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#b91c1c',
              fontSize: '0.82rem',
              lineHeight: 1.4,
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(135, 148, 119, 0.15)',
              border: '1px solid rgba(135, 148, 119, 0.35)',
              color: '#3B472E',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              lineHeight: 1.45,
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-terracotta auth-submit-btn"
          style={{ opacity: isSubmitting ? 0.75 : 1 }}
        >
          <span>{isSubmitting ? 'Sending link...' : 'Send Reset Link'}</span>
          <ArrowRight size={16} />
        </button>
      </form>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
