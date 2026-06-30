import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@quantum-chat/shared';
import type { IMessage } from '@quantum-chat/shared';

export type SocketHandlers = {
  onMessage?: (message: IMessage) => void;
  onMessageEdited?: (message: IMessage) => void;
  onMessageDeleted?: (data: { messageId: string; conversationId: string }) => void;
  onConversationUpdated?: (data: { conversationId: string }) => void;
};

export class AdminSocket {
  private socket: Socket | null = null;

  connect(baseUrl: string, token: string, handlers: SocketHandlers) {
    this.socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    this.socket.on(SOCKET_EVENTS.MESSAGE_NEW, (msg: IMessage) => handlers.onMessage?.(msg));
    this.socket.on(SOCKET_EVENTS.MESSAGE_EDITED, (msg: IMessage) => handlers.onMessageEdited?.(msg));
    this.socket.on(SOCKET_EVENTS.MESSAGE_DELETED, (data: { messageId: string; conversationId: string }) => handlers.onMessageDeleted?.(data));
    this.socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, (data: { conversationId: string }) => handlers.onConversationUpdated?.(data));

    return this.socket;
  }

  joinConversation(conversationId: string) {
    this.socket?.emit(SOCKET_EVENTS.CONVERSATION_JOIN, conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit(SOCKET_EVENTS.CONVERSATION_LEAVE, conversationId);
  }

  sendMessage(payload: { conversationId: string; content: string }) {
    return new Promise<IMessage>((resolve, reject) => {
      this.socket?.emit(SOCKET_EVENTS.MESSAGE_SEND, payload, (res: { success: boolean; data?: IMessage; error?: string }) => {
        if (res.success && res.data) resolve(res.data);
        else reject(new Error(res.error || 'Send failed'));
      });
    });
  }

  markRead(conversationId: string) {
    this.socket?.emit(SOCKET_EVENTS.MESSAGE_READ, { conversationId });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}
