import type { IUser } from '@quantum-chat/shared';

const SESSION_KEY = 'qc_user_session';

export interface UserSession {
  token: string;
  user: IUser;
}

export function loadSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export function saveSession(session: UserSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  const apiKey = import.meta.env.VITE_API_KEY || '';
  sessionStorage.removeItem(`qc_site_${apiKey}`);
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith('qc_token_')) sessionStorage.removeItem(key);
  });
}
