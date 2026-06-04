"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// ─── Types & Configuration ──────────────────────────────────────────────
interface Offer {
  id?: string;
  slug?: string;
  thumbnail_url?: string;
  offer_title: string;
  short_description?: string;
  expiry_date: string;
  start_date?: string;
  offer_code?: string;
  description?: any;
  how_to_redeem?: any;
  terms_and_conditions?: any;
  offer_type?: string;
  clicks?: number;
  redemptions?: number;
  views?: number;
  is_active: boolean;
  is_featured: boolean;
  category?: string;
  tags?: string[];
  sponsor_name?: string;
  sponsor_logo_url?: string;
  sponsor_website?: string;
  background_color?: string;
  text_color?: string;
  priority?: number;
  max_redemptions?: number;
  redemption_limit_per_user?: number;
  external_link?: string;
  seo?: {
    title?: string;
    description?: string;
  };
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Tiptap Rich Text Editor Component ──────────────────────────────────
const RichTextEditor = ({ value, onChange }: { value: any, onChange: (val: any) => void }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-invert max-w-none focus:outline-none min-h-[120px] p-4 text-white',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  if (!editor) return null;

  return (
    <div className="w-full bg-black border border-gray-800 rounded-sm overflow-hidden flex flex-col focus-within:border-pink-500/50 transition-colors">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-800 bg-gray-950">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-colors ${editor.isActive('bold') ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-3 py-1.5 text-xs italic font-serif rounded-sm transition-colors ${editor.isActive('italic') ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>I</button>
        <div className="w-[1px] h-4 bg-gray-800 mx-1"></div>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-3 py-1.5 text-xs rounded-sm transition-colors flex items-center gap-1 ${editor.isActive('bulletList') ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>• Bullet</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`px-3 py-1.5 text-xs rounded-sm transition-colors flex items-center gap-1 ${editor.isActive('orderedList') ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>1. Number</button>
      </div>
      <EditorContent editor={editor} className="bg-black text-sm cursor-text" />
    </div>
  );
};

// ─── Main Admin Component ─────────────────────────────────────────────────────
export default function OffersAdmin() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSort, setCurrentSort] = useState('created_at');
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // File States
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [sponsorLogoFile, setSponsorLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const sponsorLogoInputRef = useRef<HTMLInputElement>(null);

  const fetchOffers = async (sort = 'created_at') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/offers?sort=${sort}`);
      const data = await res.json();
      
      // Ensure seo is an object if it comes back as a stringified JSON from the database
      const parsedOffers = data.map((offer: Offer) => ({
        ...offer,
        seo: typeof offer.seo === 'string' ? JSON.parse(offer.seo) : offer.seo || {}
      }));
      
      setOffers(parsedOffers);
      setCurrentSort(sort);
    } catch (err) {
      console.error("Failed to fetch offers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchOffers(); 
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this offer? This cannot be undone.")) return;
    await fetch(`/api/admin/offers?id=${id}`, { method: 'DELETE' });
    fetchOffers(currentSort);
  };

  const handleDateToInput = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  // Helper function to initialize a new offer
  const getNewOfferTemplate = (): Offer => ({
    is_active: true, 
    is_featured: false, 
    offer_title: '', 
    slug: '',
    expiry_date: '',
    seo: { title: '', description: '' }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black text-white" style={{
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,0,127,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,0,127,0.02) 0%, transparent 50%)'
    }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        .animate-in { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-card { animation: fadeInScale 0.5s ease-out forwards; }
        .card-hover { transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1); }
        .card-hover:hover { border-color: rgba(255, 0, 127, 0.4); transform: translateY(-4px); box-shadow: 0 12px 24px rgba(255, 0, 127, 0.08); }
        .button-primary { position: relative; overflow: hidden; transition: all 0.2s ease; }
        .button-primary::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.1); transition: left 0.3s ease; z-index: -1; }
        .button-primary:hover::before { left: 100%; }
        .sort-button { transition: all 0.2s ease; position: relative; }
        .sort-button:hover { border-color: rgba(255, 0, 127, 0.3); }
        .modal-backdrop { animation: fadeInUp 0.3s ease-out; }
        .modal-content { animation: fadeInScale 0.3s ease-out; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: rgba(255, 0, 127, 0.5) !important; background-color: rgba(255, 0, 127, 0.02) !important; transition: all 0.2s ease; }
        
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .ProseMirror p { margin-bottom: 0.5rem; }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12 animate-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2">Offers Admin</h1>
              <div className="w-12 h-1 bg-gradient-to-r from-pink-600 to-transparent mb-8"></div>
              
              <div className="flex flex-wrap gap-3">
                {['created_at', 'expiry_date', 'priority', 'clicks'].map((s, idx) => (
                  <button 
                    key={s}
                    onClick={() => fetchOffers(s)}
                    className={`sort-button px-4 py-2 text-xs font-semibold uppercase tracking-widest border rounded-sm transition-all ${
                      currentSort === s 
                        ? 'bg-pink-600 border-pink-600 text-white' 
                        : 'border-gray-700 text-gray-400 hover:text-gray-300 hover:border-gray-600'
                    }`}
                    style={{ animation: `slideInLeft 0.4s ease-out forwards`, animationDelay: `${idx * 0.05}s` }}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setEditingOffer(getNewOfferTemplate())} 
              className="button-primary bg-pink-600 hover:bg-pink-700 px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-sm whitespace-nowrap"
            >
              Create Offer
            </button>
          </div>
        </header>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 bg-pink-600 rounded-full" style={{ animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}></div>
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.map((offer: any, idx: number) => (
              <div key={offer.id} className="card-hover animate-card group" style={{ animationDelay: `${Math.min(idx * 0.08, 0.4)}s` }}>
                <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden h-full flex flex-col transition-colors duration-300">
                  
                  <div className="relative aspect-[16/9] bg-gray-900 overflow-hidden flex-shrink-0">
                    <img src={offer.thumbnail_url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt={offer.offer_title}/>
                    <div className="absolute top-3 right-3 flex gap-2">
                      {!offer.is_active && <span className="bg-red-600/90 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-sm">Draft</span>}
                      {offer.is_featured && <span className="bg-pink-600/90 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-sm">Featured</span>}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-3">
                      {offer.category && <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border border-gray-700 text-gray-400 rounded-sm">{offer.category}</span>}
                      {offer.offer_type && <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{offer.offer_type}</span>}
                    </div>

                    <h3 className="font-semibold text-lg tracking-tight mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors">{offer.offer_title}</h3>
                    <p className="text-gray-500 text-xs mb-4 line-clamp-2">{offer.short_description}</p>

                    <div className="grid grid-cols-3 gap-2 mb-6 flex-grow">
                      <div className="bg-black border border-gray-800 rounded-sm p-2 text-center">
                        <p className="text-[10px] text-gray-500 uppercase">Views</p>
                        <p className="font-mono text-sm">{offer.views}</p>
                      </div>
                      <div className="bg-black border border-gray-800 rounded-sm p-2 text-center">
                        <p className="text-[10px] text-gray-500 uppercase">Clicks</p>
                        <p className="font-mono text-sm">{offer.clicks}</p>
                      </div>
                      <div className="bg-black border border-gray-800 rounded-sm p-2 text-center">
                        <p className="text-[10px] text-gray-500 uppercase">Claims</p>
                        <p className="font-mono text-sm">{offer.redemptions}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800/50 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">Expires:</span>
                        <span className={`font-mono ${new Date(offer.expiry_date) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
                          {new Date(offer.expiry_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingOffer(offer)} className="flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/60 rounded-sm transition-all">Edit</button>
                        <button onClick={() => handleDelete(offer.id)} className="flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 rounded-sm transition-all">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && offers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 animate-in">
            <p className="text-gray-500 text-lg mb-6">No active offers found</p>
            <button onClick={() => setEditingOffer(getNewOfferTemplate())} className="button-primary bg-pink-600 hover:bg-pink-700 px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-sm">
              Create First Offer
            </button>
          </div>
        )}
      </div>

      {editingOffer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="bg-gray-950 border border-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-content shadow-2xl">
            
            <div className="sticky top-0 bg-gray-950/90 backdrop-blur-md border-b border-gray-800 px-8 py-6 z-10 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{editingOffer.id ? 'Edit Offer' : 'Create New Offer'}</h2>
                <p className="text-gray-500 text-sm mt-1">Configure parameters, media, and rules.</p>
              </div>
              <button onClick={() => setEditingOffer(null)} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>

            <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  const fd = new FormData();
                  
                  Object.entries(editingOffer).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && key !== 'thumbnail_url' && key !== 'sponsor_logo_url') {
                      if (typeof value === 'object') {
                        fd.append(key, JSON.stringify(value));
                      } else {
                        fd.append(key, value.toString());
                      }
                    }
                  });

                  if (thumbFile) fd.append('thumbnailFile', thumbFile);
                  else if (editingOffer.thumbnail_url) fd.append('thumbnail_url', editingOffer.thumbnail_url);

                  if (sponsorLogoFile) fd.append('sponsorLogoFile', sponsorLogoFile);
                  else if (editingOffer.sponsor_logo_url) fd.append('sponsor_logo_url', editingOffer.sponsor_logo_url);

                  const res = await fetch('/api/admin/offers', { method: 'POST', body: fd });
                  if (!res.ok) throw new Error("Failed to save offer");
                  
                  fetchOffers(currentSort);
                  setEditingOffer(null);
                  setThumbFile(null);
                  setSponsorLogoFile(null);
                } catch (err) {
                  alert("Error saving offer");
                } finally {
                  setIsSaving(false);
                }
              }} 
              className="p-8 space-y-10"
            >
              
              {/* SECTION: Basic Info */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500 border-b border-gray-800/60 pb-2">1. Core Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Offer Title <span className="text-pink-500">*</span></label>
                    <input required className="w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white placeholder-gray-600" placeholder="e.g. 50% Off Summer Cocktails" value={editingOffer.offer_title || ''} onChange={e => setEditingOffer({...editingOffer, offer_title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">URL Slug <span className="text-pink-500">*</span></label>
                    <input required className="w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white placeholder-gray-600" placeholder="e.g. 50-off-summer-cocktails" value={editingOffer.slug || ''} onChange={e => setEditingOffer({...editingOffer, slug: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Short Description</label>
                  <input className="w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white placeholder-gray-600" placeholder="A quick summary for the card preview" value={editingOffer.short_description || ''} onChange={e => setEditingOffer({...editingOffer, short_description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Category</label>
                    <input className="w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white placeholder-gray-600" placeholder="e.g. Drinks, VIP, Entry" value={editingOffer.category || ''} onChange={e => setEditingOffer({...editingOffer, category: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Offer Type</label>
                    <select className="w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white" value={editingOffer.offer_type || ''} onChange={e => setEditingOffer({...editingOffer, offer_type: e.target.value})}>
                      <option value="">Select Type...</option>
                      <option value="Discount">Discount</option>
                      <option value="BOGO">Buy One Get One</option>
                      <option value="Freebie">Freebie</option>
                      <option value="Access">Special Access</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION: Media */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500 border-b border-gray-800/60 pb-2">2. Media & Branding</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Main Thumbnail <span className="text-pink-500">*</span></label>
                    <input type="file" className="hidden" ref={thumbInputRef} accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={(e) => { if (e.target.files?.[0]) setThumbFile(e.target.files[0]); }}/>
                    {thumbFile ? (
                      <div className="flex items-center gap-3 px-3 py-3 bg-black border border-gray-800 rounded-sm">
                        <span className="text-xl">🖼️</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">{thumbFile.name}</p>
                          <p className="text-[10px] text-gray-500">{formatBytes(thumbFile.size)}</p>
                        </div>
                        <button type="button" onClick={() => setThumbFile(null)} className="text-gray-500 hover:text-red-400">✕</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => thumbInputRef.current?.click()} className="flex-shrink-0 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs px-4 rounded-sm">Upload File</button>
                        <input className="w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white placeholder-gray-600" placeholder="Or paste URL" value={editingOffer.thumbnail_url || ''} onChange={e => setEditingOffer({...editingOffer, thumbnail_url: e.target.value})} required={!thumbFile} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Sponsor Logo (Optional)</label>
                    <input type="file" className="hidden" ref={sponsorLogoInputRef} accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={(e) => { if (e.target.files?.[0]) setSponsorLogoFile(e.target.files[0]); }}/>
                    {sponsorLogoFile ? (
                      <div className="flex items-center gap-3 px-3 py-3 bg-black border border-gray-800 rounded-sm">
                        <span className="text-xl">🏢</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">{sponsorLogoFile.name}</p>
                          <p className="text-[10px] text-gray-500">{formatBytes(sponsorLogoFile.size)}</p>
                        </div>
                        <button type="button" onClick={() => setSponsorLogoFile(null)} className="text-gray-500 hover:text-red-400">✕</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => sponsorLogoInputRef.current?.click()} className="flex-shrink-0 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs px-4 rounded-sm">Upload File</button>
                        <input className="w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white placeholder-gray-600" placeholder="Or paste URL" value={editingOffer.sponsor_logo_url || ''} onChange={e => setEditingOffer({...editingOffer, sponsor_logo_url: e.target.value})} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION: Logistics */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500 border-b border-gray-800/60 pb-2">3. Rules & Logistics</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Promo Code</label>
                    <input className="w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white" placeholder="e.g. VIP2024" value={editingOffer.offer_code || ''} onChange={e => setEditingOffer({...editingOffer, offer_code: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Limit</label>
                    <input type="number" className="w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white" placeholder="Max redemptions" value={editingOffer.max_redemptions || ''} onChange={e => setEditingOffer({...editingOffer, max_redemptions: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Limit per user</label>
                    <input type="number" className="w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white" placeholder="Default 1" value={editingOffer.redemption_limit_per_user || 1} onChange={e => setEditingOffer({...editingOffer, redemption_limit_per_user: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Priority (Sort)</label>
                    <input type="number" className="w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white" placeholder="0" value={editingOffer.priority || 0} onChange={e => setEditingOffer({...editingOffer, priority: parseInt(e.target.value)})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Start Date</label>
                    <input 
                      type="datetime-local" 
                      className="w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white" 
                      value={handleDateToInput(editingOffer.start_date)} 
                      onChange={e => setEditingOffer({
                          ...editingOffer, 
                          start_date: e.target.value ? new Date(e.target.value).toISOString() : ''
                      })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Expiry Date <span className="text-pink-500">*</span></label>
                    <input 
                      required 
                      type="datetime-local" 
                      className="w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white" 
                      value={handleDateToInput(editingOffer.expiry_date)} 
                      onChange={e => setEditingOffer({
                          ...editingOffer, 
                          expiry_date: e.target.value ? new Date(e.target.value).toISOString() : ''
                      })} 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Tiptap Editors */}
              <div className="space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500 border-b border-gray-800/60 pb-2">4. Long Form Content</p>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Full Description</label>
                  <RichTextEditor 
                    value={editingOffer.description} 
                    onChange={(val) => setEditingOffer({...editingOffer, description: val})} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">How to Redeem</label>
                    <RichTextEditor 
                      value={editingOffer.how_to_redeem} 
                      onChange={(val) => setEditingOffer({...editingOffer, how_to_redeem: val})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Terms & Conditions</label>
                    <RichTextEditor 
                      value={editingOffer.terms_and_conditions} 
                      onChange={(val) => setEditingOffer({...editingOffer, terms_and_conditions: val})} 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: SEO & Meta */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500 border-b border-gray-800/60 pb-2">5. SEO & Meta</p>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">SEO Title</label>
                  <input 
                    className="w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white placeholder-gray-600" 
                    placeholder="Custom title for search engines (defaults to Offer Title)" 
                    value={editingOffer.seo?.title || ''} 
                    onChange={e => setEditingOffer({...editingOffer, seo: { ...(editingOffer.seo || {}), title: e.target.value }})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">SEO Description</label>
                  <textarea 
                    className="w-full bg-black border border-gray-800 rounded-sm p-3 text-sm text-white placeholder-gray-600 min-h-[80px]" 
                    placeholder="Meta description for search results" 
                    value={editingOffer.seo?.description || ''} 
                    onChange={e => setEditingOffer({...editingOffer, seo: { ...(editingOffer.seo || {}), description: e.target.value }})} 
                  />
                </div>
              </div>

              {/* SECTION: Status Toggles */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-4 border border-gray-800 rounded-sm bg-black cursor-pointer group/feat" onClick={() => setEditingOffer({...editingOffer, is_active: !editingOffer.is_active})}>
                  <div className={`w-4 h-4 rounded-sm border flex-shrink-0 transition-colors flex items-center justify-center ${editingOffer.is_active ? 'bg-green-600 border-green-600' : 'border-gray-600'}`}>
                    {editingOffer.is_active && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">Active Status</p>
                    <p className="text-[10px] text-gray-500">Is this offer currently live?</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border border-gray-800 rounded-sm bg-black cursor-pointer group/feat" onClick={() => setEditingOffer({...editingOffer, is_featured: !editingOffer.is_featured})}>
                  <div className={`w-4 h-4 rounded-sm border flex-shrink-0 transition-colors flex items-center justify-center ${editingOffer.is_featured ? 'bg-pink-600 border-pink-600' : 'border-gray-600'}`}>
                    {editingOffer.is_featured && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">Featured Offer</p>
                    <p className="text-[10px] text-gray-500">Pin to the top of the offers page</p>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-800/50">
                <button type="button" onClick={() => setEditingOffer(null)} className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-300 border border-gray-800 hover:border-gray-700 rounded-sm transition-all">Cancel</button>
                <button type="submit" disabled={isSaving} className="button-primary bg-pink-600 hover:bg-pink-700 disabled:bg-pink-800 disabled:opacity-70 px-8 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm flex items-center gap-2">
                  {isSaving ? <><div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : editingOffer.id ? 'Save Changes' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}