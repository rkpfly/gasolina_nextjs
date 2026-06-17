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
  thumbnail_url?: string; // Added for video posters
}

const HOME_SLOTS = [
  { id: 'hero-video',  label: '🎬 Hero Video',   description: 'Main background video at the top', folder: 'home' },
  { id: 'cinematic-1', label: '✨ Highlight 1',   description: 'First cinematic showcase',        folder: 'home' },
  { id: 'cinematic-2', label: '✨ Highlight 2',   description: 'Second cinematic showcase',       folder: 'home' },
  { id: 'newsletter-visual', label: '📰 Newsletter Visual',   description: 'Visual for the newsletter section',       folder: 'home' },
];

const MAX_IMAGE_SIZE = 30 * 1024 * 1024;  // 30 MB
const MAX_VIDEO_SIZE = 30 * 1024 * 1024;  // 30 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
const ALLOWED_VIDEO_TYPES = [
  'video/mp4', 
  'video/webm', 
  'video/ogg', 
  'video/quicktime',
  'audio/x-m4a', // Add this for .m4a files
  'audio/mp4'    // Add this as a fallback for mp4 audio
];

function validateFile(file: File): string | null {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return `Unsupported file type: ${file.type}. Use JPG, PNG, WebP, GIF, AVIF, MP4, WebM, or MOV.`;
  }
  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return `Video exceeds the 30 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`;
  }
  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return `Image exceeds the 30 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`;
  }
  return null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePageEditorPage() {
  const [mediaAssets, setMediaAssets] = useState<Record<string, MediaAsset>>({});
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => { fetchHomePageMedia(); }, []);

  const fetchHomePageMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/media?page=/home');
      if (!res.ok) throw new Error('Failed to fetch home page media');
      setMediaAssets(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading home page data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading home page editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Edit Home Page Media</h2>
        <p className="text-slate-400">Configure media assets for your home page sections</p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-200">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="grid gap-6">
        {HOME_SLOTS.map((slot) => (
          <MediaEditorCard
            key={slot.id}
            slotConfig={slot}
            initialData={mediaAssets[slot.id]}
            onRefresh={fetchHomePageMedia}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

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
  const [saving, setSaving]         = useState(false);
  
  // Drag states
  const [draggingMain, setDraggingMain]   = useState(false);
  const [draggingThumb, setDraggingThumb] = useState(false);

  // Staged Main file
  const [stagedFile, setStagedFile]       = useState<File | null>(null);
  const [stagedPreview, setStagedPreview] = useState<string | null>(null);
  const [fileError, setFileError]         = useState('');

  // Staged Thumbnail file
  const [stagedThumbFile, setStagedThumbFile]       = useState<File | null>(null);
  const [stagedThumbPreview, setStagedThumbPreview] = useState<string | null>(null);
  const [thumbError, setThumbError]                 = useState('');

  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'done'>('idle');

  const [formData, setFormData] = useState({
    mediaUrl:  initialData?.media_url   || '',
    mediaType: (initialData?.media_type || 'image') as 'image' | 'video',
    altText:   initialData?.alt_text    || '',
    width:     initialData?.width?.toString()  || '',
    height:    initialData?.height?.toString() || '',
    thumbnailUrl: initialData?.thumbnail_url || '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        mediaUrl:  initialData.media_url,
        mediaType: initialData.media_type,
        altText:   initialData.alt_text    || '',
        width:     initialData.width?.toString()  || '',
        height:    initialData.height?.toString() || '',
        thumbnailUrl: initialData.thumbnail_url || '',
      });
    }
  }, [initialData]);

  // ── File staging ────────────────────────────────────────────────────────────

  const stageFile = (file: File) => {
    setFileError('');
    const err = validateFile(file);
    if (err) { setFileError(err); return; }

    setStagedFile(file);
    setUploadProgress('idle');

    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    setFormData((prev) => ({ ...prev, mediaType: isVideo ? 'video' : 'image' }));

    const objectUrl = URL.createObjectURL(file);
    setStagedPreview(objectUrl);
  };

  const stageThumbFile = (file: File) => {
    setThumbError('');
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setThumbError(`Unsupported thumbnail. Use JPG, PNG, WebP, GIF, or AVIF.`);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setThumbError(`Thumbnail exceeds the 30 MB limit.`);
      return;
    }
    setStagedThumbFile(file);
    const objectUrl = URL.createObjectURL(file);
    setStagedThumbPreview(objectUrl);
  };

  const clearStaged = () => {
    if (stagedPreview) URL.revokeObjectURL(stagedPreview);
    if (stagedThumbPreview) URL.revokeObjectURL(stagedThumbPreview);
    
    setStagedFile(null);
    setStagedPreview(null);
    setFileError('');
    
    setStagedThumbFile(null);
    setStagedThumbPreview(null);
    setThumbError('');

    setUploadProgress('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (thumbInputRef.current) thumbInputRef.current.value = '';
  };

  // Main Drop/Input Handlers
  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) stageFile(file);
  };
  const handleDropMain = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggingMain(false);
    const file = e.dataTransfer.files?.[0];
    if (file) stageFile(file);
  };

  // Thumbnail Drop/Input Handlers
  const handleThumbInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) stageThumbFile(file);
  };
  const handleDropThumb = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggingThumb(false);
    const file = e.dataTransfer.files?.[0];
    if (file) stageThumbFile(file);
  };

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    try {
      setSaving(true);
      const fd = new FormData();

      fd.append('pageRoute', '/home');
      fd.append('htmlId',    slotConfig.id);
      fd.append('mediaType', formData.mediaType);
      fd.append('altText',   formData.altText);
      if (formData.width)  fd.append('width',  formData.width);
      if (formData.height) fd.append('height', formData.height);

      if (uploadMode === 'url') {
        if (!formData.mediaUrl) throw new Error('Please enter a media URL');
        fd.append('mediaUrl', formData.mediaUrl);
        if (formData.mediaType === 'video' && formData.thumbnailUrl) {
          fd.append('thumbnailUrl', formData.thumbnailUrl);
        }
      } else {
        if (stagedFile) {
          setUploadProgress('uploading');
          fd.append('file', stagedFile);
          fd.append('folder', slotConfig.folder);
        }
        if (formData.mediaType === 'video' && stagedThumbFile) {
          fd.append('thumbnailFile', stagedThumbFile); 
        }
      }

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Failed to save asset');
      }

      const saved = await res.json();

      setFormData((prev) => ({ 
        ...prev, 
        mediaUrl: saved.media_url ?? prev.mediaUrl,
        thumbnailUrl: saved.thumbnail_url ?? prev.thumbnailUrl 
      }));
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

  const canSave = 
    !saving && 
    ((uploadMode === 'file' && (stagedFile != null || stagedThumbFile != null)) || 
     (uploadMode === 'url'  && formData.mediaUrl.trim() !== ''));

  const previewUrl      = stagedPreview ?? formData.mediaUrl;
  const thumbPreviewUrl = stagedThumbPreview ?? formData.thumbnailUrl;
  
  const previewType = stagedFile 
    ? (ALLOWED_VIDEO_TYPES.includes(stagedFile.type) ? 'video' : 'image') 
    : formData.mediaType;

  const isVideoMode = formData.mediaType === 'video';

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg hover:border-slate-600 transition-colors">
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700/50 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-white">{slotConfig.label}</h3>
          <p className="text-sm text-slate-400 mt-1">{slotConfig.description}</p>
        </div>
        <div className="text-xs font-mono bg-slate-900 px-3 py-1 rounded text-slate-300 border border-slate-600">
          {slotConfig.id}
        </div>
      </div>

      <div className="p-6 space-y-5">
        
        {/* Top Controls Row */}
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-700 pb-4">
          <div className="flex gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1 w-fit">
            {(['file', 'url'] as UploadMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setUploadMode(m); clearStaged(); }}
                className={`px-4 py-1.5 text-sm font-medium rounded transition ${
                  uploadMode === m ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 'file' ? '📁 Upload file' : '🔗 Paste URL'}
              </button>
            ))}
          </div>
          <div className="flex-1 max-w-[200px]">
            <select 
              className="w-full px-4 py-1.5 h-full bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              value={formData.mediaType}
              onChange={(e) => setFormData({...formData, mediaType: e.target.value as 'image' | 'video'})}
            >
              <option value="image">📷 Image</option>
              <option value="video">🎥 Video</option>
            </select>
          </div>
        </div>

        {/* ── File mode ── */}
        {uploadMode === 'file' && (
          <div className={`grid gap-4 ${isVideoMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            
            {/* Main Media Column */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {isVideoMode ? 'Main Video File' : 'Image File'}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(',')}
                className="hidden"
                onChange={handleFileInput}
              />
              {!stagedFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg py-6 px-4 text-center cursor-pointer transition-all ${
                    draggingMain ? 'border-blue-500 bg-blue-950/40' : 'border-slate-600 hover:border-blue-500 hover:bg-slate-900/60'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDraggingMain(true); }}
                  onDragLeave={() => setDraggingMain(false)}
                  onDrop={handleDropMain}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-2xl mb-2">{draggingMain ? '📂' : '☁️'}</div>
                  <p className="text-slate-300 text-sm font-medium mb-1 line-clamp-1">
                    {draggingMain ? 'Drop main media' : 'Browse or drop'}
                  </p>
                  <p className="text-slate-500 text-xs font-mono truncate">Max: 30MB</p>
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

            {/* Thumbnail Column (Videos Only) */}
            {isVideoMode && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <label className="block text-sm font-medium text-white mb-2">
                  Thumbnail / Cover Image
                </label>
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  className="hidden"
                  onChange={handleThumbInput}
                />
                {!stagedThumbFile ? (
                  <div
                    className={`border-2 border-dashed rounded-lg py-6 px-4 text-center cursor-pointer transition-all ${
                      draggingThumb ? 'border-amber-500 bg-amber-950/40' : 'border-slate-600 hover:border-amber-500 hover:bg-slate-900/60'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDraggingThumb(true); }}
                    onDragLeave={() => setDraggingThumb(false)}
                    onDrop={handleDropThumb}
                    onClick={() => thumbInputRef.current?.click()}
                  >
                    <div className="text-2xl mb-2">{draggingThumb ? '🖼️' : '📸'}</div>
                    <p className="text-slate-300 text-sm font-medium mb-1 line-clamp-1">
                      {draggingThumb ? 'Drop thumbnail' : 'Browse cover image'}
                    </p>
                    <p className="text-slate-500 text-xs font-mono truncate">Shows before playing</p>
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

        {/* ── URL mode ── */}
        {uploadMode === 'url' && (
          <div className={`grid gap-4 ${isVideoMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Media URL</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://example.com/media.mp4"
                value={formData.mediaUrl}
                onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})}
              />
            </div>
            {isVideoMode && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <label className="block text-sm font-medium text-white mb-2">Video Cover / Thumbnail URL</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/poster.jpg"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
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
              onChange={(e) => setFormData({...formData, altText: e.target.value})}
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-white mb-2">Width (px)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g. 1920"
              value={formData.width}
              onChange={(e) => setFormData({...formData, width: e.target.value})}
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-white mb-2">Height (px)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g. 1080"
              value={formData.height}
              onChange={(e) => setFormData({...formData, height: e.target.value})}
            />
          </div>
        </div>

        {/* Preview */}
        {(previewUrl || thumbPreviewUrl) && (
          <div className="pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Preview</p>
              {(stagedFile || stagedThumbFile) && <span className="text-xs text-amber-400 font-mono bg-amber-900/30 border border-amber-700/40 px-2 py-0.5 rounded">⏳ Unsaved Changes</span>}
              {!stagedFile && !stagedThumbFile && (formData.mediaUrl || formData.thumbnailUrl) && <span className="text-xs text-green-400 font-mono bg-green-900/30 border border-green-700/40 px-2 py-0.5 rounded">✓ Live</span>}
            </div>
            {previewType === 'video' ? (
              <video 
                src={previewUrl || undefined} 
                poster={thumbPreviewUrl || undefined} 
                className="w-full h-56 bg-slate-900 rounded-lg object-cover border border-slate-600" 
                controls 
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={previewUrl || undefined} 
                alt={formData.altText || 'Media preview'} 
                className="w-full h-56 bg-slate-900 rounded-lg object-cover border border-slate-600" 
              />
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-700/30 border-t border-slate-700 flex justify-end gap-3">
        <button 
          onClick={handleSave}
          disabled={!canSave}
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
    </div>
  );
}