'use client';

import React, { useEffect, useRef, useState, ChangeEvent, DragEvent } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaAsset {
  html_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  alt_text: string | null;
  width: number | null;
  height: number | null;
  thumbnail_url?: string;
}

interface ContactInfoItem {
  icon: string;
  title: string;
  desc: string;
  isLink: boolean;
  link?: string;
  linkText: string;
}

interface FaqItem {
  icon: string;
  question: string;
  answer: string;
  delay?: string;
}

interface Section {
  id: number;
  section_id: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_ID = 3;
const MAX_IMAGE_SIZE = 30 * 1024 * 1024;
const MAX_VIDEO_SIZE = 24 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

function validateFile(file: File): string | null {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  if (!isImage && !isVideo) return `Unsupported file type: ${file.type}`;
  if (isVideo && file.size > MAX_VIDEO_SIZE) return `Video exceeds 24 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`;
  if (isImage && file.size > MAX_IMAGE_SIZE) return `Image exceeds 30 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`;
  return null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContactPageEditorPage() {
  const [mediaAssets, setMediaAssets] = useState<Record<string, MediaAsset>>({});
  const [sections, setSections] = useState<Record<string, Section>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [mediaRes, sectionsRes] = await Promise.all([
        fetch('/api/media?page=/contact'),
        fetch(`/api/admin/sections?pageId=${PAGE_ID}`),
      ]);

      if (!mediaRes.ok) throw new Error('Failed to fetch contact page media');
      if (!sectionsRes.ok) throw new Error('Failed to fetch contact page sections');

      const mediaData = await mediaRes.json();
      const sectionsData: Section[] = await sectionsRes.json();
      const sectionMap = sectionsData.reduce(
        (acc, curr) => ({ ...acc, [curr.section_id]: curr }),
        {} as Record<string, Section>
      );

      setMediaAssets(mediaData);
      setSections(sectionMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading contact page data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading contact page editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Edit Contact Page</h2>
        <p className="text-slate-400">Configure the hero image and content sections for your contact page</p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-200">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="grid gap-6">

        {/* ── 1. Hero Media Card ── */}
        <MediaEditorCard
          slotConfig={{
            id: 'hero-image',
            label: '🖼️ Hero Image / Video',
            description: 'Background media displayed at the top of the contact page',
            folder: 'contact',
          }}
          initialData={mediaAssets['hero-image']}
          onRefresh={fetchAll}
        />

        {/* ── 2. Hero Text Section ── */}
        <HeroSectionCard
          initialData={sections['hero']}
          onRefresh={fetchAll}
        />

        {/* ── 3. Contact Info Section ── */}
        <ContactInfoSectionCard
          initialData={sections['contact_info']}
          onRefresh={fetchAll}
        />

        {/* ── 4. FAQ Section ── */}
        <FaqSectionCard
          initialData={sections['faqs']}
          onRefresh={fetchAll}
        />

      </div>
    </div>
  );
}

// ─── Shared Helpers ───────────────────────────────────────────────────────────

function SectionCardShell({
  label,
  sectionId,
  description,
  children,
}: {
  label: string;
  sectionId: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg hover:border-slate-600 transition-colors">
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700/50 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-white">{label}</h3>
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        </div>
        <div className="text-xs font-mono bg-slate-900 px-3 py-1 rounded text-slate-300 border border-slate-600">
          {sectionId}
        </div>
      </div>
      {children}
    </div>
  );
}

function SaveBar({
  onSave,
  saving,
  disabled,
}: {
  onSave: () => void;
  saving: boolean;
  disabled: boolean;
}) {
  return (
    <div className="p-4 bg-slate-700/30 border-t border-slate-700 flex justify-end gap-3">
      <button
        onClick={onSave}
        disabled={disabled}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 flex items-center gap-2"
      >
        {saving ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : '💾 Save'}
      </button>
    </div>
  );
}

// ─── Media Editor Card (Hero Image) ──────────────────────────────────────────

type UploadMode = 'file' | 'url';

function MediaEditorCard({
  slotConfig,
  initialData,
  onRefresh,
}: {
  slotConfig: { id: string; label: string; description: string; folder: string };
  initialData?: MediaAsset;
  onRefresh: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [uploadMode, setUploadMode] = useState<UploadMode>('file');
  const [saving, setSaving] = useState(false);
  const [draggingMain, setDraggingMain] = useState(false);
  const [draggingThumb, setDraggingThumb] = useState(false);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedPreview, setStagedPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');
  const [stagedThumbFile, setStagedThumbFile] = useState<File | null>(null);
  const [stagedThumbPreview, setStagedThumbPreview] = useState<string | null>(null);
  const [thumbError, setThumbError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'done'>('idle');

  const [formData, setFormData] = useState({
    mediaUrl: initialData?.media_url || '',
    mediaType: (initialData?.media_type || 'image') as 'image' | 'video',
    altText: initialData?.alt_text || '',
    width: initialData?.width?.toString() || '',
    height: initialData?.height?.toString() || '',
    thumbnailUrl: initialData?.thumbnail_url || '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        mediaUrl: initialData.media_url,
        mediaType: initialData.media_type,
        altText: initialData.alt_text || '',
        width: initialData.width?.toString() || '',
        height: initialData.height?.toString() || '',
        thumbnailUrl: initialData.thumbnail_url || '',
      });
    }
  }, [initialData]);

  const stageFile = (file: File) => {
    setFileError('');
    const err = validateFile(file);
    if (err) { setFileError(err); return; }
    setStagedFile(file);
    setUploadProgress('idle');
    setFormData((prev) => ({ ...prev, mediaType: ALLOWED_VIDEO_TYPES.includes(file.type) ? 'video' : 'image' }));
    setStagedPreview(URL.createObjectURL(file));
  };

  const stageThumbFile = (file: File) => {
    setThumbError('');
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { setThumbError('Use JPG, PNG, WebP, GIF, or AVIF for thumbnails.'); return; }
    if (file.size > MAX_IMAGE_SIZE) { setThumbError('Thumbnail exceeds 30 MB limit.'); return; }
    setStagedThumbFile(file);
    setStagedThumbPreview(URL.createObjectURL(file));
  };

  const clearStaged = () => {
    if (stagedPreview) URL.revokeObjectURL(stagedPreview);
    if (stagedThumbPreview) URL.revokeObjectURL(stagedThumbPreview);
    setStagedFile(null); setStagedPreview(null); setFileError('');
    setStagedThumbFile(null); setStagedThumbPreview(null); setThumbError('');
    setUploadProgress('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (thumbInputRef.current) thumbInputRef.current.value = '';
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) stageFile(f); };
  const handleDropMain = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDraggingMain(false); const f = e.dataTransfer.files?.[0]; if (f) stageFile(f); };
  const handleThumbInput = (e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) stageThumbFile(f); };
  const handleDropThumb = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDraggingThumb(false); const f = e.dataTransfer.files?.[0]; if (f) stageThumbFile(f); };

  const handleSave = async () => {
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('pageRoute', '/contact');
      fd.append('htmlId', slotConfig.id);
      fd.append('mediaType', formData.mediaType);
      fd.append('altText', formData.altText);
      if (formData.width) fd.append('width', formData.width);
      if (formData.height) fd.append('height', formData.height);

      if (uploadMode === 'url') {
        if (!formData.mediaUrl) throw new Error('Please enter a media URL');
        fd.append('mediaUrl', formData.mediaUrl);
        if (formData.mediaType === 'video' && formData.thumbnailUrl) fd.append('thumbnailUrl', formData.thumbnailUrl);
      } else {
        if (stagedFile) { setUploadProgress('uploading'); fd.append('file', stagedFile); fd.append('folder', slotConfig.folder); }
        if (formData.mediaType === 'video' && stagedThumbFile) fd.append('thumbnailFile', stagedThumbFile);
      }

      const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error ?? 'Failed to save asset'); }
      const saved = await res.json();
      setFormData((prev) => ({ ...prev, mediaUrl: saved.media_url ?? prev.mediaUrl, thumbnailUrl: saved.thumbnail_url ?? prev.thumbnailUrl }));
      setUploadProgress('done');
      clearStaged();
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving asset');
      setUploadProgress('idle');
    } finally {
      setSaving(false);
    }
  };

  const canSave = !saving && ((uploadMode === 'file' && (stagedFile != null || stagedThumbFile != null)) || (uploadMode === 'url' && formData.mediaUrl.trim() !== ''));
  const previewUrl = stagedPreview ?? formData.mediaUrl;
  const thumbPreviewUrl = stagedThumbPreview ?? formData.thumbnailUrl;
  const previewType = stagedFile ? (ALLOWED_VIDEO_TYPES.includes(stagedFile.type) ? 'video' : 'image') : formData.mediaType;
  const isVideoMode = formData.mediaType === 'video';

  return (
    <SectionCardShell label={slotConfig.label} sectionId={slotConfig.id} description={slotConfig.description}>
      <div className="p-6 space-y-5">
        {/* Mode Toggle + Type Select */}
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-700 pb-4">
          <div className="flex gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1 w-fit">
            {(['file', 'url'] as UploadMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setUploadMode(m); clearStaged(); }}
                className={`px-4 py-1.5 text-sm font-medium rounded transition ${uploadMode === m ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {m === 'file' ? '📁 Upload file' : '🔗 Paste URL'}
              </button>
            ))}
          </div>
          <div className="flex-1 max-w-[200px]">
            <select
              className="w-full px-4 py-1.5 h-full bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              value={formData.mediaType}
              onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as 'image' | 'video' })}
            >
              <option value="image">📷 Image</option>
              <option value="video">🎥 Video</option>
            </select>
          </div>
        </div>

        {/* File Mode */}
        {uploadMode === 'file' && (
          <div className={`grid gap-4 ${isVideoMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            <div>
              <label className="block text-sm font-medium text-white mb-2">{isVideoMode ? 'Main Video File' : 'Image File'}</label>
              <input ref={fileInputRef} type="file" accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(',')} className="hidden" onChange={handleFileInput} />
              {!stagedFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg py-6 px-4 text-center cursor-pointer transition-all ${draggingMain ? 'border-blue-500 bg-blue-950/40' : 'border-slate-600 hover:border-blue-500 hover:bg-slate-900/60'}`}
                  onDragOver={(e) => { e.preventDefault(); setDraggingMain(true); }}
                  onDragLeave={() => setDraggingMain(false)}
                  onDrop={handleDropMain}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-2xl mb-2">{draggingMain ? '📂' : '☁️'}</div>
                  <p className="text-slate-300 text-sm font-medium mb-1">{draggingMain ? 'Drop main media' : 'Browse or drop'}</p>
                  <p className="text-slate-500 text-xs font-mono">Max: 30 MB image / 24 MB video</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-3 py-3 bg-slate-900 border border-slate-600 rounded-lg h-[108px]">
                  <span className="text-2xl">{previewType === 'video' ? '🎬' : '🖼️'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate font-medium">{stagedFile.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{formatBytes(stagedFile.size)}</p>
                  </div>
                  {uploadProgress === 'uploading' && <div className="w-4 h-4 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin shrink-0" />}
                  {uploadProgress === 'done' && <span className="text-green-400 text-sm shrink-0">✓</span>}
                  <button onClick={() => { setStagedFile(null); setStagedPreview(null); }} className="text-slate-400 hover:text-red-400 transition text-lg leading-none px-1 shrink-0">✕</button>
                </div>
              )}
              {fileError && <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5"><span>⚠️</span> {fileError}</p>}
            </div>

            {isVideoMode && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Thumbnail / Cover Image</label>
                <input ref={thumbInputRef} type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} className="hidden" onChange={handleThumbInput} />
                {!stagedThumbFile ? (
                  <div
                    className={`border-2 border-dashed rounded-lg py-6 px-4 text-center cursor-pointer transition-all ${draggingThumb ? 'border-amber-500 bg-amber-950/40' : 'border-slate-600 hover:border-amber-500 hover:bg-slate-900/60'}`}
                    onDragOver={(e) => { e.preventDefault(); setDraggingThumb(true); }}
                    onDragLeave={() => setDraggingThumb(false)}
                    onDrop={handleDropThumb}
                    onClick={() => thumbInputRef.current?.click()}
                  >
                    <div className="text-2xl mb-2">{draggingThumb ? '🖼️' : '📸'}</div>
                    <p className="text-slate-300 text-sm font-medium mb-1">{draggingThumb ? 'Drop thumbnail' : 'Browse cover image'}</p>
                    <p className="text-slate-500 text-xs font-mono">Shows before playing</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-3 bg-slate-900 border border-slate-600 rounded-lg h-[108px]">
                    <span className="text-2xl">📸</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate font-medium">{stagedThumbFile.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{formatBytes(stagedThumbFile.size)}</p>
                    </div>
                    {uploadProgress === 'uploading' && <div className="w-4 h-4 border-2 border-slate-600 border-t-amber-400 rounded-full animate-spin shrink-0" />}
                    {uploadProgress === 'done' && <span className="text-green-400 text-sm shrink-0">✓</span>}
                    <button onClick={() => { setStagedThumbFile(null); setStagedThumbPreview(null); }} className="text-slate-400 hover:text-red-400 transition text-lg leading-none px-1 shrink-0">✕</button>
                  </div>
                )}
                {thumbError && <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5"><span>⚠️</span> {thumbError}</p>}
              </div>
            )}
          </div>
        )}

        {/* URL Mode */}
        {uploadMode === 'url' && (
          <div className={`grid gap-4 ${isVideoMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Media URL</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://example.com/image.jpg"
                value={formData.mediaUrl}
                onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
              />
            </div>
            {isVideoMode && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Video Cover / Thumbnail URL</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/poster.jpg"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                />
              </div>
            )}
          </div>
        )}

        {/* Alt Text & Dimensions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6">
            <label className="block text-sm font-medium text-white mb-2">Alt Text (SEO / Accessibility)</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Describe the media content..."
              value={formData.altText}
              onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-white mb-2">Width (px)</label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g. 1920"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: e.target.value })}
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-white mb-2">Height (px)</label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g. 1080"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            />
          </div>
        </div>

        {/* Preview */}
        {(previewUrl || thumbPreviewUrl) && (
          <div className="pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Preview</p>
              {(stagedFile || stagedThumbFile) && <span className="text-xs text-amber-400 font-mono bg-amber-900/30 border border-amber-700/40 px-2 py-0.5 rounded">⏳ Unsaved Changes</span>}
              {!stagedFile && !stagedThumbFile && formData.mediaUrl && <span className="text-xs text-green-400 font-mono bg-green-900/30 border border-green-700/40 px-2 py-0.5 rounded">✓ Live</span>}
            </div>
            {previewType === 'video' ? (
              <video src={previewUrl || undefined} poster={thumbPreviewUrl || undefined} className="w-full h-56 bg-slate-900 rounded-lg object-cover border border-slate-600" controls />
            ) : (
              <img src={previewUrl || undefined} alt={formData.altText || 'Media preview'} className="w-full h-56 bg-slate-900 rounded-lg object-cover border border-slate-600" />
            )}
          </div>
        )}
      </div>
      <SaveBar onSave={handleSave} saving={saving} disabled={!canSave} />
    </SectionCardShell>
  );
}

