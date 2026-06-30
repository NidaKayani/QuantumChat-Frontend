import { useState } from 'react';
import { api } from '../api';
import { getWidgetAuthUrl } from '../config';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await api.login(email, password);
      api.setToken(token);
      onLogin();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-qc-bg">
      <div className="qc-mesh-bg" aria-hidden />

      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-qc-border bg-qc-surface/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="QuantumChat" width={36} height={36} className="rounded-lg" />
          <span className="font-bold text-qc-text text-sm">QuantumChat</span>
        </div>
        <ThemeSwitcher compact />
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Portal switcher */}
          <div className="qc-portal-switch mb-8">
            <a href={getWidgetAuthUrl('login')} className="qc-portal-tab">
              <span className="qc-portal-icon">👤</span>
              <span>User Sign In</span>
            </a>
            <a href={getWidgetAuthUrl('signup')} className="qc-portal-tab">
              <span className="qc-portal-icon">✨</span>
              <span>Create Account</span>
            </a>
            <span className="qc-portal-tab qc-portal-tab-active" aria-current="page">
              <span className="qc-portal-icon">🛡️</span>
              <span>Admin Login</span>
            </span>
          </div>

          {/* Admin card */}
          <div className="qc-admin-login-card">
            <div className="qc-admin-login-badge">Control Center</div>
            <h1 className="text-2xl font-bold text-qc-text mt-4 mb-1">Administrator access</h1>
            <p className="text-qc-muted text-sm mb-8">
              Sign in with your admin credentials to manage the platform.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className="rounded-xl p-3 text-sm border"
                  style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: 'var(--qc-danger)' }}
                >
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-qc-text mb-1.5">Admin email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="qc-admin-input"
                  placeholder="Enter admin email"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-qc-text mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="qc-admin-input"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="qc-admin-btn w-full py-3">
                {loading ? 'Signing in...' : 'Enter Control Center'}
              </button>
            </form>

            <p className="text-center text-sm text-qc-muted mt-8 pt-6 border-t border-qc-border">
              Not an admin?{' '}
              <a href={getWidgetAuthUrl('login')} className="text-qc-accent font-semibold hover:underline">
                User sign in
              </a>
              {' · '}
              <a href={getWidgetAuthUrl('signup')} className="text-qc-accent font-semibold hover:underline">
                Create account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
