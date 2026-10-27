import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { useAuth } from '@/hooks/useAuth'
import { fetchOnboardingStatus } from '@/lib/api'
import { getFirebaseErrorMessage } from '@/lib/firebase'

export function LoginPage() {
  const { signIn, isFirebaseConfigured } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [unverifiedWarning, setUnverifiedWarning] = useState<boolean>(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setUnverifiedWarning(false)

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

    if (!password) {
      setErrorMessage('Please enter your password.')
      return
    }

    setIsSubmitting(true)

    try {
      const userCredential = await signIn(email.trim(), password, rememberMe)
      const user = userCredential.user

      // Check email verification policy
      if (!user.emailVerified) {
        setUnverifiedWarning(true)
        setIsSubmitting(false)
        return
      }

      // Successful verified login - check onboarding status
      try {
        const status = await fetchOnboardingStatus()
        if (status.isCompleted) {
          navigate('/dashboard')
        } else {
          navigate('/onboarding')
        }
      } catch {
        navigate('/onboarding')
      }
    } catch (err: any) {
      console.error('Sign in failed:', err)
      const friendlyMessage = err.code
        ? getFirebaseErrorMessage(err.code)
        : err.message || 'An error occurred while signing in. Please verify your credentials.'
      setErrorMessage(friendlyMessage)
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Student & Admin Access"
      title="Welcome back"
      subtitle="Sign in to continue your personalized interview preparation and opportunity tracking."
      footerPrompt={
        <span>
          Don't have an account yet?{' '}
          <Link to="/signup" className="auth-link">
            Create an Account
          </Link>
        </span>
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
              <strong>Firebase Setup Required:</strong> To enable real authentication, add your{' '}
              <code>VITE_FIREBASE_*</code> credentials to a <code>.env</code> file.
            </div>
          </div>
        )}

        {/* Email Field */}
        <div className="auth-field">
          <label htmlFor="loginEmail" className="auth-label">
            Email Address
          </label>
          <div className="auth-input-wrapper">
            <Mail size={16} className="auth-input-icon" />
            <input
              id="loginEmail"
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

        {/* Password Field */}
        <div className="auth-field">
          <div className="auth-label">
            <label htmlFor="loginPassword">Password</label>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.75rem' }}>
              Forgot password?
            </Link>
          </div>
          <div className="auth-input-wrapper">
            <Lock size={16} className="auth-input-icon" />
            <input
              id="loginPassword"
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isSubmitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="auth-input auth-input--password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-password-toggle"
              disabled={isSubmitting}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember Me Option */}
        <div className="auth-options-row">
          <label className="auth-checkbox-label">
            <input
              type="checkbox"
              disabled={isSubmitting}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me for 30 days</span>
          </label>
        </div>

        {/* Unverified Email Alert Policy */}
        {unverifiedWarning && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(198, 106, 74, 0.12)',
              border: '1px solid rgba(198, 106, 74, 0.35)',
              color: '#8A3B22',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div>
              <strong>Email Verification Required:</strong> Your email address must be verified
              before accessing your student preparation dashboard.
            </div>
            <div>
              <Link
                to="/verify-email"
                state={{ email: email.trim() }}
                className="btn btn-terracotta"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem', width: 'fit-content' }}
              >
                Go to Verification Screen →
              </Link>
            </div>
          </div>
        )}

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

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-terracotta auth-submit-btn"
          style={{ opacity: isSubmitting ? 0.75 : 1 }}
        >
          <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
          <ArrowRight size={16} />
        </button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
