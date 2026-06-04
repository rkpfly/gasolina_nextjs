'use client';
import { useState, useEffect } from 'react';

const initialFormState = { 
  slug: '', title: '', description: '',
  og_title: '', og_description: '', og_image: '', og_image_alt: '',
  twitter_card: 'summary_large_image', twitter_title: '', twitter_description: '', twitter_image: '',
  canonical_url: '', robots: 'index, follow', schema_json: '',
  config: {
    fallback_og_title: true,
    fallback_og_desc: true,
    fallback_twitter_title: true,
    fallback_twitter_desc: true
  }
};

const ToggleSwitch = ({ label, checked, onChange }) => (
  <label className="flex items-center cursor-pointer mt-1">
    <div className="relative">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="block bg-gray-700 w-10 h-6 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform peer-checked:translate-x-4"></div>
    </div>
    <span className="ml-3 text-xs font-medium text-gray-400">{label}</span>
  </label>
);

export default function SeoAdminPage() {
  const [pages, setPages] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    const res = await fetch('/api/v1/seo-pages');
    const data = await res.json();
    setPages(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    
    let parsedSchema = null;
    if (form.schema_json) {
      try { parsedSchema = JSON.parse(form.schema_json); } 
      catch (error) { return alert("Invalid JSON in Schema field."); }
    }

    const payload = { ...form, schema_json: parsedSchema, id: editingId };

    await fetch('/api/v1/seo-pages', {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });

    setForm(initialFormState);
    setEditingId(null);
    fetchPages(); 
  };

  const handleEdit = (page) => {
    const parsedConfig = typeof page.config === 'string' ? JSON.parse(page.config) : (page.config || initialFormState.config);
    setForm({
      ...initialFormState,
      ...page,
      config: parsedConfig,
      schema_json: page.schema_json ? JSON.stringify(page.schema_json, null, 2) : ''
    });
    setEditingId(page.id);
    // Scroll to top of form when editing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Missing Delete Function Added Back Here
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this SEO page?')) return;
    await fetch('/api/v1/seo-pages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchPages();
  };

  const updateConfig = (key, value) => {
    setForm({ ...form, config: { ...form.config, [key]: value } });
  };

  const inputClass = "border border-gray-700 bg-gray-950 text-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-10">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold text-white">SEO Pages Admin</h1>

        {/* --- FORM SECTION --- */}
        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800 space-y-8">
          <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-4">
            {editingId ? 'Edit SEO Metadata' : 'Add New SEO Metadata'}
          </h2>
          
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-blue-400">Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>URL Slug *</label>
                <input type="text" required className={inputClass} value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Meta Title</label>
                <input type="text" className={inputClass} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Meta Description</label>
              <textarea rows="2" className={inputClass} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
          </section>

          <section className="space-y-4 pt-4 border-t border-gray-800">
            <h3 className="text-lg font-medium text-blue-400">Open Graph</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="text-sm font-medium text-gray-400">OG Title</label>
                  <ToggleSwitch label="Default to Meta Title" checked={form.config.fallback_og_title} onChange={(e) => updateConfig('fallback_og_title', e.target.checked)} />
                </div>
                <input type="text" disabled={form.config.fallback_og_title} className={inputClass} value={form.config.fallback_og_title ? form.title : form.og_title} onChange={e => setForm({...form, og_title: e.target.value})} />
              </div>
              
              <div>
                <label className={labelClass}>OG Image URL</label>
                <input type="text" className={inputClass} value={form.og_image} onChange={e => setForm({...form, og_image: e.target.value})} />
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-sm font-medium text-gray-400">OG Description</label>
                  <ToggleSwitch label="Default to Meta Description" checked={form.config.fallback_og_desc} onChange={(e) => updateConfig('fallback_og_desc', e.target.checked)} />
                </div>
                <textarea rows="2" disabled={form.config.fallback_og_desc} className={inputClass} value={form.config.fallback_og_desc ? form.description : form.og_description} onChange={e => setForm({...form, og_description: e.target.value})} />
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-4 border-t border-gray-800">
            <h3 className="text-lg font-medium text-blue-400">Twitter Card</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="text-sm font-medium text-gray-400">Twitter Title</label>
                  <ToggleSwitch label="Default to Meta Title" checked={form.config.fallback_twitter_title} onChange={(e) => updateConfig('fallback_twitter_title', e.target.checked)} />
                </div>
                <input type="text" disabled={form.config.fallback_twitter_title} className={inputClass} value={form.config.fallback_twitter_title ? form.title : form.twitter_title} onChange={e => setForm({...form, twitter_title: e.target.value})} />
              </div>
              
              <div>
                <label className={labelClass}>Card Type</label>
                <select className={inputClass} value={form.twitter_card} onChange={e => setForm({...form, twitter_card: e.target.value})}>
                  <option value="summary_large_image">Summary Large Image</option>
                  <option value="summary">Summary</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-sm font-medium text-gray-400">Twitter Description</label>
                  <ToggleSwitch label="Default to Meta Description" checked={form.config.fallback_twitter_desc} onChange={(e) => updateConfig('fallback_twitter_desc', e.target.checked)} />
                </div>
                <textarea rows="2" disabled={form.config.fallback_twitter_desc} className={inputClass} value={form.config.fallback_twitter_desc ? form.description : form.twitter_description} onChange={e => setForm({...form, twitter_description: e.target.value})} />
              </div>
            </div>
          </section>

          <div className="flex gap-3 pt-6 border-t border-gray-800">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700">
              {editingId ? 'Update Metadata' : 'Save Metadata'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm(initialFormState); }} className="bg-gray-800 text-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-700">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* --- DATA TABLE SECTION RESTORED --- */}
        <div className="overflow-x-auto border border-gray-800 rounded-xl shadow-lg bg-gray-900 mt-8">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-950/50">
              <tr>
                <th className="p-4 border-b border-gray-800 font-medium text-gray-400">ID</th>
                <th className="p-4 border-b border-gray-800 font-medium text-gray-400">Slug</th>
                <th className="p-4 border-b border-gray-800 font-medium text-gray-400">Title</th>
                <th className="p-4 border-b border-gray-800 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {pages.map(page => (
                <tr key={page.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 text-gray-400">{page.id}</td>
                  <td className="p-4 font-mono text-sm text-blue-400">{page.slug}</td>
                  <td className="p-4 text-gray-200">{page.title || <span className="text-gray-600 italic">No Title</span>}</td>
                  <td className="p-4 space-x-4">
                    <button onClick={() => handleEdit(page)} className="text-blue-500 hover:text-blue-400 font-medium transition-colors">Edit</button>
                    <button onClick={() => handleDelete(page.id)} className="text-red-500 hover:text-red-400 font-medium transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    No SEO pages found. Create one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}