// ─── Hero Text Section Card ───────────────────────────────────────────────────

function HeroSectionCard({ initialData, onRefresh }: { initialData?: Section; onRefresh: () => void }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || 'Get In Touch',
    content: initialData?.content || '',
  });

  useEffect(() => {
    if (initialData) setFormData({ title: initialData.title, content: initialData.content });
  }, [initialData]);

  const isDirty = formData.title !== (initialData?.title || 'Get In Touch') || formData.content !== (initialData?.content || '');

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/sections/${initialData?.id ?? ''}`, {
        method: initialData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: PAGE_ID,
          section_id: 'hero',
          title: formData.title,
          content: formData.content,
          metadata: initialData?.metadata ?? {},
        }),
      });
      if (!res.ok) throw new Error('Failed to save hero section');
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving section');
    } finally {
      setSaving(false);
    }
  };

  const words = formData.title.trim().split(' ');
  const lastWord = words[words.length - 1];
  const mainWords = words.slice(0, -1).join(' ');

  return (
    <SectionCardShell label="✍️ Hero Text" sectionId="hero" description="Headline and subtitle shown over the hero image">
      <div className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Page Title</label>
          <input
            type="text"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g. Get In Touch"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          {formData.title && (
            <p className="mt-2 text-xs text-slate-500 font-mono">
              Renders as: <span className="text-slate-300">{mainWords}</span>{' '}
              <span className="text-slate-400 line-through-1">[outlined]</span>{' '}
              <span className="text-white font-semibold">{lastWord}</span>
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Subtitle / Description</label>
          <textarea
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            rows={3}
            placeholder="Short tagline displayed below the headline..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
          <p className="mt-1 text-xs text-slate-500">{formData.content.length} characters</p>
        </div>

        {/* Live Preview */}
        <div className="pt-4 border-t border-slate-700">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Layout Preview</p>
          <div className="bg-slate-900 rounded-lg p-5 border border-slate-700">
            <span className="inline-block text-[9px] font-bold tracking-[0.2em] uppercase bg-white text-black px-3 py-1.5 rounded-full mb-3">
              Support & Inquiries
            </span>
            <h1 className="text-2xl font-extrabold uppercase tracking-tighter text-white leading-tight">
              {mainWords}{' '}
              <span className="text-transparent" style={{ WebkitTextStroke: '1px #ffffff' }}>{lastWord || '—'}</span>
            </h1>
            {formData.content && (
              <p className="mt-2 text-white/70 text-xs leading-relaxed border-l-2 border-amber-400 pl-3 max-w-sm">
                {formData.content}
              </p>
            )}
          </div>
        </div>
      </div>
      <SaveBar onSave={handleSave} saving={saving} disabled={!isDirty || saving} />
    </SectionCardShell>
  );
}

// ─── Contact Info Section Card ────────────────────────────────────────────────

const DEFAULT_INFO_ITEM: ContactInfoItem = { icon: 'fa-solid fa-phone', title: '', desc: '', isLink: false, link: '', linkText: '' };

function ContactInfoSectionCard({ initialData, onRefresh }: { initialData?: Section; onRefresh: () => void }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || 'How Can We Help?',
    content: initialData?.content || '',
    items: (initialData?.metadata?.items as ContactInfoItem[]) || [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
        items: (initialData.metadata?.items as ContactInfoItem[]) || [],
      });
    }
  }, [initialData]);

  const updateItem = (i: number, field: keyof ContactInfoItem, value: any) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[i] = { ...items[i], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => setFormData((prev) => ({ ...prev, items: [...prev.items, { ...DEFAULT_INFO_ITEM }] }));
  const removeItem = (i: number) => setFormData((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/sections/${initialData?.id ?? ''}`, {
        method: initialData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: PAGE_ID,
          section_id: 'contact_info',
          title: formData.title,
          content: formData.content,
          metadata: { items: formData.items },
        }),
      });
      if (!res.ok) throw new Error('Failed to save contact info section');
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCardShell label="📬 Contact Info Section" sectionId="contact_info" description="Left-column info cards and section heading shown alongside the inquiry form">
      <div className="p-6 space-y-5">
        {/* Title + Intro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Section Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g. How Can We Help?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Intro Text</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Short paragraph above the info cards..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
        </div>

        {/* Info Items */}
        <div className="border-t border-slate-700 pt-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-white">Contact Info Cards</p>
              <p className="text-xs text-slate-500 mt-0.5">Each card appears as a hoverable tile (phone, email, location, etc.)</p>
            </div>
            <button
              onClick={addItem}
              className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center gap-1.5"
            >
              + Add Card
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg">
                <p className="text-slate-500 text-sm">No info cards yet. Click "Add Card" to get started.</p>
              </div>
            )}
            {formData.items.map((item, i) => (
              <div key={i} className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Card {i + 1}</span>
                  <button onClick={() => removeItem(i)} className="text-xs text-red-400 hover:text-red-300 transition font-medium px-2 py-1 rounded hover:bg-red-900/20">
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Font Awesome Icon Class</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="fa-solid fa-phone"
                      value={item.icon}
                      onChange={(e) => updateItem(i, 'icon', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Card Title</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="e.g. Call Us"
                      value={item.title}
                      onChange={(e) => updateItem(i, 'title', e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Short description text..."
                      value={item.desc}
                      onChange={(e) => updateItem(i, 'desc', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Display Text / Label</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="e.g. +1 (555) 000-0000"
                      value={item.linkText}
                      onChange={(e) => updateItem(i, 'linkText', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div
                        className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${item.isLink ? 'bg-blue-600' : 'bg-slate-600'}`}
                        onClick={() => updateItem(i, 'isLink', !item.isLink)}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${item.isLink ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-xs font-medium text-slate-300">Is a link?</span>
                    </label>
                  </div>
                  {item.isLink && (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">href (URL or mailto:)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="mailto:hello@example.com"
                        value={item.link || ''}
                        onChange={(e) => updateItem(i, 'link', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SaveBar onSave={handleSave} saving={saving} disabled={saving} />
    </SectionCardShell>
  );
}

// ─── FAQ Section Card ─────────────────────────────────────────────────────────

const DEFAULT_FAQ_ITEM: FaqItem = { icon: 'fa-regular fa-circle-question', question: '', answer: '', delay: '0ms' };
const DELAY_OPTIONS = ['0ms', '100ms', '200ms', '300ms', '400ms', '500ms'];

function FaqSectionCard({ initialData, onRefresh }: { initialData?: Section; onRefresh: () => void }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || 'FAQ Quick Answers',
    content: initialData?.content || '',
    items: (initialData?.metadata?.items as FaqItem[]) || [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
        items: (initialData.metadata?.items as FaqItem[]) || [],
      });
    }
  }, [initialData]);

  const updateItem = (i: number, field: keyof FaqItem, value: string) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[i] = { ...items[i], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => setFormData((prev) => ({ ...prev, items: [...prev.items, { ...DEFAULT_FAQ_ITEM }] }));
  const removeItem = (i: number) => setFormData((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/sections/${initialData?.id ?? ''}`, {
        method: initialData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: PAGE_ID,
          section_id: 'faqs',
          title: formData.title,
          content: formData.content,
          metadata: { items: formData.items },
        }),
      });
      if (!res.ok) throw new Error('Failed to save FAQ section');
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCardShell label="❓ FAQ Section" sectionId="faqs" description="Frequently asked questions displayed as hoverable cards at the bottom of the contact page">
      <div className="p-6 space-y-5">
        {/* Title + Intro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Section Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g. FAQ Quick Answers"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Section Description</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Short paragraph below the FAQ heading..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
        </div>

        {/* FAQ Items */}
        <div className="border-t border-slate-700 pt-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-white">FAQ Cards</p>
              <p className="text-xs text-slate-500 mt-0.5">Each card shows a question, answer, and icon in a 3-column grid</p>
            </div>
            <button
              onClick={addItem}
              className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center gap-1.5"
            >
              + Add FAQ
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg">
                <p className="text-slate-500 text-sm">No FAQ cards yet. Click "Add FAQ" to get started.</p>
              </div>
            )}
            {formData.items.map((item, i) => (
              <div key={i} className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">FAQ {i + 1}</span>
                  <button onClick={() => removeItem(i)} className="text-xs text-red-400 hover:text-red-300 transition font-medium px-2 py-1 rounded hover:bg-red-900/20">
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Font Awesome Icon Class</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="fa-regular fa-circle-question"
                      value={item.icon}
                      onChange={(e) => updateItem(i, 'icon', e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Question</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="e.g. How far in advance should I book?"
                      value={item.question}
                      onChange={(e) => updateItem(i, 'question', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Answer</label>
                    <textarea
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                      rows={3}
                      placeholder="Write a concise, helpful answer..."
                      value={item.answer}
                      onChange={(e) => updateItem(i, 'answer', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Reveal Delay</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                      value={item.delay || '0ms'}
                      onChange={(e) => updateItem(i, 'delay', e.target.value)}
                    >
                      {DELAY_OPTIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-[10px] text-slate-500">Stagger animation</p>
                  </div>
                </div>

                {/* Mini Preview */}
                {(item.question || item.answer) && (
                  <div className="mt-2 bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-sm font-bold uppercase tracking-tight text-white w-3/4">{item.question || '—'}</p>
                      <span className="text-slate-500 text-sm">{item.icon ? <i className={item.icon}></i> : '?'}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.answer || '—'}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <SaveBar onSave={handleSave} saving={saving} disabled={saving} />
    </SectionCardShell>
  );
}