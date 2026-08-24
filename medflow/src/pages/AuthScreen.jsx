import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import Logo from '../components/Logo'

export default function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'signin')
  const [role, setRole] = useState(searchParams.get('role') === 'supplier' ? 'supplier' : 'clinic')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signin') {
        await signIn({ email, password })
      } else {
        await signUp({ email, password, role, organizationName: orgName })
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand" style={{ justifyContent: 'space-between' }}>
          <Logo variant="full" size={30} />
          <Link to="/" className="link-teal" style={{ fontSize: 12.5 }}>← Back to site</Link>
        </div>

        <div className="auth-tab-row">
          <button
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => setMode('signin')}
            type="button"
          >
            Log in
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
            type="button"
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <div className="field">
                <label>Account type</label>
                <div className="role-select">
                  <div
                    className={`role-option ${role === 'clinic' ? 'selected' : ''}`}
                    onClick={() => setRole('clinic')}
                  >
                    <div className="rt">Clinic</div>
                    <div className="rd">Order supplies</div>
                  </div>
                  <div
                    className={`role-option ${role === 'supplier' ? 'selected' : ''}`}
                    onClick={() => setRole('supplier')}
                  >
                    <div className="rt">Supplier</div>
                    <div className="rd">Fulfill orders</div>
                  </div>
                </div>
              </div>
              <div className="field">
                <label>Organization name</label>
                <input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder={role === 'clinic' ? 'Riverside Family Clinic' : 'Meridian Medical Supply Co.'}
                  required
                />
              </div>
            </>
          )}

          <div className="field">
            <label>Work email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.com"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          {error && <div className="error-text">{error}</div>}

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
