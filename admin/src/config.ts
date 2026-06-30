export const WIDGET_URL = import.meta.env.VITE_WIDGET_URL || 'http://localhost:5173';

export function getWidgetAuthUrl(mode: 'login' | 'signup' = 'login') {
  const url = new URL(WIDGET_URL);
  if (mode === 'signup') url.searchParams.set('signup', '1');
  return url.toString();
}
