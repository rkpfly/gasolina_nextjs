"use client";

import { useState, useEffect, FormEvent } from 'react';

// --- Types ---
interface Section {
  id: number;
  page_id: number;
  section_id: string;
  type: string;
  title: string;
  content: string;
  metadata: any;
  display_order: number;
  is_active: boolean;
}

// --- Default Form State ---
const defaultForm = {
  page_id: '',
  section_id: '',
  type: '',
  title: '',
  content: '',
  metadata: '',
  display_order: 0,
  is_active: true,
};

export default function SectionsAdminPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(defaultForm);

  // --- Fetch Data ---
  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/sections');
      const data = await res.json();
      setSections(data || []);
    } catch (err) {
      console.error('Error fetching sections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // --- Form Handlers ---
  const handleOpenModal = (section?: Section) => {
    if (section) {
      setEditingId(section.id);
      setFormData({
        page_id: section.page_id.toString(),
        section_id: section.section_id,
        type: section.type,
        title: section.title || '',
        content: section.content || '',
        metadata: section.metadata ? JSON.stringify(section.metadata, null, 2) : '',
        display_order: section.display_order,
        is_active: section.is_active,
      });
    } else {
      setEditingId(null);
      setFormData(defaultForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/v1/sections/${editingId}` : '/api/v1/sections';
    const method = editingId ? 'PUT' : 'POST';

    const payload = {
      ...formData,
      page_id: parseInt(formData.page_id as string),
      display_order: parseInt(formData.display_order as unknown as string),
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchSections();
      } else {
        alert('Operation failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      const res = await fetch(`/api/v1/sections/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSections();
    } catch (err) {
      console.error(err);
    }
  };

  // --- UI Components ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Page Sections</h1>
          <button
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            + Add Section
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-[#141414] border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-sm bg-[#1a1a1a]">
                <th className="p-4 font-medium">Page ID</th>
                <th className="p-4 font-medium">Section ID</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-neutral-500">Loading...</td>
                </tr>
              ) : sections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-neutral-500">No sections found.</td>
                </tr>
              ) : (
                sections.map((sec) => (
                  <tr key={sec.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                    <td className="p-4">{sec.page_id}</td>
                    <td className="p-4 font-mono text-neutral-400">{sec.section_id}</td>
                    <td className="p-4">
                      <span className="bg-neutral-800 px-2 py-1 rounded text-xs">{sec.type}</span>
                    </td>
                    <td className="p-4">{sec.title || '-'}</td>
                    <td className="p-4">{sec.display_order}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${sec.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {sec.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-3">
                      <button onClick={() => handleOpenModal(sec)} className="text-indigo-400 hover:text-indigo-300">Edit</button>
                      <button onClick={() => handleDelete(sec.id)} className="text-red-400 hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Slide-over */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-[#141414] border border-neutral-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit Section' : 'Create Section'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-white">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 uppercase tracking-wider">Page ID *</label>
                  <input required type="number" value={formData.page_id} onChange={e => setFormData({ ...formData, page_id: e.target.value })} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 uppercase tracking-wider">Display Order</label>
                  <input type="number" value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 uppercase tracking-wider">Section ID *</label>
                  <input required type="text" value={formData.section_id} onChange={e => setFormData({ ...formData, section_id: e.target.value })} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. hero-banner" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 uppercase tracking-wider">Type *</label>
                  <input required type="text" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. HERO, FEATURES" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 uppercase tracking-wider">Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 uppercase tracking-wider">Content</label>
                <textarea rows={4} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono" />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 uppercase tracking-wider">Metadata (JSON)</label>
                <textarea rows={3} value={formData.metadata} onChange={e => setFormData({ ...formData, metadata: e.target.value })} placeholder='{"theme": "dark", "layout": "grid"}' className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono" />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 rounded border-neutral-800 bg-[#0a0a0a] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-[#141414]" />
                <label htmlFor="is_active" className="text-sm text-neutral-300">Is Active</label>
              </div>

              <div className="pt-6 border-t border-neutral-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors">
                  {editingId ? 'Save Changes' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}