'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  getThemes,
  createTheme,
  updateTheme,
  deleteTheme,
} from './actions';
import RichTextEditor from '@/components/RichTextEditor';

type Theme = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  detailed_content: object;
  hero_image: string;
  thumbnail_url: string;
  gallery: object[];
  template_name: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string | string[];
  is_active: boolean;
  created_at: string;
};

const EMPTY_FORM = {
  slug: '',
  title: '',
  short_description: '',
  description: '',
  hero_image: '',
  thumbnail_url: '',
  template_name: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
};

type FormState = typeof EMPTY_FORM;

function ThemeForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: FormState;
  onSave: (data: FormState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="bg-[#111318] border border-[#2a2d36] rounded-lg p-6 mt-2 mb-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Title" required>
          <input value={form.title} onChange={set('title')} placeholder="Midnight Elegance" />
        </Field>
        <Field label="Slug" required>
          <input value={form.slug} onChange={set('slug')} placeholder="midnight-elegance" className="font-mono" />
        </Field>
        <Field label="Template name" required>
          <input value={form.template_name} onChange={set('template_name')} placeholder="default" />
        </Field>
        <Field label="Hero image URL">
          <input value={form.hero_image} onChange={set('hero_image')} placeholder="https://…" />
        </Field>
        <Field label="Thumbnail URL">
          <input value={form.thumbnail_url} onChange={set('thumbnail_url')} placeholder="https://…" />
        </Field>
        <Field label="Short description" className="sm:col-span-2">
          <textarea
            value={form.short_description}
            onChange={set('short_description')}
            rows={2}
            placeholder="One-liner shown in theme cards…"
          />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <RichTextEditor
            value={form.description}
            onChange={(val) => setForm((f) => ({ ...f, description: val }))}
            placeholder="Detailed description of the theme…"
          />
        </Field>
        <Field label="SEO title">
          <input value={form.seo_title} onChange={set('seo_title')} placeholder="Page title for search engines" />
        </Field>
        <Field label="SEO description">
          <input value={form.seo_description} onChange={set('seo_description')} placeholder="Meta description" />
        </Field>
        <Field label="SEO keywords">
          <input value={form.seo_keywords} onChange={set('seo_keywords')} placeholder="comma, separated, keywords" />
        </Field>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.title || !form.slug || !form.template_name}
          className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          {saving ? 'Saving…' : 'Save theme'}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium rounded-md border border-[#2a2d36] text-[#9ca3b0] hover:text-white hover:border-[#3d4150] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className = '',
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">
        {label}
        {required && <span className="text-indigo-400 ml-1">*</span>}
      </span>
      <div className="[&_input]:w-full [&_textarea]:w-full [&_select]:w-full [&_input]:bg-[#0d0f13] [&_textarea]:bg-[#0d0f13] [&_select]:bg-[#0d0f13] [&_input]:border [&_textarea]:border [&_select]:border [&_input]:border-[#2a2d36] [&_textarea]:border-[#2a2d36] [&_select]:border-[#2a2d36] [&_input]:rounded-md [&_textarea]:rounded-md [&_select]:rounded-md [&_input]:px-3 [&_textarea]:px-3 [&_select]:px-3 [&_input]:py-2 [&_textarea]:py-2 [&_select]:py-2 [&_input]:text-sm [&_textarea]:text-sm [&_select]:text-sm [&_input]:text-[#e2e5ed] [&_textarea]:text-[#e2e5ed] [&_select]:text-[#e2e5ed] [&_input]:placeholder-[#3d4150] [&_textarea]:placeholder-[#3d4150] [&_input]:focus:outline-none [&_textarea]:focus:outline-none [&_select]:focus:outline-none [&_input]:focus:border-indigo-500 [&_textarea]:focus:border-indigo-500 [&_select]:focus:border-indigo-500 [&_input]:transition-colors [&_textarea]:transition-colors [&_select]:transition-colors [&_select]:appearance-none">
        {children}
      </div>
    </label>
  );
}

