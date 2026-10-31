import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldAlert, User } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { useAuth } from '@/hooks/useAuth'
import { getFirebaseErrorMessage } from '@/lib/firebase'

export function SignupPage() {
  const { signUp, isFirebaseConfigured } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!isFirebaseConfigured) {
      setErrorMessage(
        'Firebase configuration is missing. Please define VITE_FIREBASE_* variables in your .env file.',
      )
      return
    }

    // Client-side validations
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.')
      return
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.')
      return
    }

    if (!password) {
      setErrorMessage('Please enter a password.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password entry.')
      return
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service and Privacy Policy to continue.')
      return
    }

    setIsSubmitting(true)

    try {
      // Real Firebase user creation + displayName update + email verification dispatch
      await signUp(fullName, email, password)

      // Direct to verification instruction screen
      navigate('/verify-email', {
        state: {
          email: email.trim(),
          justRegistered: true,
        },
      })
    } catch (err) {
      console.error('Registration failed:', err)
      const friendlyMessage = err.code
        ? getFirebaseErrorMessage(err.code)
        : err.message || 'An error occurred during registration. Please try again.'
      setErrorMessage(friendlyMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Student Registration"
      title="Create your account"
      subtitle="Begin your structured path toward placement readiness and opportunity discovery."
      footerPrompt={
        <span>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign In
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
              <strong>Firebase Setup Required:</strong> To register real accounts, add your{' '}
              <code>VITE_FIREBASE_*</code> project credentials to a <code>.env</code> file.
            </div>
          </div>
        )}

        {/* Full Name */}
        <div className="auth-field">
          <label htmlFor="fullName" className="auth-label">
            Full Name
          </label>
          <div className="auth-input-wrapper">
            <User size={16} className="auth-input-icon" />
            <input
              id="fullName"
              type="text"
              required
              disabled={isSubmitting}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Julian Drake"
              className="auth-input"
              autoComplete="name"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="auth-field">
          <label htmlFor="email" className="auth-label">
            University / Personal Email
          </label>
          <div className="auth-input-wrapper">
            <Mail size={16} className="auth-input-icon" />
            <input
              id="email"
              type="email"
              required
              disabled={isSubmitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="julian@university.edu"
              className="auth-input"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div className="auth-field">
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <div className="auth-input-wrapper">
            <Lock size={16} className="auth-input-icon" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isSubmitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="auth-input auth-input--password"
              autoComplete="new-password"
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

        {/* Confirm Password */}
        <div className="auth-field">
          <label htmlFor="confirmPassword" className="auth-label">
            Confirm Password
          </label>
          <div className="auth-input-wrapper">
            <Lock size={16} className="auth-input-icon" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              disabled={isSubmitting}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="auth-input auth-input--password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-password-toggle"
              disabled={isSubmitting}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="auth-options-row">
          <label className="auth-checkbox-label">
            <input
              type="checkbox"
              disabled={isSubmitting}
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <span>
              I agree to the{' '}
              <a href="#terms" className="auth-link">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="auth-link">
                Privacy Policy
              </a>
            </span>
          </label>
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

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-terracotta auth-submit-btn"
          style={{ opacity: isSubmitting ? 0.75 : 1 }}
        >
          <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
          <ArrowRight size={16} />
        </button>
      </form>
    </AuthLayout>
  )
}

export default SignupPage
