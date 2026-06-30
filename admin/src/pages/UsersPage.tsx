import { useEffect, useState } from 'react';
import { api, type User } from '../api';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getUsers().then((r) => {
      setUsers(r.data);
      setTotal(r.total);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleBlock = async (user: User) => {
    await api.blockUser(user._id, !user.isBlocked);
    load();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="qc-page-title">Users</h1>
        <p className="qc-page-subtitle">
          {total > 0 ? `${total} total registered users` : 'Manage registered users'}
        </p>
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
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-500 py-10">No users found</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td className="font-medium text-white">{u.displayName}</td>
                    <td className="text-slate-400">{u.email}</td>
                    <td><span className="text-xs bg-brand/15 text-brand-light px-2.5 py-1 rounded-lg border border-brand/20">{u.role}</span></td>
                    <td>
                      <span className={`text-xs px-2.5 py-1 rounded-full ${u.isOnline ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                        {u.isOnline ? 'Online' : 'Offline'}
                      </span>
                      {u.isBlocked && <span className="ml-2 text-xs bg-red-500/15 text-red-400 px-2.5 py-1 rounded-full border border-red-500/30">Blocked</span>}
                    </td>
                    <td>
                      <button type="button" onClick={() => toggleBlock(u)} className={`text-sm font-medium hover:underline ${u.isBlocked ? 'text-emerald-400' : 'text-red-400'}`}>
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
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
