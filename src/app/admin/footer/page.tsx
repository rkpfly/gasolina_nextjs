'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { StatusBadge, Toggle } from '../components/ui/UIComponents';
import SocialsSection from '../components/Footer/SocialsSection/page';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ContactData {
  id: number;
  phone1: string;
  phone2: string;
  email: string;
  copy_year: number;
  is_active: boolean;
}

interface Territory {
  id: number;
  city: string;
  href: string;
  sort_order: number;
  is_active: boolean;
}

interface LegalPage {
  id: number;
  slug: string;
  label: string;
  href: string;
  is_active: boolean;
}

interface LegalPageFull extends LegalPage {
  content: string;
}

interface Social {
  id: number;
  platform: string;
  label: string;
  href: string;
  icon_class: string;
  sort_order: number;
  is_active: boolean;
}

type Section = 'contact' | 'territories' | 'legal' | 'socials';

const SECTIONS: { value: Section; label: string }[] = [
  { value: 'contact',     label: '📞  Contact & Copyright' },
  { value: 'territories', label: '🌏  Territories' },
  { value: 'legal',       label: '📜  Legal Pages' },
  { value: 'socials',     label: '🔗  Social Links' },
];

// ─── Tiny reusable components ─────────────────────────────────────────────────

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB is plenty for an A4 image
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `Unsupported file type: ${file.type}. Use JPG, PNG, WebP, or AVIF.`;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `Image exceeds the 10 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`;
  }
  return null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="px-6 py-2 bg-pink-600 text-white text-xs font-bold tracking-[0.12em] uppercase rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      {saving ? 'Saving…' : '💾  Save Changes'}
    </button>
  );
}

// ─── TipTap toolbar ──────────────────────────────────────────────────────────

function TipTapToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const btn = (action: () => void, label: string, active?: boolean) => (
    <button
      type="button"
      onClick={action}
      className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
        active ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-800 rounded-t-lg bg-gray-950">
      {btn(() => editor.chain().focus().toggleBold().run(),      'B',  editor.isActive('bold'))}
      {btn(() => editor.chain().focus().toggleItalic().run(),    'I',  editor.isActive('italic'))}
      {btn(() => editor.chain().focus().toggleUnderline().run(), 'U',  editor.isActive('underline'))}
      <div className="w-px bg-gray-700 mx-1" />
      {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2', editor.isActive('heading', { level: 2 }))}
      {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3', editor.isActive('heading', { level: 3 }))}
      <div className="w-px bg-gray-700 mx-1" />
      {btn(() => editor.chain().focus().toggleBulletList().run(),  '• List',  editor.isActive('bulletList'))}
      {btn(() => editor.chain().focus().toggleOrderedList().run(), '1. List', editor.isActive('orderedList'))}
      <div className="w-px bg-gray-700 mx-1" />
      {btn(() => editor.chain().focus().toggleBlockquote().run(), '❝', editor.isActive('blockquote'))}
      {btn(() => editor.chain().focus().setHorizontalRule().run(), '─')}
      <div className="w-px bg-gray-700 mx-1" />
      {btn(() => editor.chain().focus().undo().run(), '↩')}
      {btn(() => editor.chain().focus().redo().run(), '↪')}
    </div>
  );
}

// ─── Section: Contact & Copyright ────────────────────────────────────────────

function ContactSection({ data, onSaved }: {
  data: ContactData;
  onSaved: (updated: ContactData) => void;
}) {
  const [form, setForm] = useState(data);
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState('');

  const set = (k: keyof ContactData, v: string | number | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/footer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'contact', ...form }),
      });
      if (!res.ok) throw new Error();
      onSaved(form);
      setToast('Saved ✓');
    } catch {
      setToast('Error — could not save.');
    } finally {
      setSaving(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">Contact &amp; Copyright</h2>
        <div className="flex items-center gap-3">
          <StatusBadge active={form.is_active} />
          <Toggle value={form.is_active} onChange={v => set('is_active', v)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'phone1' as const, label: 'Phone 1', placeholder: '' },
          { key: 'phone2' as const, label: 'Phone 2', placeholder: '' },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-[0.12em] uppercase text-gray-500">{label}</label>
            <input
              value={form[key] as string}
              onChange={e => set(key, e.target.value)}
              placeholder={placeholder}
              className="bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600"
            />
          </div>
        ))}

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-bold tracking-[0.12em] uppercase text-gray-500">Email Address</label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            className="bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold tracking-[0.12em] uppercase text-gray-500">Copyright Year</label>
          <input
            type="number"
            min={2020}
            max={2099}
            value={form.copy_year}
            onChange={e => set('copy_year', parseInt(e.target.value))}
            className="bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600 w-32"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <SaveButton saving={saving} onClick={save} />
        {toast && <p className="text-xs font-bold text-emerald-600">{toast}</p>}
      </div>
    </div>
  );
}

