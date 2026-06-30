import { useEffect, useState } from 'react';
import { Logo } from '../components/ui/Logo';
import { getAdminUrl, loginUser, registerUser } from '../utils/authApi';
import type { UserSession } from '../utils/authSession';

interface AuthPageProps {
  onAuth: (session: UserSession) => void;
}

type UserMode = 'login' | 'register';

export function AuthPage({ onAuth }: AuthPageProps) {
  const [mode, setMode] = useState<UserMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('signup') === '1') setMode('register');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result =
        mode === 'login'
          ? await loginUser(email, password)
          : await registerUser({ email, displayName, password });
      onAuth({ token: result.token, user: result.user });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: UserMode) => {
    setMode(next);
    setError('');
    const url = new URL(window.location.href);
    if (next === 'register') url.searchParams.set('signup', '1');
    else url.searchParams.delete('signup');
    window.history.replaceState({}, '', url.toString());
  };

  const adminLoginUrl = `${getAdminUrl()}/login`;

  return (
    <div className="qc-auth-page">
      <div className="qc-auth-visual">
        <div className="qc-auth-visual-content">
          <Logo size={72} style={{ boxShadow: '0 12px 40px rgba(59, 130, 246, 0.35)' }} />
          <h2>Connect with confidence.</h2>
          <p>
            Secure messaging built for teams and professionals. Sign in or create your free account to get started.
          </p>
          <div className="qc-auth-feature-list">
            <div className="qc-auth-feature">
              <span>🔒</span>
              <span>End-to-end secure conversations</span>
            </div>
            <div className="qc-auth-feature">
              <span>⚡</span>
              <span>Real-time chat and notifications</span>
            </div>
            <div className="qc-auth-feature">
              <span>👥</span>
              <span>Team messaging workspace</span>
            </div>
          </div>
        </div>
      </div>

      <div className="qc-auth-panel">
        <div className="qc-auth-mobile-logo">
          <Logo size={44} />
          <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 18 }}>QuantumChat</span>
        </div>

        <div className="qc-auth-portal-bar">
          <button
            type="button"
            className={`qc-auth-portal-link ${mode === 'login' ? 'qc-auth-portal-active' : ''}`}
            onClick={() => switchMode('login')}
          >
            👤 User Sign In
          </button>
          <button
            type="button"
            className={`qc-auth-portal-link ${mode === 'register' ? 'qc-auth-portal-active' : ''}`}
            onClick={() => switchMode('register')}
          >
            ✨ Create Account
          </button>
          <a href={adminLoginUrl} className="qc-auth-portal-link">
            🛡️ Admin Login
          </a>
        </div>

        <div className="qc-auth-mode-tabs">
          <button
            type="button"
            className={`qc-auth-mode-tab ${mode === 'login' ? 'qc-auth-mode-tab-active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`qc-auth-mode-tab ${mode === 'register' ? 'qc-auth-mode-tab-active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Create Account
          </button>
        </div>

        <h1 className="qc-auth-form-title">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="qc-auth-form-sub">
          {mode === 'login'
            ? 'Enter your credentials to access your workspace.'
            : 'Fill in your details to join QuantumChat.'}
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div className="qc-auth-error">{error}</div>}

          {mode === 'register' && (
            <div style={{ marginBottom: 16 }}>
              <label className="qc-auth-label">Full name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="qc-auth-input"
                required
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label className="qc-auth-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter mail id"
              className="qc-auth-input"
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="qc-auth-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="qc-auth-input"
              minLength={6}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="qc-auth-submit">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="qc-auth-footer">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button type="button" className="qc-auth-link-btn" onClick={() => switchMode('register')}>
                Create account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="qc-auth-link-btn" onClick={() => switchMode('login')}>
                Sign in
              </button>
            </>
          )}
          <br />
          <span style={{ marginTop: 8, display: 'inline-block' }}>
            Administrator? <a href={adminLoginUrl}>Open Control Center</a>
          </span>
        </p>
      </div>
    </div>
  );
}
