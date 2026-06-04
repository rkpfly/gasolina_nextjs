"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import { RawHtml } from '@/lib/RawHtmlExtension';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BlogPost {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  content: object | null;  // stored as TipTap JSON
  author: string;
  tags: string[];
  published: boolean;
  publishedAt?: string;
  seoTitle: string;
  seoDescription: string;
  createdAt?: string;
  updatedAt?: string;
}

const emptyPost = (): Partial<BlogPost> => ({
  title: '',
  slug: '',
  excerpt: '',
  coverImage: '',
  content: null,
  author: '',
  tags: [],
  published: false,
  publishedAt: '',
  seoTitle: '',
  seoDescription: '',
});

// ─── Slug helper ─────────────────────────────────────────────────────────────

const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── Toolbar Button ───────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded-sm text-sm transition-all
        ${active
          ? 'bg-pink-600 text-white'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
        } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

// ─── Editor Toolbar ───────────────────────────────────────────────────────────

function EditorToolbar({ editor }: { editor: any }) {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Image URL');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('URL', prev);
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  };

  // NEW: Function to handle Raw HTML insertion
  const handleAddRawHtml = () => {
    const html = window.prompt('Paste your raw HTML here:');
    if (html) {
      editor.chain().focus().insertContent({
        type: 'rawHtml',
        attrs: { html: html },
      }).run();
    }
  };

  const groups = [
    {
      label: 'History',
      items: [
        { title: 'Undo', icon: '↩', action: () => editor.chain().focus().undo().run(), active: false, disabled: !editor.can().undo() },
        { title: 'Redo', icon: '↪', action: () => editor.chain().focus().redo().run(), active: false, disabled: !editor.can().redo() },
      ],
    },
    {
      label: 'Block',
      items: [
        { title: 'Heading 1', icon: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
        { title: 'Heading 2', icon: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
        { title: 'Heading 3', icon: 'H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
        { title: 'Bullet List', icon: '≡', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
        { title: 'Ordered List', icon: '№', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
        { title: 'Blockquote', icon: '❝', action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
        { title: 'Code Block', icon: '<>', action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
      ],
    },
    {
      label: 'Inline',
      items: [
        { title: 'Bold', icon: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
        { title: 'Italic', icon: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
        { title: 'Underline', icon: 'U', action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline') },
        { title: 'Strikethrough', icon: 'S̶', action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
        { title: 'Inline Code', icon: '`', action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code') },
        { title: 'Link', icon: '⎘', action: setLink, active: editor.isActive('link') },
      ],
    },
    {
      label: 'Align',
      items: [
        { title: 'Align Left', icon: '⬛︎', action: () => editor.chain().focus().setTextAlign('left').run(), active: editor.isActive({ textAlign: 'left' }) },
        { title: 'Align Center', icon: '▣', action: () => editor.chain().focus().setTextAlign('center').run(), active: editor.isActive({ textAlign: 'center' }) },
        { title: 'Align Right', icon: '▪', action: () => editor.chain().focus().setTextAlign('right').run(), active: editor.isActive({ textAlign: 'right' }) },
      ],
    },
    {
      label: 'Insert',
      items: [
        { title: 'Image', icon: '⌗', action: addImage, active: false },
        { title: 'Horizontal Rule', icon: '—', action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
        // NEW: Button for embedding raw HTML
        { title: 'Raw HTML', icon: '</>', action: handleAddRawHtml, active: false }, 
      ],
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-3 border-b border-gray-800 bg-[#0d0d0d]">
      {groups.map((group, gi) => (
        <div key={group.label} className="flex items-center gap-0.5">
          {gi > 0 && <div className="w-px h-5 bg-gray-800 mx-1" />}
          {group.items.map((item) => (
            <ToolbarBtn
              key={item.title}
              title={item.title}
              onClick={item.action}
              active={item.active}
              disabled={(item as any).disabled}
            >
              <span className="font-mono text-[11px] leading-none">{item.icon}</span>
            </ToolbarBtn>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Tag Input ────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('');

  const add = () => {
    const val = input.trim().toLowerCase();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput('');
  };

  const remove = (tag: string) => onChange(tags.filter(t => t !== tag));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {tags.map(tag => (
          <span
            key={tag}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-900 border border-gray-700 text-xs text-gray-300 rounded-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="text-gray-600 hover:text-red-400 transition-colors leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 bg-black border border-gray-800 rounded-sm p-3 text-sm text-white placeholder-gray-600 focus:border-pink-500/50 focus:outline-none transition-colors"
          placeholder="Add a tag and press Enter"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 rounded-sm transition-all"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
        {required && <span className="text-pink-500">*</span>}
        {hint && <span className="text-gray-600 normal-case tracking-normal font-normal ml-1">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white placeholder-gray-600 focus:border-pink-500/50 focus:outline-none transition-colors";
const textareaCls = `${inputCls} resize-none`;

// ─── Blog Editor Modal ────────────────────────────────────────────────────────

function BlogEditorModal({
  post,
  onClose,
  onSaved,
}: {
  post: Partial<BlogPost>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<BlogPost>>(post);
  const [slugLocked, setSlugLocked] = useState(!!post._id);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'content' | 'meta' | 'seo'>('content');

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [draggingCover, setDraggingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof BlogPost, value: any) =>
    setForm(f => ({ ...f, [key]: value }));

  // Auto-slug from title when creating new
  const handleTitleChange = (val: string) => {
    set('title', val);
    if (!slugLocked) set('slug', toSlug(val));
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CharacterCount,
      Placeholder.configure({ placeholder: 'Start writing your post…' }),
      RawHtml
    ],
    content: (form.content as any) || '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none min-h-[320px] p-6 focus:outline-none',
      },
    },
  });

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!editor) return;
  //   setSaving(true);

  //   const payload: Partial<BlogPost> = {
  //     ...form,
  //     content: editor.getJSON(),
  //     updatedAt: new Date().toISOString(),
  //     publishedAt: form.published && !form.publishedAt ? new Date().toISOString() : form.publishedAt,
  //   };

  //   const method = form._id ? 'PUT' : 'POST';
  //   await fetch('/api/admin/blog-posts', {
  //     method,
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(payload),
  //   });

  //   setSaving(false);
  //   onSaved();
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;
    setSaving(true);

    try {
      const fd = new FormData();

      // 1. Append the ID if we are updating an existing post
      // Note: ensure this matches what your backend expects ('id' vs '_id')
      if (form._id) fd.append('id', form._id);

      // 2. Append standard text fields
      fd.append('title', form.title || '');
      fd.append('slug', form.slug || '');
      fd.append('excerpt', form.excerpt || '');
      fd.append('author', form.author || '');
      fd.append('seo_title', form.seoTitle || '');
      fd.append('seo_description', form.seoDescription || '');

      // 3. Serialize complex data structures into strings
      fd.append('content', JSON.stringify(editor.getJSON()));
      fd.append('tags', JSON.stringify(form.tags || []));

      // 4. Handle booleans and dates
      fd.append('published', String(!!form.published));
      
      const publishedAt = form.published && !form.publishedAt 
        ? new Date().toISOString() 
        : (form.publishedAt || '');
        
      if (publishedAt) fd.append('published_at', publishedAt);

      // 5. Handle the Cover Image (File vs existing URL)
      if (coverFile) {
        fd.append('file', coverFile);
      } else if (form.coverImage) {
        fd.append('cover_image', form.coverImage);
      }

      // 6. Send the request
      // We use POST for both create and update since our API route checks for the ID
      // IMPORTANT: Do not set the Content-Type header manually here!
      const response = await fetch('/api/admin/blog', {
        method: 'POST', 
        body: fd,
      });

      if (!response.ok) {
        throw new Error('Failed to save the blog post');
      }

      onSaved();
    } catch (error) {
      console.error("Error saving post:", error);
      alert("There was an error saving your post. Check the console for details.");
    } finally {
      setSaving(false);
    }
  };

  const wordCount = editor?.storage.characterCount?.words() ?? 0;
  const charCount = editor?.storage.characterCount?.characters() ?? 0;

  const sections: { key: typeof activeSection; label: string }[] = [
    { key: 'content', label: 'Content' },
    { key: 'meta', label: 'Metadata' },
    { key: 'seo', label: 'SEO' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-stretch z-50 modal-backdrop">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full bg-[#0a0a0a] modal-content"
        style={{ boxShadow: '0 0 80px rgba(0,0,0,0.9)' }}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800 bg-black flex-shrink-0">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {form._id ? 'Edit Post' : 'New Post'}
              </h2>
              {form.slug && (
                <p className="text-xs text-gray-600 mt-0.5 font-mono">/{form.slug}</p>
              )}
            </div>

            {/* Section Tabs */}
            <div className="flex gap-1 ml-4">
              {sections.map(s => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActiveSection(s.key)}
                  className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-sm transition-all ${
                    activeSection === s.key
                      ? 'bg-pink-600 text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Published Toggle */}
            <div
              className="flex items-center gap-2.5 cursor-pointer group/pub"
              onClick={() => set('published', !form.published)}
            >
              <div className={`relative w-9 h-5 rounded-full transition-colors ${form.published ? 'bg-pink-600' : 'bg-gray-700'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.published ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-widest ${form.published ? 'text-pink-400' : 'text-gray-500'}`}>
                {form.published ? 'Published' : 'Draft'}
              </span>
            </div>

            <div className="w-px h-5 bg-gray-800" />

            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-300 transition-colors text-xl leading-none px-2"
            >
              ×
            </button>

            <button
              type="submit"
              disabled={saving}
              className="button-primary bg-pink-600 hover:bg-pink-700 disabled:opacity-50 px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-sm"
            >
              {saving ? 'Saving…' : form._id ? 'Save Changes' : 'Publish Post'}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* ── CONTENT TAB ── */}
          {activeSection === 'content' && (
            <div className="max-w-4xl mx-auto py-10 px-8 space-y-8">
              {/* Title */}
              <div>
                <textarea
                  className="w-full bg-transparent text-4xl font-bold tracking-tight text-white placeholder-gray-700 resize-none focus:outline-none leading-tight"
                  placeholder="Post title…"
                  rows={2}
                  value={form.title || ''}
                  onChange={e => handleTitleChange(e.target.value)}
                  required
                />
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-600 font-mono">/{form.slug || '—'}</span>
                  {form.slug && (
                    <button
                      type="button"
                      onClick={() => setSlugLocked(l => !l)}
                      className={`text-[10px] uppercase tracking-wider font-semibold transition-colors ${slugLocked ? 'text-gray-700 hover:text-gray-500' : 'text-pink-500 hover:text-pink-400'}`}
                    >
                      {slugLocked ? 'Unlock slug' : 'Auto-slug on'}
                    </button>
                  )}
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-2 pb-8 border-b border-gray-800/60">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">Excerpt</label>
                <textarea
                  className="w-full bg-transparent text-gray-400 placeholder-gray-700 resize-none focus:outline-none text-base leading-relaxed"
                  placeholder="A short summary shown in listings…"
                  rows={2}
                  value={form.excerpt || ''}
                  onChange={e => set('excerpt', e.target.value)}
                />
              </div>

              {/* TipTap Editor */}
              <div className="border border-gray-800 rounded-sm overflow-hidden bg-black/40">
                <EditorToolbar editor={editor} />
                <EditorContent editor={editor} />
                <div className="flex items-center justify-end gap-4 px-4 py-2 border-t border-gray-800/50 bg-[#0d0d0d]">
                  <span className="text-[10px] text-gray-700 font-mono">{wordCount} words</span>
                  <span className="text-[10px] text-gray-700 font-mono">{charCount} chars</span>
                </div>
              </div>
            </div>
          )}

          {/* ── META TAB ── */}
          {activeSection === 'meta' && (
            <div className="max-w-2xl mx-auto py-10 px-8 space-y-8">
              <div>
                <h3 className="text-lg font-bold mb-1">Post Metadata</h3>
                <p className="text-sm text-gray-500">Details about the post, author, cover image, and visibility.</p>
              </div>

              <div className="space-y-6">
                {/* Cover image */}
                <Field label="Cover Image" hint="(File or URL)">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setCoverFile(e.target.files[0]);
                    }}
                  />

                  {coverFile ? (
                    <div className="flex items-center gap-3 px-3 py-3 bg-black border border-gray-800 rounded-sm">
                      <span className="text-xl">🖼️</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate font-medium">{coverFile.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          {(coverFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setCoverFile(null)} 
                        className="text-gray-500 hover:text-red-400 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div
                        className={`border border-dashed rounded-sm py-4 px-4 text-center cursor-pointer transition-all ${
                          draggingCover ? 'border-pink-500 bg-pink-950/20' : 'border-gray-700 hover:border-pink-500 hover:bg-gray-900/50'
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setDraggingCover(true); }}
                        onDragLeave={() => setDraggingCover(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDraggingCover(false);
                          if (e.dataTransfer.files?.[0]) setCoverFile(e.dataTransfer.files[0]);
                        }}
                        onClick={() => coverInputRef.current?.click()}
                      >
                        <div className="text-xl mb-1">{draggingCover ? '📂' : '📸'}</div>
                        <p className="text-gray-300 text-xs font-medium mb-1">
                          {draggingCover ? 'Drop cover image' : 'Click or drop image here'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 font-medium uppercase">OR</span>
                        <input
                          className={inputCls}
                          placeholder="Paste image URL here..."
                          value={form.coverImage || ''}
                          onChange={e => set('coverImage', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Live Preview of URL */}
                  {!coverFile && form.coverImage && (
                    <div className="mt-2 rounded-sm overflow-hidden aspect-video border border-gray-800">
                      <img
                        src={form.coverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover opacity-80"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Slug" required hint="(unique)">
                    <input
                      className={inputCls}
                      placeholder="my-post-slug"
                      value={form.slug || ''}
                      onChange={e => { setSlugLocked(true); set('slug', toSlug(e.target.value)); }}
                      required
                    />
                  </Field>
                  <Field label="Author" required>
                    <input
                      className={inputCls}
                      placeholder="e.g. Jane Smith"
                      value={form.author || ''}
                      onChange={e => set('author', e.target.value)}
                      required
                    />
                  </Field>
                </div>

                <Field label="Tags">
                  <TagInput
                    tags={form.tags || []}
                    onChange={t => set('tags', t)}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Published At" hint="(auto-set on publish)">
                    <input
                      className={inputCls}
                      type="datetime-local"
                      value={form.publishedAt ? form.publishedAt.slice(0, 16) : ''}
                      onChange={e => set('publishedAt', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    />
                  </Field>
                  <Field label="Status">
                    <div
                      className="flex items-center gap-3 p-3 border border-gray-800 rounded-sm bg-black cursor-pointer group/pub2"
                      onClick={() => set('published', !form.published)}
                    >
                      <div className={`w-4 h-4 rounded-sm border flex-shrink-0 flex items-center justify-center transition-colors ${form.published ? 'bg-pink-600 border-pink-600' : 'border-gray-600'}`}>
                        {form.published && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">Published</p>
                        <p className="text-xs text-gray-600">Visible to the public</p>
                      </div>
                    </div>
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── SEO TAB ── */}
          {activeSection === 'seo' && (
            <div className="max-w-2xl mx-auto py-10 px-8 space-y-8">
              <div>
                <h3 className="text-lg font-bold mb-1">SEO</h3>
                <p className="text-sm text-gray-500">Customize how this post appears in search engines. Falls back to title and excerpt if left blank.</p>
              </div>

              <div className="space-y-6">
                <Field label="SEO Title" hint="(recommended: 50–60 chars)">
                  <input
                    className={inputCls}
                    placeholder={form.title || 'Enter SEO title…'}
                    value={form.seoTitle || ''}
                    onChange={e => set('seoTitle', e.target.value)}
                    maxLength={70}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-700">Shown in browser tab and search results</span>
                    <span className={`text-[10px] font-mono ${(form.seoTitle?.length ?? 0) > 60 ? 'text-yellow-500' : 'text-gray-700'}`}>
                      {form.seoTitle?.length ?? 0}/70
                    </span>
                  </div>
                </Field>

                <Field label="SEO Description" hint="(recommended: 120–160 chars)">
                  <textarea
                    className={textareaCls}
                    rows={3}
                    placeholder={form.excerpt || 'Enter SEO description…'}
                    value={form.seoDescription || ''}
                    onChange={e => set('seoDescription', e.target.value)}
                    maxLength={200}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-700">Shown in search result previews</span>
                    <span className={`text-[10px] font-mono ${(form.seoDescription?.length ?? 0) > 160 ? 'text-yellow-500' : 'text-gray-700'}`}>
                      {form.seoDescription?.length ?? 0}/200
                    </span>
                  </div>
                </Field>

                {/* Search Preview */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Search Preview</p>
                  <div className="p-5 border border-gray-800 rounded-sm bg-black/40 space-y-1">
                    <p className="text-[#8ab4f8] text-base font-medium leading-snug line-clamp-1">
                      {form.seoTitle || form.title || 'Post Title'}
                    </p>
                    <p className="text-[#34a853] text-xs font-mono">
                      yoursite.com/{form.slug || 'post-slug'}
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                      {form.seoDescription || form.excerpt || 'Post description will appear here…'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

// ─── Blog Post Card ───────────────────────────────────────────────────────────

function BlogCard({
  post,
  onEdit,
  onDelete,
  idx,
}: {
  post: BlogPost; onEdit: () => void; onDelete: () => void; idx: number;
}) {
  return (
    <div
      className="card-hover animate-card group"
      style={{ animationDelay: `${Math.min(idx * 0.08, 0.4)}s` }}
    >
      <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden h-full flex flex-col">
        {/* Cover */}
        <div className="relative aspect-video bg-gray-900 flex-shrink-0 overflow-hidden">
          {post.coverImage
            ? <img src={post.coverImage} alt={post.title} className="image-preview w-full h-full object-cover opacity-70" />
            : <div className="w-full h-full flex items-center justify-center text-gray-800 text-xs uppercase tracking-widest">No Cover</div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="p-6 flex flex-col flex-grow">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border ${post.published ? 'bg-green-600/20 border-green-600/40 text-green-400' : 'border-gray-700 text-gray-600'}`}>
              {post.published ? 'Published' : 'Draft'}
            </span>
            {post.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-900 border border-gray-800 text-gray-500 rounded-sm">
                {tag}
              </span>
            ))}
            {(post.tags?.length ?? 0) > 2 && (
              <span className="text-[10px] text-gray-700">+{post.tags.length - 2}</span>
            )}
          </div>

          <h3 className="font-semibold text-lg tracking-tight mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-gray-600 text-xs leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
          )}

          <div className="text-xs text-gray-600 flex-grow">
            {post.author && <span className="text-gray-500">{post.author}</span>}
            {post.publishedAt && (
              <span className="ml-2">
                · {new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 mt-4 border-t border-gray-800/50">
            <button
              onClick={onEdit}
              className="flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/60 rounded-sm transition-all"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 rounded-sm transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSort, setCurrentSort] = useState('createdAt');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);

  const fetchPosts = async (sort = currentSort) => {
    setLoading(true);
    const res = await fetch(`/api/admin/blog-posts?sort=${sort}`);
    const data = await res.json();
    setPosts(data);
    setCurrentSort(sort);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    await fetch(`/api/admin/blog-posts?id=${id}`, { method: 'DELETE' });
    fetchPosts();
  };

  const filtered = posts.filter(p =>
    filter === 'all' ? true : filter === 'published' ? p.published : !p.published
  );

  const publishedCount = posts.filter(p => p.published).length;
  const draftCount = posts.filter(p => !p.published).length;

  return (
    <div
      className="min-h-screen bg-black text-white"
      style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,0,127,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,0,127,0.02) 0%, transparent 50%)' }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-in { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-card { opacity: 0; animation: fadeInScale 0.5s ease-out forwards; }
        .card-hover { transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1); }
        .card-hover:hover { transform: translateY(-4px); }
        .card-hover:hover .bg-gray-950 { border-color: rgba(255,0,127,0.35); box-shadow: 0 12px 24px rgba(255,0,127,0.07); }
        .button-primary { position: relative; overflow: hidden; transition: all 0.2s ease; }
        .modal-backdrop { animation: fadeInScale 0.25s ease-out; }
        .modal-content { animation: fadeInScale 0.3s ease-out; }
        .image-preview { transition: opacity 0.3s ease; }
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: rgba(236,72,153,0.5) !important;
          background-color: rgba(236,72,153,0.02) !important;
          transition: all 0.2s ease;
        }
        /* Prose styles for TipTap */
        .prose h1 { font-size: 1.875rem; font-weight: 700; margin-bottom: 0.75rem; line-height: 1.2; }
        .prose h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; line-height: 1.3; }
        .prose h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
        .prose p { margin-bottom: 0.875rem; line-height: 1.7; color: #d1d5db; }
        .prose ul, .prose ol { padding-left: 1.5rem; margin-bottom: 0.875rem; color: #d1d5db; }
        .prose ul { list-style-type: disc; }
        .prose ol { list-style-type: decimal; }
        .prose li { margin-bottom: 0.25rem; }
        .prose blockquote { border-left: 3px solid #ec4899; padding-left: 1rem; color: #9ca3af; font-style: italic; margin: 1rem 0; }
        .prose code { background: #1f2937; color: #f9a8d4; padding: 0.125rem 0.375rem; border-radius: 3px; font-size: 0.85em; font-family: monospace; }
        .prose pre { background: #111827; border: 1px solid #374151; padding: 1rem; border-radius: 4px; overflow-x: auto; margin-bottom: 1rem; }
        .prose pre code { background: none; padding: 0; color: #e5e7eb; }
        .prose a { color: #ec4899; text-decoration: underline; }
        .prose hr { border-color: #374151; margin: 1.5rem 0; }
        .prose img { border-radius: 4px; max-width: 100%; margin: 1rem 0; }
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #4b5563; pointer-events: none; height: 0; }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-16 animate-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2">Blog Posts</h1>
              <div className="w-12 h-1 bg-gradient-to-r from-pink-600 to-transparent mb-8" />

              <div className="flex flex-wrap items-center gap-6">
                {/* Sort */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'createdAt', label: 'Created' },
                    { key: 'publishedAt', label: 'Published' },
                    { key: 'updatedAt', label: 'Modified' },
                    { key: 'title', label: 'Title' },
                  ].map(({ key, label }, idx) => (
                    <button
                      key={key}
                      onClick={() => fetchPosts(key)}
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest border rounded-sm transition-all ${currentSort === key ? 'bg-pink-600 border-pink-600 text-white' : 'border-gray-700 text-gray-400 hover:text-gray-300 hover:border-gray-600'}`}
                      style={{ animation: `slideInLeft 0.4s ease-out forwards`, animationDelay: `${idx * 0.05}s` }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                  {(['all', 'published', 'draft'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-sm transition-all ${filter === f ? 'text-white bg-gray-800' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                      {f === 'all' ? `All (${posts.length})` : f === 'published' ? `Published (${publishedCount})` : `Drafts (${draftCount})`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditingPost(emptyPost())}
              className="button-primary bg-pink-600 hover:bg-pink-700 px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-sm whitespace-nowrap"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.2s forwards', opacity: 0 }}
            >
              Write Post
            </button>
          </div>
        </header>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 bg-pink-600 rounded-full" style={{ animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post, idx) => (
              <BlogCard
                key={post._id}
                post={post}
                idx={idx}
                onEdit={() => setEditingPost(post)}
                onDelete={() => handleDelete(post._id!)}
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 animate-in">
            <p className="text-gray-500 text-lg mb-6">
              {filter !== 'all' ? `No ${filter} posts` : 'No posts yet'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setEditingPost(emptyPost())}
                className="button-primary bg-pink-600 hover:bg-pink-700 px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-sm"
              >
                Write Your First Post
              </button>
            )}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {editingPost && (
        <BlogEditorModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={() => { setEditingPost(null); fetchPosts(); }}
        />
      )}
    </div>
  );
}