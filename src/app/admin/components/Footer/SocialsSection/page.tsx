'use client';

import { StatusBadge, Toggle } from '@/app/admin/components/ui/UIComponents';
import { useState } from 'react';
// Assuming you have these imported based on your snippet
// import { StatusBadge, Toggle } from '@/components/ui...'; 

export interface Social {
  id: number;
  platform: string;
  label: string;
  href: string;
  icon_class: string;
  is_active: boolean;
  sort_order: number; // <-- 1. Remove the '?' from here
}

const DEFAULT_NEW_SOCIAL = {
  platform: '',
  label: '',
  href: '',
  icon_class: 'fa-solid fa-link',
  is_active: true,
  sort_order: 0, // <-- 2. Add a default sort_order here so TS is happy
};
export default function SocialsSection({
  data = [],
  onSaved,
}: {
  data?: Social[];
  onSaved: (updated: Social[]) => void;
}) {
  const [rows, setRows] = useState<Social[]>(data);
  const [saving, setSaving] = useState<number | null>(null);
  
  // New State for Creation
  const [isAdding, setIsAdding] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSocial, setNewSocial] = useState(DEFAULT_NEW_SOCIAL);
  
  const [toasts, setToasts] = useState<Record<number, string>>({});

  const setToast = (id: number, msg: string) => {
    setToasts(t => ({ ...t, [id]: msg }));
    setTimeout(() => setToasts(t => { const n = { ...t }; delete n[id]; return n; }), 3000);
  };

  const update = (id: number, key: keyof Social, value: string | boolean) =>
    setRows(rs => rs.map(r => r.id === id ? { ...r, [key]: value } : r));

  // --- Existing Update Function ---
  const save = async (row: Social) => {
    setSaving(row.id);
    try {
      const res = await fetch('/api/admin/footer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'social', id: row.id, href: row.href, is_active: row.is_active }),
      });
      if (!res.ok) throw new Error();
      onSaved(rows);
      setToast(row.id, 'Saved ✓');
    } catch {
      setToast(row.id, 'Error');
    } finally {
      setSaving(null);
    }
  };

  // --- New Create Function ---
  const create = async () => {
    if (!newSocial.platform || !newSocial.href || !newSocial.icon_class) {
      alert("Platform, Icon Class, and URL are required.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/footer', {
        method: 'POST', // Ensure your API route handles POST for creation
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          section: 'social', 
          ...newSocial,
          // If label is empty, fallback to capitalizing the platform name
          label: newSocial.label || newSocial.platform.charAt(0).toUpperCase() + newSocial.platform.slice(1)
        }),
      });
      
      if (!res.ok) throw new Error();
      
      // Assuming your API returns the newly inserted DB row (with its generated ID)
      const { data: createdRow } = await res.json(); 
      
      const updatedRows = [...rows, createdRow];
      setRows(updatedRows);
      onSaved(updatedRows);
      
      // Reset form and close it
      setNewSocial(DEFAULT_NEW_SOCIAL);
      setIsAdding(false);
    } catch {
      alert("Failed to create new social link.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold tracking-tight">Social Links</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold tracking-widest uppercase rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Add Social
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
        
        {/* Existing Rows */}
        {(rows ?? []).map(row => (
          <div key={row.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
              <i className={`${row.icon_class} text-base`} />
            </div>
            <span className="text-sm font-bold text-gray-700 w-24 shrink-0 capitalize">{row.platform}</span>
            <input
              value={row.href}
              onChange={e => update(row.id, 'href', e.target.value)}
              placeholder="https://"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge active={row.is_active} />
              <Toggle value={row.is_active} onChange={v => update(row.id, 'is_active', v)} />
              <button
                type="button"
                onClick={() => save(row)}
                disabled={saving === row.id}
                className="px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold tracking-widest uppercase rounded-lg hover:bg-gray-700 disabled:opacity-50 min-w-[60px]"
              >
                {saving === row.id ? '…' : 'Save'}
              </button>
              {toasts[row.id] && (
                <span className="text-[10px] font-bold text-emerald-600 absolute right-[-50px]">{toasts[row.id]}</span>
              )}
            </div>
          </div>
        ))}

        {/* New Item Form Row */}
        {isAdding && (
          <div className="flex flex-col gap-3 px-4 py-4 bg-gray-50 border-t-2 border-dashed border-gray-200">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Create New Link</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={newSocial.platform}
                onChange={e => setNewSocial(s => ({ ...s, platform: e.target.value }))}
                placeholder="Platform (e.g. instagram)"
                className="w-full sm:w-1/4 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <input
                value={newSocial.icon_class}
                onChange={e => setNewSocial(s => ({ ...s, icon_class: e.target.value }))}
                placeholder="Icon Class (e.g. fa-brands fa-instagram)"
                className="w-full sm:w-1/3 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <input
                value={newSocial.href}
                onChange={e => setNewSocial(s => ({ ...s, href: e.target.value }))}
                placeholder="https://"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div className="flex justify-end items-center gap-3 mt-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-gray-500 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={create}
                disabled={creating}
                className="px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-bold tracking-widest uppercase rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {creating ? 'Saving...' : 'Add Link'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}