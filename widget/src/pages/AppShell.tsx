import { useRef, useState } from 'react';
import { QuantumChatWidget } from '../QuantumChatWidget';
import { Logo } from '../components/ui/Logo';
import { Avatar } from '../components/ui/Avatar';
import { theme } from '../theme';
import { getAdminUrl, updateProfile, uploadAvatar } from '../utils/authApi';
import { clearSession, saveSession, type UserSession } from '../utils/authSession';
import type { WidgetConfig } from '@quantum-chat/shared';

interface AppShellProps {
  session: UserSession;
  onLogout: () => void;
  onSessionUpdate: (session: UserSession) => void;
}

export function AppShell({ session, onLogout, onSessionUpdate }: AppShellProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const widgetConfig: WidgetConfig = {
    websiteId: import.meta.env.VITE_WEBSITE_ID || '',
    apiKey: import.meta.env.VITE_API_KEY || '',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    token: session.token,
    brandName: 'QuantumChat',
    theme: { welcomeMessage: 'Secure professional messaging' },
  };

  const handleLogout = () => {
    clearSession();
    onLogout();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const avatarUrl = await uploadAvatar(session.token, file);
      const user = await updateProfile(session.token, { avatarUrl });
      const updated = { ...session, user };
      saveSession(updated);
      onSessionUpdate(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update photo');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(160deg, ${theme.colors.navy950} 0%, ${theme.colors.navy900} 100%)`,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }}
      />

      <header
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: `1px solid ${theme.colors.border}`,
          background: 'rgba(10, 22, 40, 0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={40} style={{ boxShadow: `0 4px 16px ${theme.colors.accentGlow}` }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: theme.colors.text, letterSpacing: '-0.02em' }}>
            QuantumChat
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a
            href={getAdminUrl()}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              color: theme.colors.accentLight,
              textDecoration: 'none',
              border: `1px solid ${theme.colors.border}`,
              background: 'rgba(59, 130, 246, 0.1)',
              transition: 'background 0.2s',
            }}
          >
            Admin Panel
          </a>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            title="Change profile photo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 14px 6px 6px',
              borderRadius: 24,
              border: `1px solid ${theme.colors.border}`,
              background: 'rgba(255,255,255,0.05)',
              cursor: uploading ? 'wait' : 'pointer',
            }}
          >
            <Avatar name={session.user.displayName} src={session.user.avatarUrl} size="sm" isOnline />
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.colors.text }}>{session.user.displayName}</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />

          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              color: theme.colors.textSecondary,
              background: 'rgba(255,255,255,0.06)',
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 73px)',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <Logo size={88} style={{ marginBottom: 24, boxShadow: `0 12px 40px ${theme.colors.accentGlow}` }} />
        <h1 style={{ margin: '0 0 12px', fontSize: 36, fontWeight: 800, color: theme.colors.text, letterSpacing: '-0.03em' }}>
          Welcome, {session.user.displayName.split(' ')[0]}
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: 16, color: theme.colors.textSecondary, maxWidth: 420, lineHeight: 1.6 }}>
          Your secure messaging workspace is ready. Open the chat to connect with your team.
        </p>
        <p style={{ fontSize: 13, color: theme.colors.textMuted }}>
          Click <strong style={{ color: theme.colors.accentLight }}>Messages</strong> in the bottom-right corner to start
        </p>
      </main>

      <QuantumChatWidget config={widgetConfig} />
    </div>
  );
}
