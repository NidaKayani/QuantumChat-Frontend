import { useState, useEffect, type CSSProperties } from 'react';
import { useWidget } from '../context/WidgetContext';
import { ConversationList } from './conversations/ConversationList';
import { MessageList } from './messages/MessageList';
import { MessageInput } from './messages/MessageInput';
import { Avatar } from './ui/Avatar';
import { getOtherParticipant, normalizeId } from '../utils/helpers';
import { theme } from '../theme';
import type { IMessage, IConversation } from '@quantum-chat/shared';

const panelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: 0,
  background: theme.colors.navy900,
  overflow: 'hidden',
};

export function ChatWindow() {
  const { state, dispatch, api, socket } = useWidget();
  const [replyTo, setReplyTo] = useState<IMessage | null>(null);
  const convId = state.activeConversationId;

  useEffect(() => {
    if (!convId || !socket) return;
    socket.joinConversation(convId);

    const loadMessages = async () => {
      if (state.messages[convId]) return;
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const result = await api.getMessages(convId);
        dispatch({
          type: 'SET_MESSAGES',
          payload: { conversationId: convId, messages: result.data, hasMore: result.hasMore },
        });
        socket.markRead(convId);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadMessages();
    return () => { socket.leaveConversation(convId); };
  }, [convId, socket, api, dispatch, state.messages]);

  const activeConv = state.conversations.find((c) => c._id === convId) as
    | (IConversation & { participants: { _id: unknown; displayName: string; avatarUrl?: string }[] })
    | undefined;
  const other = activeConv && state.user ? getOtherParticipant(activeConv, state.user._id) : null;
  const otherId = other ? normalizeId(other._id) : '';

  return (
    <div style={panelStyle}>
      {!convId && (
        <div style={{ ...panelStyle, width: '100%' }}>
          <ConversationList />
        </div>
      )}

      {convId && (
        <div style={panelStyle}>
          <div
            className="qc-header-gradient"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: null })}
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                border: 'none',
                color: theme.colors.accentLight,
                cursor: 'pointer',
                fontSize: 18,
                width: 32,
                height: 32,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ←
            </button>
            {other && (
              <>
                <Avatar name={other.displayName} src={other.avatarUrl} size="sm" isOnline={state.onlineUsers[otherId]} />
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{other.displayName}</h3>
                  <p style={{ margin: 0, fontSize: 12, color: state.onlineUsers[otherId] ? theme.colors.success : theme.colors.textMuted }}>
                    {state.onlineUsers[otherId] ? '● Active now' : 'Offline'}
                  </p>
                </div>
              </>
            )}
          </div>

          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {state.isLoading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    border: `2px solid ${theme.colors.accent}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              </div>
            ) : (
              <MessageList onReply={setReplyTo} />
            )}
            <MessageInput replyTo={replyTo} onClearReply={() => setReplyTo(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
