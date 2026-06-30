const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class AdminApi {
  private token: string | null = localStorage.getItem('qc_admin_token');

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('qc_admin_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('qc_admin_token');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const res = await fetch(`${API_URL}/api/v1${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data.data ?? data;
  }

  login(email: string, password: string) {
    return this.request<{ user: unknown; token: string }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  getMe() {
    return this.request<ChatUser>('/auth/me');
  }

  getWebsites(page = 1) {
    return this.request<{ data: Website[]; total: number }>(`/admin/websites?page=${page}`);
  }

  createWebsite(data: { name: string; domain: string }) {
    return this.request<Website>('/admin/websites', { method: 'POST', body: JSON.stringify(data) });
  }

  updateWebsite(id: string, data: Partial<Website>) {
    return this.request<Website>(`/admin/websites/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  verifyWebsite(id: string) {
    return this.request(`/admin/websites/${id}/verify`, { method: 'POST' });
  }

  regenerateKey(id: string) {
    return this.request<Website>(`/admin/websites/${id}/regenerate-key`, { method: 'POST' });
  }

  getAnalytics(id: string) {
    return this.request<Analytics>(`/admin/websites/${id}/analytics`);
  }

  getUsers(websiteId?: string, page = 1) {
    const q = websiteId ? `?websiteId=${websiteId}&page=${page}` : `?page=${page}`;
    return this.request<{ data: User[]; total: number }>(`/admin/users${q}`);
  }

  blockUser(id: string, blocked: boolean) {
    return this.request(`/admin/users/${id}/block`, { method: 'PATCH', body: JSON.stringify({ blocked }) });
  }

  getMessages(websiteId?: string, page = 1) {
    const q = websiteId ? `?websiteId=${websiteId}&page=${page}` : `?page=${page}`;
    return this.request<{ data: Message[]; total: number }>(`/admin/messages${q}`);
  }

  deleteMessage(id: string) {
    return this.request(`/admin/messages/${id}`, { method: 'DELETE' });
  }

  // Chat APIs (admin participates as a user)
  getConversations(page = 1) {
    return this.request<{ data: ChatConversation[]; total: number }>(`/conversations?page=${page}`);
  }

  createConversation(participantId: string) {
    return this.request<ChatConversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    });
  }

  getConversationMessages(conversationId: string, page = 1) {
    return this.request<{ data: ChatMessage[]; total: number }>(
      `/conversations/${conversationId}/messages?page=${page}`
    );
  }

  sendMessage(conversationId: string, content: string) {
    return this.request<ChatMessage>('/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId, content }),
    });
  }

  markConversationRead(conversationId: string) {
    return this.request(`/conversations/${conversationId}/read`, { method: 'POST', body: '{}' });
  }

  searchUsers(q: string, page = 1) {
    return this.request<{ data: ChatUser[]; total: number }>(
      `/users/search?q=${encodeURIComponent(q)}&page=${page}`
    );
  }
}

import type { WebsiteBranding, WebsiteSettings } from '@quantum-chat/shared';

export interface Website {
  _id: string;
  tenantId: string;
  name: string;
  domain: string;
  apiKey: string;
  isVerified: boolean;
  isActive: boolean;
  branding: Partial<WebsiteBranding>;
  settings: Partial<WebsiteSettings>;
}

export interface User {
  _id: string;
  displayName: string;
  email: string;
  role: string;
  isBlocked: boolean;
  isOnline: boolean;
  websiteId: string;
}

export interface ChatUser {
  _id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  isOnline: boolean;
  role: string;
}

export interface ChatConversation {
  _id: string;
  participants: ChatUser[];
  lastMessage?: { content: string; createdAt: string };
  lastMessageAt?: string;
  unreadCounts?: Record<string, number>;
}

export interface ChatMessage {
  _id: string;
  content: string;
  senderId: ChatUser;
  createdAt: string;
  isEdited: boolean;
}

export interface Message {
  _id: string;
  content: string;
  isDeleted: boolean;
  senderId: { displayName: string; email: string };
  createdAt: string;
}

export interface ChartDay {
  date: string;
  label: string;
  count: number;
}

export interface Analytics {
  users: number;
  conversations: number;
  messages: number;
  onlineUsers: number;
  recentMessages: number;
  charts: {
    messagesByDay: ChartDay[];
    signupsByDay: ChartDay[];
    usersByRole: { role: string; count: number }[];
    activity: { name: string; value: number }[];
  };
}

export const api = new AdminApi();
