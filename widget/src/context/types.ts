import type { WidgetConfig, WebsiteBranding, WebsiteSettings, IUser, IConversation, IMessage } from '@quantum-chat/shared';
import type { ResolvedTheme } from '../theme';

export interface ChatState {
  isOpen: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: IUser | null;
  branding: Partial<WebsiteBranding>;
  settings: WebsiteSettings;
  websiteName: string;
  conversations: IConversation[];
  activeConversationId: string | null;
  messages: Record<string, IMessage[]>;
  unreadCount: number;
  typingUsers: Record<string, string[]>;
  onlineUsers: Record<string, boolean>;
  searchQuery: string;
  isLoading: boolean;
  hasMoreMessages: Record<string, boolean>;
  messagePages: Record<string, number>;
}

export type ChatAction =
  | { type: 'SET_OPEN'; payload: boolean }
  | { type: 'SET_AUTH'; payload: { token: string; user: IUser; branding: Partial<WebsiteBranding>; settings: WebsiteSettings; websiteName: string } }
  | { type: 'UPDATE_USER'; payload: { token: string; user: IUser; branding: Partial<WebsiteBranding>; settings: WebsiteSettings; websiteName: string } }
  | { type: 'SET_CONVERSATIONS'; payload: IConversation[] }
  | { type: 'APPEND_CONVERSATIONS'; payload: IConversation[] }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'SET_MESSAGES'; payload: { conversationId: string; messages: IMessage[]; hasMore: boolean } }
  | { type: 'PREPEND_MESSAGES'; payload: { conversationId: string; messages: IMessage[]; hasMore: boolean } }
  | { type: 'ADD_MESSAGE'; payload: IMessage }
  | { type: 'UPDATE_MESSAGE'; payload: IMessage }
  | { type: 'DELETE_MESSAGE'; payload: { conversationId: string; messageId: string } }
  | { type: 'SET_UNREAD'; payload: number }
  | { type: 'SET_TYPING'; payload: { conversationId: string; userId: string; isTyping: boolean } }
  | { type: 'SET_PRESENCE'; payload: { userId: string; isOnline: boolean } }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INCREMENT_PAGE'; payload: string };

export const initialState: ChatState = {
  isOpen: false,
  isAuthenticated: false,
  token: null,
  user: null,
  branding: {},
  settings: {
    allowFileUploads: true,
    allowReactions: true,
    allowEditing: true,
    maxFileSizeMb: 25,
    notificationSound: true,
  },
  websiteName: 'Quantum Chat',
  conversations: [],
  activeConversationId: null,
  messages: {},
  unreadCount: 0,
  typingUsers: {},
  onlineUsers: {},
  searchQuery: '',
  isLoading: false,
  hasMoreMessages: {},
  messagePages: {},
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_OPEN':
      return { ...state, isOpen: action.payload };
    case 'SET_AUTH':
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
        branding: action.payload.branding,
        settings: action.payload.settings,
        websiteName: action.payload.websiteName,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        branding: action.payload.branding,
        settings: action.payload.settings,
        websiteName: action.payload.websiteName,
      };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'APPEND_CONVERSATIONS':
      return { ...state, conversations: [...state.conversations, ...action.payload] };
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: { ...state.messages, [action.payload.conversationId]: action.payload.messages },
        hasMoreMessages: { ...state.hasMoreMessages, [action.payload.conversationId]: action.payload.hasMore },
        messagePages: { ...state.messagePages, [action.payload.conversationId]: 1 },
      };
    case 'PREPEND_MESSAGES': {
      const existing = state.messages[action.payload.conversationId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: [...action.payload.messages, ...existing],
        },
        hasMoreMessages: { ...state.hasMoreMessages, [action.payload.conversationId]: action.payload.hasMore },
      };
    }
    case 'ADD_MESSAGE': {
      const convId = action.payload.conversationId;
      const existing = state.messages[convId] || [];
      if (existing.some((m) => m._id === action.payload._id)) return state;
      return {
        ...state,
        messages: { ...state.messages, [convId]: [...existing, action.payload] },
      };
    }
    case 'UPDATE_MESSAGE': {
      const convId = action.payload.conversationId;
      const msgs = (state.messages[convId] || []).map((m) =>
        m._id === action.payload._id ? action.payload : m
      );
      return { ...state, messages: { ...state.messages, [convId]: msgs } };
    }
    case 'DELETE_MESSAGE': {
      const msgs = (state.messages[action.payload.conversationId] || []).map((m) =>
        m._id === action.payload.messageId ? { ...m, isDeleted: true, content: '' } : m
      );
      return {
        ...state,
        messages: { ...state.messages, [action.payload.conversationId]: msgs },
      };
    }
    case 'SET_UNREAD':
      return { ...state, unreadCount: action.payload };
    case 'SET_TYPING': {
      const { conversationId, userId, isTyping } = action.payload;
      const current = state.typingUsers[conversationId] || [];
      const updated = isTyping
        ? [...new Set([...current, userId])]
        : current.filter((id) => id !== userId);
      return {
        ...state,
        typingUsers: { ...state.typingUsers, [conversationId]: updated },
      };
    }
    case 'SET_PRESENCE':
      return {
        ...state,
        onlineUsers: { ...state.onlineUsers, [action.payload.userId]: action.payload.isOnline },
      };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'INCREMENT_PAGE':
      return {
        ...state,
        messagePages: {
          ...state.messagePages,
          [action.payload]: (state.messagePages[action.payload] || 1) + 1,
        },
      };
    default:
      return state;
  }
}

export interface WidgetContextValue {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  config: WidgetConfig;
  api: import('../api').ApiClient;
  socket: import('../socket').SocketClient | null;
  theme: ResolvedTheme;
}
