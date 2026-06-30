import { useEffect, useState } from 'react';
import { api, type Message } from '../api';

export function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getMessages().then((r) => setMessages(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await api.deleteMessage(id);
    load();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="qc-page-title">Message Moderation</h1>
        <p className="qc-page-subtitle">Review and moderate platform messages</p>
      </div>

      <div className="qc-admin-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="qc-admin-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Content</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-slate-500 py-10">No messages yet</td>
                </tr>
              ) : (
                messages.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <p className="font-medium text-white">{m.senderId?.displayName}</p>
                      <p className="text-xs text-slate-500">{m.senderId?.email}</p>
                    </td>
                    <td className="max-w-md truncate text-slate-300">
                      {m.isDeleted ? <span className="italic text-slate-500">Deleted</span> : m.content}
                    </td>
                    <td className="text-slate-400">{new Date(m.createdAt).toLocaleString()}</td>
                    <td>
                      {!m.isDeleted && (
                        <button type="button" onClick={() => handleDelete(m._id)} className="text-red-400 text-sm font-medium hover:underline">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
