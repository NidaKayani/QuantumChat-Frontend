import { useEffect, useState } from 'react';
import { WIDGET_POSITIONS } from '@quantum-chat/shared';
import type { WebsiteBranding, WebsiteSettings } from '@quantum-chat/shared';
import { api, type Website } from '../api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const defaultBranding = (): WebsiteBranding => ({
  primaryColor: '#0A1628',
  secondaryColor: '#1A365D',
  accentColor: '#3B82F6',
  welcomeMessage: 'Welcome to Quantum Chat!',
  position: WIDGET_POSITIONS.BOTTOM_RIGHT,
  fontFamily: 'Inter, system-ui, sans-serif',
});

const defaultSettings = (): WebsiteSettings => ({
  allowFileUploads: true,
  allowReactions: true,
  allowEditing: true,
  maxFileSizeMb: 25,
  notificationSound: true,
});

function EmbedSnippet({ website }: { website: Website }) {
  const snippet = `<!-- Quantum Chat -->
<link rel="stylesheet" href="${API_URL}/widget/quantum-chat-widget.css" />
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="${API_URL}/sdk/quantum-chat-sdk.umd.js"></script>
<script>
  createQuantumChat({
    websiteId: '${website._id}',
    apiKey: '${website.apiKey}',
    apiUrl: '${API_URL}',
    user: { email: 'user@example.com', displayName: 'User Name' },
    autoOpen: false
  });
</script>`;

  const npmSnippet = `import { init } from '@quantum-chat/widget';
import '@quantum-chat/widget/dist/quantum-chat-widget.css';

init({
  websiteId: '${website._id}',
  apiKey: '${website.apiKey}',
  apiUrl: '${API_URL}',
  user: { email: 'user@example.com', displayName: 'User Name' },
  // Or pass an existing QC JWT from your backend:
  // token: 'eyJhbGciOiJIUzI1NiIs...',
});`;

  return (
    <div className="space-y-4 pt-4 border-t border-white/10">
      <div>
        <p className="text-xs font-semibold text-slate-400 mb-2">Script tag</p>
        <pre className="text-xs bg-navy-950/80 text-slate-300 p-4 rounded-xl overflow-x-auto border border-white/10">{snippet}</pre>
        <button type="button" onClick={() => navigator.clipboard.writeText(snippet)} className="text-xs text-brand-light mt-2 hover:underline">Copy script tag</button>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 mb-2">npm package</p>
        <pre className="text-xs bg-navy-950/80 text-slate-300 p-4 rounded-xl overflow-x-auto border border-white/10">{npmSnippet}</pre>
        <button type="button" onClick={() => navigator.clipboard.writeText(npmSnippet)} className="text-xs text-brand-light mt-2 hover:underline">Copy npm snippet</button>
      </div>
    </div>
  );
}