export default function ThemesListPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getThemes();
      setThemes(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load themes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = (data: FormState) => {
    startTransition(async () => {
      try {
        await createTheme({ ...data, detailed_content: {}, gallery: [] });
        setCreating(false);
        await load();
      } catch (e: any) {
        setError(e?.message ?? 'Failed to create theme.');
      }
    });
  };

  const handleUpdate = (id: string, data: FormState) => {
    startTransition(async () => {
      try {
        await updateTheme(id, { ...data, detailed_content: {}, gallery: [] });
        setEditingId(null);
        await load();
      } catch (e: any) {
        setError(e?.message ?? 'Failed to update theme.');
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this theme? This cannot be undone.')) return;
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteTheme(id);
        await load();
      } catch (e: any) {
        setError(e?.message ?? 'Failed to delete theme.');
      } finally {
        setDeletingId(null);
      }
    });
  };

  const themeToForm = (t: Theme): FormState => ({
    slug: t.slug,
    title: t.title,
    short_description: t.short_description ?? '',
    description: t.description ?? '',
    hero_image: t.hero_image ?? '',
    thumbnail_url: t.thumbnail_url ?? '',
    template_name: t.template_name,
    seo_title: t.seo_title ?? '',
    seo_description: t.seo_description ?? '',
    seo_keywords: Array.isArray(t.seo_keywords)
      ? t.seo_keywords.join(', ')
      : (t.seo_keywords ?? ''),
  });

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-[#e2e5ed]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-mono text-[#4b5263] mb-1 uppercase tracking-widest">Admin / Themes</p>
            <h1 className="text-xl font-semibold text-white">Theme registry</h1>
          </div>
          <button
            onClick={() => { setCreating(true); setEditingId(null); }}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
          >
            <span className="text-base leading-none">+</span> New theme
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-md bg-red-950 border border-red-800 text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-red-200 text-lg leading-none">×</button>
          </div>
        )}

        {/* Inline create form */}
        {creating && (
          <ThemeForm
            initial={EMPTY_FORM}
            onSave={handleCreate}
            onCancel={() => setCreating(false)}
            saving={isPending}
          />
        )}

        {/* Table */}
        <div className="rounded-lg border border-[#1e2028] overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#1e2028] bg-[#0e1015]">
                <th className="px-5 py-3 text-left text-xs font-medium text-[#4b5263] uppercase tracking-wider">Title</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[#4b5263] uppercase tracking-wider hidden sm:table-cell">Slug</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[#4b5263] uppercase tracking-wider hidden md:table-cell">Template</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[#4b5263] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-[#4b5263] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#4b5263]">
                    <span className="inline-block animate-pulse">Loading…</span>
                  </td>
                </tr>
              )}

              {!loading && themes.length === 0 && !creating && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <p className="text-[#4b5263] text-sm">No themes yet.</p>
                    <button
                      onClick={() => setCreating(true)}
                      className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm underline underline-offset-2"
                    >
                      Create your first theme
                    </button>
                  </td>
                </tr>
              )}

              {!loading && themes.map((theme) => (
                <>
                  <tr
                    key={theme.id}
                    className={`border-b border-[#1a1c23] transition-colors ${editingId === theme.id ? 'bg-[#111318]' : 'hover:bg-[#0e1015]'}`}
                  >
                    <td className="px-5 py-4">
                      <span className="font-medium text-[#e2e5ed]">{theme.title}</span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="font-mono text-xs text-[#6b7280] bg-[#0d0f13] px-2 py-0.5 rounded border border-[#1e2028]">
                        {theme.slug}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-[#6b7280] text-xs font-mono">
                      {theme.template_name}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          theme.is_active
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-[#1a1c23] text-[#6b7280] border border-[#2a2d36]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${theme.is_active ? 'bg-emerald-400' : 'bg-[#4b5263]'}`} />
                        {theme.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setEditingId(editingId === theme.id ? null : theme.id)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                        >
                          {editingId === theme.id ? 'Close' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDelete(theme.id)}
                          disabled={deletingId === theme.id}
                          className="text-xs text-[#4b5263] hover:text-red-400 disabled:opacity-40 transition-colors font-medium"
                        >
                          {deletingId === theme.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Inline edit form row */}
                  {editingId === theme.id && (
                    <tr key={`${theme.id}-edit`} className="bg-[#0e1015]">
                      <td colSpan={5} className="px-5 pb-5">
                        <ThemeForm
                          initial={themeToForm(theme)}
                          onSave={(data) => handleUpdate(theme.id, data)}
                          onCancel={() => setEditingId(null)}
                          saving={isPending}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && themes.length > 0 && (
          <p className="mt-4 text-xs text-[#4b5263] font-mono">
            {themes.length} theme{themes.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}