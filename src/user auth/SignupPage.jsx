/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { useAuth } from './AuthContext'
import './LoginPage.css'

const ROLES = ['Pharmacist', 'Pharmacy Technician', 'Clinical Manager', 'Nurse Practitioner']

function getPasswordStrength(pw) {
  if (pw.length === 0) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map = [
    { label: 'Too short', color: 'var(--critical)', pct: '10%' },
    { label: 'Weak', color: 'var(--critical)', pct: '25%' },
    { label: 'Fair', color: 'var(--warning)', pct: '50%' },
    { label: 'Good', color: '#16a34a', pct: '75%' },
    { label: 'Strong', color: 'var(--success)', pct: '100%' },
  ]
  return { score, ...map[Math.min(score, 4)] }
}

function SignupPage({ onSwitchToLogin }) {
  const { signup, loginWithGoogle } = useAuth()

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const strength = getPasswordStrength(form.password)

  const validate = () => {
    const errs = {}
    if (!form.displayName.trim()) errs.displayName = 'Full name is required.'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email required.'
    if (!form.role) errs.role = 'Please select your role.'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setAuthError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    try {
      setLoading(true)
      setAuthError('')
      const fullName = `${form.displayName.trim()} (${form.role})`
      await signup(form.email, form.password, fullName)
    } catch (err) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists.'
          : err.code === 'auth/weak-password'
            ? 'Password is too weak. Use at least 8 characters.'
            : 'Sign up failed. Please try again.'
      setAuthError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand-panel">
        <div className="auth-brand-inner">
          <div className="auth-brand-logo"><span>Rx</span></div>
          <h1 className="auth-brand-name">PharmaPro CIS</h1>
          <p className="auth-brand-tagline">Clinical Inventory System</p>
          <ul className="auth-feature-list">
            <li><span className="feature-icon">◫</span>Real-time pharmaceutical inventory</li>
            <li><span className="feature-icon">⏱</span>Automated expiry monitoring</li>
            <li><span className="feature-icon">⊕</span>Integrated dispensing workflows</li>
            <li><span className="feature-icon">↗</span>Stock trend analytics</li>
          </ul>
          <p className="auth-brand-note">
            Join your clinical team on PharmaPro CIS to manage inventory safely and efficiently.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h2>Create account</h2>
            <p>Set up your PharmaPro clinical profile</p>
          </div>

          {authError && (
            <div className="auth-error-notice" role="alert">⚠ {authError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <div className="form-group">
              <label htmlFor="sig-name" className="form-label">Full Name <span className="required">*</span></label>
              <input
                id="sig-name" name="displayName" type="text"
                className={`form-control ${errors.displayName ? 'form-control-error' : ''}`}
                placeholder="Dr. Sarah Kim"
                value={form.displayName} onChange={handleChange}
              />
              {errors.displayName && <span className="field-error">{errors.displayName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="sig-email" className="form-label">Email Address <span className="required">*</span></label>
              <input
                id="sig-email" name="email" type="email"
                className={`form-control ${errors.email ? 'form-control-error' : ''}`}
                placeholder="s.kim@hospital.org"
                value={form.email} onChange={handleChange}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="sig-role" className="form-label">Clinical Role <span className="required">*</span></label>
              <select
                id="sig-role" name="role"
                className={`form-control ${errors.role ? 'form-control-error' : ''}`}
                value={form.role} onChange={handleChange}
              >
                <option value="">Select your role…</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.role && <span className="field-error">{errors.role}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="sig-pass" className="form-label">Password <span className="required">*</span></label>
              <div className="pass-input-wrap">
                <input
                  id="sig-pass" name="password"
                  type={showPass ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'form-control-error' : ''}`}
                  placeholder="Min. 8 characters"
                  value={form.password} onChange={handleChange}
                  style={{ paddingRight: '44px', width: '100%' }}
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass((s) => !s)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {form.password.length > 0 && (
                <>
                  <div className="pass-strength-bar">
                    <div className="pass-strength-fill" style={{ width: strength.pct, background: strength.color }} />
                  </div>
                  <span className="pass-strength-text" style={{ color: strength.color }}>{strength.label}</span>
                </>
              )}
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="sig-confirm" className="form-label">Confirm Password <span className="required">*</span></label>
              <input
                id="sig-confirm" name="confirmPassword" type="password"
                className={`form-control ${errors.confirmPassword ? 'form-control-error' : ''}`}
                placeholder="Repeat password"
                value={form.confirmPassword} onChange={handleChange}
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit" className="btn btn-primary auth-submit-btn"
              disabled={loading} id="signup-submit"
            >
              {loading ? <span className="btn-spinner" /> : 'Create Account'}
            </button>
            
            <div className="auth-divider">
              <span>or</span>
            </div>
            
            <button
              type="button"
              className="btn auth-google-btn"
              onClick={async () => {
                try {
                  setAuthError('')
                  setLoading(true)
                  await loginWithGoogle()
                } catch (err) {
                  setAuthError('Google sign-in failed or was cancelled.')
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
              Sign up with Google
            </button>
          </form>

          <div className="auth-switch">
            <p>
              Already have an account?{' '}
              <button type="button" className="auth-switch-link" onClick={onSwitchToLogin}>
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