// ─── Section: Territories ─────────────────────────────────────────────────────

function TerritoriesSection({ data, onSaved }: {
  data: Territory[];
  onSaved: (updated: Territory[]) => void;
}) {
  const [rows, setRows] = useState(data);
  const [saving, setSaving] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Record<number, string>>({});

  const setToast = (id: number, msg: string) => {
    setToasts(t => ({ ...t, [id]: msg }));
    setTimeout(() => setToasts(t => { const n = { ...t }; delete n[id]; return n; }), 3000);
  };

  const update = (id: number, key: keyof Territory, value: string | boolean | number) =>
    setRows(rs => rs.map(r => r.id === id ? { ...r, [key]: value } : r));

  const save = async (row: Territory) => {
    setSaving(row.id);
    try {
      const res = await fetch('/api/admin/footer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'territory', ...row }),
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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold tracking-tight">Territories</h2>
      <p className="text-xs text-gray-500">Toggle a city inactive to hide it from the footer without deleting it.</p>

      <div className="divide-y divide-gray-800 border border-gray-800 rounded-xl overflow-hidden">
        {rows.map(row => (
          <div key={row.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800/60 transition-colors">
            {/* Order */}
            <input
              type="number"
              value={row.sort_order}
              onChange={e => update(row.id, 'sort_order', parseInt(e.target.value))}
              className="w-14 bg-gray-800 text-gray-100 border border-gray-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-pink-600"
            />

            {/* City name */}
            <input
              value={row.city}
              onChange={e => update(row.id, 'city', e.target.value)}
              className="flex-1 bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600"
            />

            {/* Link */}
            <input
              value={row.href}
              onChange={e => update(row.id, 'href', e.target.value)}
              placeholder="/"
              className="flex-1 bg-gray-800 text-gray-400 placeholder-gray-600 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600"
            />

            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge active={row.is_active} />
              <Toggle value={row.is_active} onChange={v => update(row.id, 'is_active', v)} />
              <button
                type="button"
                onClick={() => save(row)}
                disabled={saving === row.id}
                className="px-3 py-1.5 bg-gray-100 text-gray-900 text-[10px] font-bold tracking-widest uppercase rounded-lg hover:bg-white disabled:opacity-50"
              >
                {saving === row.id ? '…' : 'Save'}
              </button>
              {toasts[row.id] && (
                <span className="text-[10px] font-bold text-emerald-600">{toasts[row.id]}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Legal Pages (TipTap) ───────────────────────────────────────────

// function LegalSection({ pages }: { pages: LegalPage[] }) {
//   const [selected, setSelected] = useState<LegalPageFull | null>(null);
//   const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
//   const [saving, setSaving] = useState(false);
//   const [toast, setToast]   = useState('');
//   const [isActive, setIsActive] = useState(true);
//   const [label, setLabel]       = useState('');
//   const [href, setHref]         = useState('');

//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       Underline,
//       Link.configure({ openOnClick: false }),
//     ],
//     content: '',
//     editorProps: {
//       attributes: {
//         class: 'prose prose-sm prose-invert max-w-none p-4 min-h-[320px] focus:outline-none text-gray-100',
//       },
//     },
//   });

//   const load = useCallback(async (slug: string) => {
//     setLoadingSlug(slug);
//     try {
//       const res = await fetch(`/api/admin/footer/legal?slug=${slug}`);
//       const data: LegalPageFull = await res.json();
//       setSelected(data);
//       setIsActive(data.is_active);
//       setLabel(data.label);
//       setHref(data.href);
//       editor?.commands.setContent(data.content || '');
//     } finally {
//       setLoadingSlug(null);
//     }
//   }, [editor]);

//   const save = async () => {
//     if (!selected || !editor) return;
//     setSaving(true);
//     try {
//       const res = await fetch('/api/admin/footer', {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           section:   'legal',
//           id:        selected.id,
//           label,
//           href,
//           content:   editor.getHTML(),
//           is_active: isActive,
//         }),
//       });
//       if (!res.ok) throw new Error();
//       setToast('Saved ✓');
//     } catch {
//       setToast('Error — could not save.');
//     } finally {
//       setSaving(false);
//       setTimeout(() => setToast(''), 3000);
//     }
//   };

//   return (
//     <div className="space-y-5">
//       <h2 className="text-lg font-bold tracking-tight">Legal Pages</h2>

//       {/* Page selector pills */}
//       <div className="flex gap-2 flex-wrap">
//         {pages.map(p => (
//           <button
//             key={p.slug}
//             type="button"
//             onClick={() => load(p.slug)}
//             disabled={loadingSlug === p.slug}
//             className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.12em] uppercase border transition-colors ${
//               selected?.slug === p.slug
//                 ? 'bg-gray-900 text-white border-gray-900'
//                 : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
//             }`}
//           >
//             {loadingSlug === p.slug ? '…' : p.label}
//           </button>
//         ))}
//       </div>

//       {!selected && (
//         <p className="text-sm text-gray-400 py-12 text-center border border-dashed border-gray-200 rounded-xl">
//           Select a page above to edit its content.
//         </p>
//       )}

//       {selected && (
//         <div className="space-y-4">
//           <div className="flex items-center justify-between">
//             <span className="text-sm font-bold text-gray-700">{selected.slug}</span>
//             <div className="flex items-center gap-3">
//               <StatusBadge active={isActive} />
//               <Toggle value={isActive} onChange={setIsActive} />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="flex flex-col gap-1.5">
//               <label className="text-xs font-bold tracking-[0.12em] uppercase text-gray-500">Page Label</label>
//               <input
//                 value={label}
//                 onChange={e => setLabel(e.target.value)}
//                 className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
//               />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="text-xs font-bold tracking-[0.12em] uppercase text-gray-500">Route / Href</label>
//               <input
//                 value={href}
//                 onChange={e => setHref(e.target.value)}
//                 className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
//               />
//             </div>
//           </div>

//           {/* TipTap editor */}
//           <div className="border border-gray-200 rounded-xl overflow-hidden">
//             <TipTapToolbar editor={editor} />
//             <EditorContent editor={editor} />
//           </div>

//           <div className="flex items-center justify-between pt-1">
//             <SaveButton saving={saving} onClick={save} />
//             {toast && <p className="text-xs font-bold text-emerald-600">{toast}</p>}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// ─── Component: A4 Image Uploader ─────────────────────────────────────────────

type UploadMode = 'file' | 'url';

interface A4ImageUploaderProps {
  initialUrl: string;
  onUrlChange: (url: string) => void;
  onFileStage: (file: File | null) => void;
}

function A4ImageUploader({ initialUrl, onUrlChange, onFileStage }: A4ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mode, setMode] = useState<UploadMode>('file');
  const [dragging, setDragging] = useState(false);
  
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedPreview, setStagedPreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Clean up blob URLs to prevent memory leaks
  useEffect(() => {
    return () => { if (stagedPreview) URL.revokeObjectURL(stagedPreview); };
  }, [stagedPreview]);

  const handleStageFile = (file: File) => {
    setError('');
    const err = validateImage(file);
    if (err) { setError(err); return; }

    setStagedFile(file);
    onFileStage(file); // Notify parent
    
    if (stagedPreview) URL.revokeObjectURL(stagedPreview);
    setStagedPreview(URL.createObjectURL(file));
  };

  const clearStaged = () => {
    setStagedFile(null);
    onFileStage(null);
    if (stagedPreview) URL.revokeObjectURL(stagedPreview);
    setStagedPreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentPreview = stagedPreview || initialUrl;

  return (
    <div className="md:col-span-2 space-y-3 bg-gray-950 border border-gray-800 rounded-xl p-4">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold tracking-[0.12em] uppercase text-gray-500">
          Side Image (A4 Ratio)
        </label>

        {/* File vs URL Toggle */}
        <div className="flex gap-1 bg-gray-800 rounded-md p-0.5">
          {(['file', 'url'] as UploadMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); clearStaged(); }}
              className={`px-3 py-1 text-xs font-medium rounded transition ${
                mode === m ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {m === 'file' ? 'Upload' : 'URL'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          {mode === 'url' ? (
            <input
              type="text"
              value={initialUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600 bg-gray-800 text-gray-100 placeholder-gray-500"
            />
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleStageFile(e.target.files[0])}
              />
              
              {!stagedFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg py-6 px-4 text-center cursor-pointer transition-all bg-gray-900 ${
                    dragging ? 'border-pink-500 bg-pink-950/40' : 'border-gray-700 hover:border-gray-500'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    if (e.dataTransfer.files?.[0]) handleStageFile(e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-2xl mb-2">{dragging ? '📂' : '☁️'}</div>
                  <p className="text-gray-200 text-sm font-medium mb-1">Browse or drop image</p>
                  <p className="text-gray-500 text-xs font-mono">Max: 10MB • Recommended: 21:29.7 ratio</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-3 py-4 bg-gray-900 border border-gray-800 rounded-lg shadow-sm">
                  <span className="text-2xl">🖼️</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-100 truncate font-medium">{stagedFile.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{formatBytes(stagedFile.size)}</p>
                  </div>
                  <button type="button" onClick={clearStaged} className="text-gray-500 hover:text-red-500 transition px-2">✕</button>
                </div>
              )}
              {error && <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>}
            </>
          )}
        </div>

        {/* Live Preview Pane */}
        {currentPreview && (
          <div className="w-full md:w-32 flex-shrink-0">
             <div className="w-full aspect-[21/29.7] rounded-lg overflow-hidden border border-gray-800 shadow-sm relative bg-gray-800">
               <img src={currentPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LegalSection({ pages, onPagesChange }: { 
  pages: LegalPage[];
  onPagesChange: (updated: LegalPage[]) => void;
}) {
  const [selected, setSelected] = useState<LegalPageFull | null>(null);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState('');
  const [stagedImageFile, setStagedImageFile] = useState<File | null>(null);
  
  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [slug, setSlug]         = useState(''); // Needed for new pages
  const [label, setLabel]       = useState('');
  const [href, setHref]         = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-invert max-w-none p-4 min-h-[320px] focus:outline-none text-gray-100',
      },
    },
  });

  const load = useCallback(async (targetSlug: string) => {
    setIsCreating(false);
    setLoadingSlug(targetSlug);
    try {
      const res = await fetch(`/api/admin/footer/legal?slug=${targetSlug}`);
      const data: LegalPageFull & { image_url?: string } = await res.json();
      setSelected(data);
      setSlug(data.slug);
      setIsActive(data.is_active);
      setLabel(data.label);
      setHref(data.href);
      setImageUrl(data.image_url || '');
      editor?.commands.setContent(data.content || '');
    } catch {
      setToast('Failed to load page');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setLoadingSlug(null);
    }
  }, [editor]);

  const handleAddNew = () => {
    setSelected(null);
    setIsCreating(true);
    setSlug('');
    setLabel('');
    setHref('');
    setImageUrl('');
    setIsActive(true);
    setImageUrl('');
    setStagedImageFile(null);
    editor?.commands.setContent('');
  };

  const save = async () => {
    if ((!selected && !isCreating) || !editor) return;
    if (isCreating && !slug) {
      setToast('Slug is required');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = imageUrl;
      const currentSlug = isCreating ? slug.toLowerCase().replace(/\s+/g, '-') : selected?.slug;

      // 1. Upload image if one is staged
      if (stagedImageFile) {
        setToast('Uploading image...');
        const fd = new FormData();
        
        // Match the fields expected by your /api/admin/media endpoint
        fd.append('pageRoute', '/legal');
        fd.append('htmlId', currentSlug || 'new-page');
        fd.append('mediaType', 'image');
        fd.append('altText', `${label} reference image`);
        fd.append('folder', 'legal'); 
        fd.append('file', stagedImageFile);

        const uploadRes = await fetch('/api/admin/media', {
          method: 'POST',
          body: fd,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.error || 'Image upload failed');
        }
        
        const uploadData = await uploadRes.json();
        
        // Based on your media editor, the API returns { media_url: string }
        finalImageUrl = uploadData.media_url; 
        
        // Update local states so it doesn't re-upload on subsequent saves
        setImageUrl(finalImageUrl);
        setStagedImageFile(null); 
      }

      // 2. Save page data to the database
      setToast('Saving page data...');
      const method = isCreating ? 'POST' : 'PATCH';
      
      const payload = {
        section:   'legal',
        id:        selected?.id, // Will be undefined if POSTing
        slug:      currentSlug,
        label,
        href,
        content:   editor.getHTML(),
        image_url: finalImageUrl, // Use the newly uploaded URL (or existing one)
        is_active: isActive,
      };

      const res = await fetch('/api/admin/footer', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error('Database save failed');
      
      const result = await res.json();

      // If we just created a new page, add it to the parent state so the pill appears
      if (isCreating) {
        const newPage: LegalPage = {
          id: result.id || Date.now(), // Fallback if API doesn't return ID
          slug: payload.slug ?? "",
          label: payload.label,
          href: payload.href,
          is_active: payload.is_active,
        };
        onPagesChange([...pages, newPage]);
        setIsCreating(false);
        setSelected({ ...newPage, content: payload.content } as LegalPageFull);
      } else {
        // Update existing page pill if label/href/status changed
        onPagesChange(pages.map(p => p.id === selected?.id ? { ...p, label, href, is_active: isActive } : p));
      }

      setToast('Saved ✓');
    } catch (err: any) {
      setToast(err.message || 'Error — could not save.');
    } finally {
      setSaving(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold tracking-tight text-white">Legal Pages</h2>

      {/* Page selector pills */}
      <div className="flex gap-2 flex-wrap">
        {pages.map(p => (
          <button
            key={p.slug}
            type="button"
            onClick={() => load(p.slug)}
            disabled={loadingSlug === p.slug}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.12em] uppercase border transition-colors ${
              (selected?.slug === p.slug && !isCreating)
                ? 'bg-gray-100 text-gray-900 border-gray-100' // Dark mode active state
                : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500' // Dark mode inactive
            }`}
          >
            {loadingSlug === p.slug ? '…' : p.label}
          </button>
        ))}
        
        {/* Add New Button */}
        <button
          type="button"
          onClick={handleAddNew}
          className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.12em] uppercase border border-dashed transition-colors ${
            isCreating 
              ? 'bg-emerald-950 text-emerald-400 border-emerald-500' 
              : 'bg-transparent text-gray-500 border-gray-600 hover:text-white hover:border-gray-400'
          }`}
        >
          + Add New
        </button>
      </div>

      {(!selected && !isCreating) && (
        <p className="text-sm text-gray-500 py-12 text-center border border-dashed border-gray-800 rounded-xl">
          Select a page above to edit its content, or create a new one.
        </p>
      )}

      {(selected || isCreating) && (
        <div className="space-y-4 bg-gray-950 text-gray-100 border border-gray-800 p-6 rounded-xl mt-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h3 className="text-base font-bold">
              {isCreating ? 'Create New Legal Page' : `Editing: ${selected?.slug}`}
            </h3>
            <div className="flex items-center gap-3">
              <StatusBadge active={isActive} />
              <Toggle value={isActive} onChange={setIsActive} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Slug is only editable when creating */}
             {isCreating && (
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold tracking-[0.12em] uppercase text-gray-500">Slug (URL Path)</label>
                <input
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="e.g. refund-policy"
                  className="bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-[0.12em] uppercase text-gray-500">Page Label</label>
              <input
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Refund Policy"
                className="bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-[0.12em] uppercase text-gray-500">Route / Href</label>
              <input
                value={href}
                onChange={e => setHref(e.target.value)}
                placeholder="e.g. /refund-policy"
                className="bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600"
              />
            </div>
            <A4ImageUploader 
               initialUrl={imageUrl} 
               onUrlChange={setImageUrl} 
               onFileStage={setStagedImageFile} 
             />
          </div>

          {/* TipTap editor */}
          <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900">
            <TipTapToolbar editor={editor} />
            <EditorContent editor={editor} />
          </div>

          <div className="flex items-center justify-between pt-1">
            <SaveButton saving={saving} onClick={save} />
            {toast && <p className="text-xs font-bold text-emerald-600">{toast}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section: Social Links ────────────────────────────────────────────────────

export default function AdminFooterPage() {
  const [activeSection, setActiveSection] = useState<Section>('contact');
  const [contact,     setContact]     = useState<ContactData | null>(null);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [legalPages,  setLegalPages]  = useState<LegalPage[]>([]);
  const [socials,     setSocials]     = useState<Social[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch('/api/admin/footer')
      .then(r => r.json())
      .then(data => {
        setContact(data.contact);
        setTerritories(data.territories);
        setLegalPages(data.legalPages);
        setSocials(data.socials);
      })
      .catch(() => setError('Failed to load footer data.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="border-b border-gray-800 px-6 md:px-10 py-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-0.5">Admin</p>
          <h1 className="text-xl font-bold text-white">Footer Manager</h1>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 max-w-6xl">
        <div className="mb-8">
          <label className="block text-xs font-bold tracking-[0.15em] uppercase text-gray-500 mb-2">
            Editing section
          </label>
          <select
            value={activeSection}
            onChange={e => setActiveSection(e.target.value as Section)}
            className="w-full max-w-xs bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-pink-600"
          >
            {SECTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
          {loading ? (
             <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : (
            <>
              {activeSection === 'contact' && contact && <ContactSection data={contact} onSaved={setContact} />}
              {activeSection === 'territories' && <TerritoriesSection data={territories} onSaved={setTerritories} />}
              {activeSection === 'legal' && <LegalSection pages={legalPages} onPagesChange={setLegalPages} />}
              {activeSection === 'socials' && <SocialsSection data={socials} onSaved={setSocials} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}