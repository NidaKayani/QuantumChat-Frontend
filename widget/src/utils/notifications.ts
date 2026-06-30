export function requestNotificationPermission(): void {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function showNotification(title: string, body: string, onClick?: () => void): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (document.hasFocus()) return;

  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    tag: 'quantum-chat',
  });

  notification.onclick = () => {
    window.focus();
    onClick?.();
    notification.close();
  };
}
