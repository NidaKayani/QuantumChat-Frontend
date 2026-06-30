import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@quantum-chat/shared';
import type { IMessage } from '@quantum-chat/shared';

export type SocketHandlers = {
  onMessage?: (message: IMessage) => void;
  onMessageEdited?: (message: IMessage) => void;
  onMessageDeleted?: (data: { messageId: string; conversationId: string }) => void;
  onMessageReacted?: (message: IMessage) => void;
  onTyping?: (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
  onPresence?: (data: { userId: string; isOnline: boolean; lastSeenAt?: Date }) => void;
  onUnreadCount?: (count: number) => void;
  onConversationUpdated?: (data: { conversationId: string }) => void;
};

export class SocketClient {
  private socket: Socket | null = null;

  connect(baseUrl: string, token: string, handlers: SocketHandlers) {
    this.socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    this.socket.on(SOCKET_EVENTS.MESSAGE_NEW, (msg: IMessage) => handlers.onMessage?.(msg));
    this.socket.on(SOCKET_EVENTS.MESSAGE_EDITED, (msg: IMessage) => handlers.onMessageEdited?.(msg));
    this.socket.on(SOCKET_EVENTS.MESSAGE_DELETED, (data: { messageId: string; conversationId: string }) => handlers.onMessageDeleted?.(data));
    this.socket.on(SOCKET_EVENTS.MESSAGE_REACTED, (msg: IMessage) => handlers.onMessageReacted?.(msg));
    this.socket.on(SOCKET_EVENTS.TYPING_UPDATE, (data: { conversationId: string; userId: string; isTyping: boolean }) => handlers.onTyping?.(data));
    this.socket.on(SOCKET_EVENTS.PRESENCE_UPDATE, (data: { userId: string; isOnline: boolean; lastSeenAt?: Date }) => handlers.onPresence?.(data));
    this.socket.on(SOCKET_EVENTS.UNREAD_COUNT, (data: { count: number }) => handlers.onUnreadCount?.(data.count));
    this.socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, (data: { conversationId: string }) => handlers.onConversationUpdated?.(data));

    return this.socket;
  }

  joinConversation(conversationId: string) {
    this.socket?.emit(SOCKET_EVENTS.CONVERSATION_JOIN, conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit(SOCKET_EVENTS.CONVERSATION_LEAVE, conversationId);
  }

  sendMessage(payload: {
    conversationId: string;
    content: string;
    replyTo?: string;
    attachmentIds?: string[];
  }) {
    return new Promise((resolve, reject) => {
      this.socket?.emit(SOCKET_EVENTS.MESSAGE_SEND, payload, (res: { success: boolean; data?: IMessage; error?: string }) => {
        if (res.success) resolve(res.data);
        else reject(new Error(res.error));
      });
    });
  }

  startTyping(conversationId: string) {
    this.socket?.emit(SOCKET_EVENTS.TYPING_START, conversationId);
  }

  stopTyping(conversationId: string) {
    this.socket?.emit(SOCKET_EVENTS.TYPING_STOP, conversationId);
  }

  markRead(conversationId: string, messageIds?: string[]) {
    this.socket?.emit(SOCKET_EVENTS.MESSAGE_READ, { conversationId, messageIds });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}
