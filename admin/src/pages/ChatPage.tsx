import { useCallback, useEffect, useRef, useState } from 'react';
import { api, type ChatConversation, type ChatMessage, type ChatUser } from '../api';
import { AdminSocket } from '../socket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getOtherParticipant(conv: ChatConversation, myId: string) {
  return conv.participants.find((p) => p._id !== myId);
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatPage() {
  const [me, setMe] = useState<ChatUser | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const socketRef = useRef<AdminSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef<string | null>(null);

  activeIdRef.current = activeId;

  const loadConversations = useCallback(async () => {
    const result = await api.getConversations();
    setConversations(result.data);
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    const result = await api.getConversationMessages(conversationId);
    setMessages(result.data);
    api.markConversationRead(conversationId).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await api.getMe();
        if (!active) return;
        setMe(user);

        const token = localStorage.getItem('qc_admin_token');
        if (token) {
          const socket = new AdminSocket();
          socketRef.current = socket;
          socket.connect(API_URL, token, {
            onMessage: (msg) => {
              if (msg.conversationId === activeIdRef.current) {
                setMessages((prev) => {
                  if (prev.some((m) => m._id === msg._id)) return prev;
                  return [...prev, msg as unknown as ChatMessage];
                });
              }
              loadConversations();
            },
            onConversationUpdated: () => loadConversations(),
          });
        }

        await loadConversations();
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      socketRef.current?.disconnect();
    };
  }, [loadConversations]);

  useEffect(() => {
    if (!activeId) return;
    const prev = activeIdRef.current;
    if (prev && prev !== activeId) socketRef.current?.leaveConversation(prev);
    socketRef.current?.joinConversation(activeId);
    loadMessages(activeId);
  }, [activeId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeId || sending) return;
    setSending(true);
    const content = input.trim();
    setInput('');
    try {
      await socketRef.current?.sendMessage({ conversationId: activeId, content });
      await loadMessages(activeId);
      await loadConversations();
    } catch {
      try {
        await api.sendMessage(activeId, content);
        await loadMessages(activeId);
        await loadConversations();
      } catch (err) {
        console.error(err);
        setInput(content);
      }
    } finally {
      setSending(false);
    }
  };

  const handleSearchUsers = async (q: string) => {
    setSearch(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const result = await api.searchUsers(q);
      setSearchResults(result.data.filter((u) => u._id !== me?._id));
    } catch {
      setSearchResults([]);
    }
  };

  const startChat = async (userId: string) => {
    try {
      const conv = await api.createConversation(userId);
      setShowNewChat(false);
      setSearch('');
      setSearchResults([]);
      await loadConversations();
      setActiveId(conv._id);
    } catch (err) {
      console.error(err);
    }
  };

  const activeConv = conversations.find((c) => c._id === activeId);
  const other = activeConv && me ? getOtherParticipant(activeConv, me._id) : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="qc-page-title">Live Chat</h1>
        <p className="qc-page-subtitle">Message users directly from the admin panel</p>
      </div>

      <div className="qc-admin-card overflow-hidden flex" style={{ height: 'calc(100vh - 180px)', minHeight: 480 }}>
        {/* Conversation list */}
        <div className="w-80 border-r border-white/10 flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10">
            <button type="button" onClick={() => setShowNewChat(true)} className="qc-admin-btn w-full text-sm">
              + New Conversation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-slate-500 text-sm text-center p-6">No conversations yet</p>
            ) : (
              conversations.map((conv) => {
                const peer = me ? getOtherParticipant(conv, me._id) : null;
                const unread = me ? (conv.unreadCounts?.[me._id] || 0) : 0;
                return (
                  <button
                    key={conv._id}
                    type="button"
                    onClick={() => setActiveId(conv._id)}
                    className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors ${
                      activeId === conv._id ? 'bg-brand/15 border-l-2 border-l-brand' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-white text-sm truncate">{peer?.displayName || 'Unknown'}</p>
                      {unread > 0 && (
                        <span className="bg-brand text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">{unread}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeId && other ? (
            <>
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-bold text-sm">
                  {other.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{other.displayName}</p>
                  <p className="text-xs text-slate-400">{other.email}</p>
                </div>
                <span className={`ml-auto text-xs px-2 py-1 rounded-full ${other.isOnline ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                  {other.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {messages.map((msg) => {
                  const senderId = typeof msg.senderId === 'string' ? msg.senderId : msg.senderId._id;
                  const isMine = senderId === me?._id;
                  return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-brand text-white rounded-br-md'
                            : 'bg-navy-800 text-slate-200 rounded-bl-md border border-white/10'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-200' : 'text-slate-500'}`}>
                          {formatTime(msg.createdAt)}
                          {msg.isEdited && ' · edited'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="qc-admin-input flex-1"
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !input.trim()} className="qc-admin-btn px-6">
                  {sending ? '...' : 'Send'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <p className="text-lg font-medium text-slate-400 mb-1">Select a conversation</p>
                <p className="text-sm">Or start a new chat with a user</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New chat modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowNewChat(false)}>
          <div className="qc-admin-card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Start New Chat</h2>
            <input
              value={search}
              onChange={(e) => handleSearchUsers(e.target.value)}
              placeholder="Search by name or email..."
              className="qc-admin-input mb-4"
              autoFocus
            />
            <div className="max-h-60 overflow-y-auto space-y-1">
              {searchResults.length === 0 && search.length >= 2 && (
                <p className="text-slate-500 text-sm text-center py-4">No users found</p>
              )}
              {searchResults.map((u) => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => startChat(u._id)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <p className="text-white text-sm font-medium">{u.displayName}</p>
                  <p className="text-slate-500 text-xs">{u.email}</p>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setShowNewChat(false)} className="qc-admin-btn-ghost w-full mt-4">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
