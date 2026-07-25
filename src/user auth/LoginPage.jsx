/**
 * File: LoginPage.jsx
 * Description: The authentication login view. Handles user sign-in via 
 * email/password or Google, and provides password reset functionality.
 */
/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { useAuth } from './AuthContext'
import './LoginPage.css'

/**
 * LoginPage Component
 * 
 * @param {Object} props - The component props.
 * @param {Function} props.onSwitchToSignup - Callback to switch to the signup view.
 * @returns {JSX.Element} The rendered login page.
 */
function LoginPage({ onSwitchToSignup }) {
  const { login, resetPassword, loginWithGoogle } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    try {
      setError('')
      setLoading(true)
      await login(email, password)
    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Invalid email or password. Please try again.'
          : err.code === 'auth/too-many-requests'
            ? 'Too many failed attempts. Try again later.'
            : 'Login failed. Please check your credentials.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address first, then click "Forgot password".')
      return
    }
    try {
      setError('')
      await resetPassword(email)
      setResetSent(true)
    } catch {
      setError('Could not send reset email. Check the address and try again.')
    }
  }

  return (
    <div className="auth-shell">
      {/* Left branding panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-inner">
          <div className="auth-brand-logo" style={{ background: 'transparent', border: 'none' }}>
            <img src="/logo.png" alt="PharmaPro Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 className="auth-brand-name">PharmaPro CIS</h1>
          <p className="auth-brand-tagline">Clinical Inventory System</p>
          <ul className="auth-feature-list">
            <li>
              <span className="feature-icon">◫</span>
              Real-time pharmaceutical inventory
            </li>
            <li>
              <span className="feature-icon">⏱</span>
              Automated expiry monitoring
            </li>
            <li>
              <span className="feature-icon">⊕</span>
              Integrated dispensing workflows
            </li>
            <li>
              <span className="feature-icon">↗</span>
              Stock trend analytics
            </li>
          </ul>
          <p className="auth-brand-note">
            Trusted by clinical pharmacists for precise, safe inventory management.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your PharmaPro account</p>
          </div>

          {resetSent ? (
            <div className="auth-success-notice">
              ✓ Password reset email sent to <strong>{email}</strong>. Check your inbox.
            </div>
          ) : null}

          {error && (
            <div className="auth-error-notice" role="alert">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="you@hospital.org"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Password
              </label>
              <div className="pass-input-wrap">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="forgot-link"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <span className="btn-spinner" />
              ) : (
                'Sign In'
              )}
            </button>
            
            <div className="auth-divider">
              <span>or</span>
            </div>
            
            <button
              type="button"
              className="btn auth-google-btn"
              onClick={async () => {
                try {
                  setError('')
                  setLoading(true)
                  await loginWithGoogle()
                } catch (err) {
                  setError('Google sign-in failed or was cancelled.')
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </form>

          <div className="auth-switch">
            <p>
              Don&apos;t have an account?{' '}
              <button type="button" className="auth-switch-link" onClick={onSwitchToSignup}>
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
