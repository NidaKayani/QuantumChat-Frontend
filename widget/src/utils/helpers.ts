import { format, isToday, isYesterday } from 'date-fns';

export function formatMessageTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function normalizeId(id: unknown): string {
  if (id == null) return '';
  if (typeof id === 'string') return id;
  if (typeof id === 'object' && id !== null && '_id' in id) {
    return normalizeId((id as { _id: unknown })._id);
  }
  if (typeof (id as { toString?: () => string }).toString === 'function') {
    return (id as { toString: () => string }).toString();
  }
  return String(id);
}

export function getUnreadForUser(unreadCounts: unknown, userId: string): number {
  if (!unreadCounts || typeof unreadCounts !== 'object') return 0;
  const key = normalizeId(userId);
  return Number((unreadCounts as Record<string, number>)[key]) || 0;
}

export function getOtherParticipant(
  conversation: {
    participants: {
      _id: unknown;
      displayName: string;
      avatarUrl?: string;
      isOnline?: boolean;
    }[];
  },
  currentUserId: string
) {
  const uid = normalizeId(currentUserId);
  return conversation.participants.find((p) => normalizeId(p._id) !== uid);
}