export function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', domain: '' });
  const [editing, setEditing] = useState<Website | null>(null);

  const load = () => api.getWebsites().then((r) => setWebsites(r.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createWebsite(form);
    setForm({ name: '', domain: '' });
    setShowForm(false);
    load();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await api.updateWebsite(editing._id, editing);
    setEditing(null);
    load();
  };

  const updateBranding = (key: keyof WebsiteBranding, value: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      branding: { ...defaultBranding(), ...editing.branding, [key]: value },
    });
  };

  const updateSettings = (key: keyof WebsiteSettings, value: boolean | number) => {
    if (!editing) return;
    setEditing({
      ...editing,
      settings: { ...defaultSettings(), ...editing.settings, [key]: value },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="qc-page-title">Websites</h1>
          <p className="qc-page-subtitle">Manage tenant websites and widget branding</p>
        </div>
        <button type="button" onClick={() => setShowForm(true)} className="qc-admin-btn">
          Add Website
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="qc-admin-card p-6 mb-6 space-y-4">
          <input placeholder="Website Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="qc-admin-input" required />
          <input placeholder="Domain (e.g. example.com)" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} className="qc-admin-input" required />
          <div className="flex gap-2">
            <button type="submit" className="qc-admin-btn">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="qc-admin-btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      <div className="qc-admin-card overflow-hidden">
        <table className="qc-admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Domain</th>
              <th>Tenant ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {websites.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-slate-500 py-10">No websites yet</td></tr>
            ) : websites.map((w) => (
              <tr key={w._id}>
                <td className="font-medium text-white">{w.name}</td>
                <td className="text-slate-400">{w.domain}</td>
                <td className="text-slate-500 font-mono text-xs">{w.tenantId}</td>
                <td>
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${w.isVerified ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>
                    {w.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="space-x-3">
                  <button type="button" onClick={() => setEditing({ ...w, branding: { ...defaultBranding(), ...w.branding }, settings: { ...defaultSettings(), ...w.settings } })} className="text-brand-light text-sm font-medium hover:underline">Edit</button>
                  {!w.isVerified && (
                    <button type="button" onClick={() => api.verifyWebsite(w._id).then(load)} className="text-emerald-400 text-sm font-medium hover:underline">Verify</button>
                  )}
                  <button type="button" onClick={() => api.regenerateKey(w._id).then(load)} className="text-amber-400 text-sm font-medium hover:underline">New Key</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <form onSubmit={handleUpdate} className="qc-admin-card p-6 w-full max-w-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white">Edit {editing.name}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Name</label>
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="qc-admin-input" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Domain</label>
                <input value={editing.domain} onChange={(e) => setEditing({ ...editing, domain: e.target.value })} className="qc-admin-input" />
              </div>
            </div>

            <h3 className="font-semibold text-sm text-brand-light pt-2">Branding</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Primary color</label>
                <div className="flex gap-2">
                  <input type="color" value={editing.branding?.primaryColor || '#0A1628'} onChange={(e) => updateBranding('primaryColor', e.target.value)} className="h-10 w-12 rounded-lg border border-white/10 bg-transparent" />
                  <input value={editing.branding?.primaryColor || ''} onChange={(e) => updateBranding('primaryColor', e.target.value)} className="qc-admin-input font-mono text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Secondary color</label>
                <div className="flex gap-2">
                  <input type="color" value={editing.branding?.secondaryColor || '#1A365D'} onChange={(e) => updateBranding('secondaryColor', e.target.value)} className="h-10 w-12 rounded-lg border border-white/10 bg-transparent" />
                  <input value={editing.branding?.secondaryColor || ''} onChange={(e) => updateBranding('secondaryColor', e.target.value)} className="qc-admin-input font-mono text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Accent color</label>
                <div className="flex gap-2">
                  <input type="color" value={editing.branding?.accentColor || '#3B82F6'} onChange={(e) => updateBranding('accentColor', e.target.value)} className="h-10 w-12 rounded-lg border border-white/10 bg-transparent" />
                  <input value={editing.branding?.accentColor || ''} onChange={(e) => updateBranding('accentColor', e.target.value)} className="qc-admin-input font-mono text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Position</label>
                <select value={editing.branding?.position || WIDGET_POSITIONS.BOTTOM_RIGHT} onChange={(e) => updateBranding('position', e.target.value)} className="qc-admin-input">
                  {Object.values(WIDGET_POSITIONS).map((p: string) => (
                    <option key={p} value={p} className="bg-navy-900">{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Welcome message</label>
              <input value={editing.branding?.welcomeMessage || ''} onChange={(e) => updateBranding('welcomeMessage', e.target.value)} className="qc-admin-input" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Logo URL</label>
              <input value={editing.branding?.logoUrl || ''} onChange={(e) => updateBranding('logoUrl', e.target.value)} placeholder="https://yoursite.com/logo.png" className="qc-admin-input" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Font family</label>
              <input value={editing.branding?.fontFamily || ''} onChange={(e) => updateBranding('fontFamily', e.target.value)} className="qc-admin-input" />
            </div>

            <h3 className="font-semibold text-sm text-brand-light pt-2">Settings</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.settings?.allowFileUploads ?? true} onChange={(e) => updateSettings('allowFileUploads', e.target.checked)} className="accent-brand" /> File uploads</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.settings?.allowReactions ?? true} onChange={(e) => updateSettings('allowReactions', e.target.checked)} className="accent-brand" /> Reactions</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.settings?.allowEditing ?? true} onChange={(e) => updateSettings('allowEditing', e.target.checked)} className="accent-brand" /> Message editing</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.settings?.notificationSound ?? true} onChange={(e) => updateSettings('notificationSound', e.target.checked)} className="accent-brand" /> Notification sound</label>
              <div className="col-span-2">
                <label className="text-xs text-slate-400 block mb-1">Max file size (MB)</label>
                <input type="number" min={1} max={100} value={editing.settings?.maxFileSizeMb ?? 25} onChange={(e) => updateSettings('maxFileSizeMb', Number(e.target.value))} className="qc-admin-input" />
              </div>
            </div>

            <p className="text-xs text-slate-500 font-mono break-all">Website ID: {editing._id}</p>
            <p className="text-xs text-slate-500 font-mono break-all">API Key: {editing.apiKey}</p>

            <EmbedSnippet website={editing} />

            <div className="flex gap-2 pt-2">
              <button type="submit" className="qc-admin-btn">Save</button>
              <button type="button" onClick={() => setEditing(null)} className="qc-admin-btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
