// app/admin/gallery/page.jsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Image as ImageIcon, Plus, Search, Pencil, Trash2, X,
  Upload, Video, FileText, LayoutGrid, List, AlertTriangle,
  CheckCircle2, Loader2, RefreshCw, Eye, Film, File, Filter,
  Tag, Link as LinkIcon, Folder, Box,
} from 'lucide-react';
import { useGallery } from '@/hooks/use-gallery';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

const buildMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}/${path.replace(/^\//, '')}`;
};

const TYPE_COLORS = {
  images: { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', text: 'text-cyan-300', dot: 'bg-cyan-400' },
  videos: { bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-300', dot: 'bg-purple-400' },
  documents: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-300', dot: 'bg-amber-400' },
  products: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-300', dot: 'bg-emerald-400' },
};

const TypeBadge = ({ type }) => {
  const c = TYPE_COLORS[type] || { bg: 'bg-slate-100 dark:bg-slate-700', border: 'border-slate-300 dark:border-slate-600', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.border} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {type}
    </span>
  );
};

const TypeIcon = ({ type, className = 'w-8 h-8' }) => {
  if (type === 'images') return <ImageIcon className={`${className} text-cyan-400`} />;
  if (type === 'videos') return <Film className={`${className} text-purple-400`} />;
  if (type === 'products') return <Box className={`${className} text-emerald-400`} />;
  return <File className={`${className} text-amber-400`} />;
};

// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium pointer-events-auto border
            ${t.type === 'success' ? 'bg-white dark:bg-slate-800 border-cyan-500/40 text-cyan-300'
              : t.type === 'error' ? 'bg-white dark:bg-slate-800 border-red-500/40 text-red-300'
              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200'}`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
          {t.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
          <span>{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  const remove = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  return { toasts, toast: add, removeToast: remove };
}

// ─────────────────────────────────────────────
// Skeletons
// ─────────────────────────────────────────────
function GridSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden animate-pulse">
          <div className="h-44 bg-slate-100 dark:bg-slate-700" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b border-slate-200 dark:border-slate-700/50">
          <td className="px-4 py-3"><div className="h-4 w-40 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-5 w-20 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-4 w-32 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-8 w-20 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" /></td>
        </tr>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────
// Delete Modal
// ─────────────────────────────────────────────
function DeleteModal({ item, onConfirm, onCancel, loading }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold text-lg">Delete Media</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-slate-700 dark:text-slate-300 text-sm mb-6">
          Are you sure you want to delete{' '}
          <span className="text-slate-900 dark:text-white font-medium">&quot;{item?.title || 'this item'}&quot;</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-sm font-medium transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-60 text-slate-900 dark:text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Gallery Form Modal
// ─────────────────────────────────────────────
const GALLERY_TYPES = ['images', 'videos', 'documents'];

const ACCEPT_MAP = {
  images: 'image/*',
  videos: 'video/*',
  documents: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
};

function GalleryModal({ item, onClose, onSubmit, loading }) {
  const isEdit = !!item;
  const [title, setTitle] = useState(item?.title || '');
  const [type, setType] = useState(item?.type || 'images');
  const [file, setFile] = useState(null);
  
  // Specific for videos
  const [srcUrl, setSrcUrl] = useState(item?.type === 'videos' ? (item?.src || '') : '');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(item?.thumbnail ? buildMediaUrl(item.thumbnail) : null);

  // Use URL toggle for non-video items
  const [useUrl, setUseUrl] = useState(false);
  const [preview, setPreview] = useState(item?.src && item?.type !== 'videos' ? buildMediaUrl(item.src) : null);
  
  const fileRef = useRef(null);
  const thumbRef = useRef(null);

  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    setFile(null);
    setThumbnailFile(null);
    if (!item?.src) setPreview(null);
    if (!item?.thumbnail) setThumbPreview(null);
  }, [type, item]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (type === 'images') {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview('');
    }
  };

  const handleThumbChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbnailFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setThumbPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('type', type.toLowerCase());
    
    if (type === 'videos') {
      // For videos, src is URL, thumbnail is file
      fd.append('src', srcUrl.trim());
      if (thumbnailFile) fd.append('thumbnail', thumbnailFile);
    } else {
      // For images/docs
      if (useUrl && srcUrl) {
        fd.append('src', srcUrl.trim());
      } else if (file) {
        fd.append('src', file);
      }
    }
    
    await onSubmit(fd);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 w-full max-w-xl h-full shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <style jsx global>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white font-semibold">{isEdit ? 'Edit Media' : 'Add Media'}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{isEdit ? 'Update media details' : 'Upload new media'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5">
              <Tag className="w-3.5 h-3.5 inline mr-1.5 text-cyan-400" />
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              placeholder="e.g. Campus Event 2026"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5">
              <Folder className="w-3.5 h-3.5 inline mr-1.5 text-cyan-400" />
              Type
            </label>
            <div className="flex gap-3">
              {GALLERY_TYPES.map((t) => {
                const c = TYPE_COLORS[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                      type === t
                        ? 'bg-slate-100 dark:bg-slate-700 border-slate-400 dark:border-slate-500 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 hover:bg-white dark:bg-slate-800'
                    }`}
                  >
                    <TypeIcon type={t} className={`w-4 h-4 ${type === t ? c.text : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="capitalize">{t}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                <Upload className="w-3.5 h-3.5 inline mr-1.5 text-cyan-400" />
                {type === 'videos' ? 'Video Source URL' : (type === 'images' ? 'Image File' : type === 'products' ? 'Product File' : 'Document File')}
              </label>
              
              {type !== 'videos' && (
                <button
                  type="button"
                  onClick={() => setUseUrl(!useUrl)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                >
                  {useUrl ? 'Upload File instead' : 'Provide URL instead'}
                </button>
              )}
            </div>

            {type === 'videos' ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={srcUrl}
                  onChange={(e) => setSrcUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="https://youtube.com/... or https://vimeo.com/..."
                />
                
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5">
                    <ImageIcon className="w-3.5 h-3.5 inline mr-1.5 text-purple-400" />
                    Video Thumbnail Image
                  </label>
                  <input
                    type="file"
                    ref={thumbRef}
                    accept="image/*"
                    onChange={handleThumbChange}
                    className="hidden"
                  />
                  <div
                    className="w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-400 dark:border-slate-500 hover:bg-white dark:bg-slate-800/50 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden"
                    onClick={() => thumbRef.current?.click()}
                  >
                    {thumbPreview ? (
                      <div className="w-full h-full relative group">
                         <img src={thumbPreview} alt="thumb" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <p className="text-slate-900 dark:text-white text-xs font-medium">Click to change thumbnail</p>
                         </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Upload thumbnail</p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">PNG, JPG, WebP</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Images or Documents
              (useUrl ? (
                <input
                  type="text"
                  value={srcUrl}
                  onChange={(e) => setSrcUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="https://example.com/file.jpg"
                />
              ) : (
                <div className="mt-1">
                  <input
                    type="file"
                    ref={fileRef}
                    accept={ACCEPT_MAP[type]}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div
                    className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-slate-400 dark:border-slate-500 hover:bg-white dark:bg-slate-800/50 flex flex-col items-center justify-center cursor-pointer transition-all"
                    onClick={() => fileRef.current?.click()}
                  >
                    {preview && type === 'images' ? (
                      <div className="flex items-center gap-4">
                        <img src={preview} alt="preview" className="w-20 h-20 rounded-lg object-cover border border-slate-300 dark:border-slate-600" />
                        <div>
                          <p className="text-slate-700 dark:text-slate-300 font-medium">{file ? file.name : 'Current Image'}</p>
                          <p className="text-cyan-400 text-xs mt-1">Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 border border-slate-200 dark:border-slate-700">
                          <Upload className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          {file ? file.name : (item?.src && !item.src.startsWith('http') ? 'Keep existing file' : 'Browse to upload')}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Click to select {type.toLowerCase()}</p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                          {type === 'images' ? 'PNG, JPG, WebP, GIF' : type === 'products' ? 'GLB, GLTF, ZIP, JPG, PNG' : 'PDF, DOC, DOCX, XLS, PPT'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 dark:text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <>{isEdit ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {isEdit ? 'Update' : 'Add Media'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


// =====================================================================
// Grid Card
// =====================================================================
function GalleryCard({ item, onEdit, onDelete }) {
  const mediaUrl = buildMediaUrl(item.src);
  const c = TYPE_COLORS[item.type] || TYPE_COLORS.Images;

  return (
    <div className="group relative bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:border-slate-300 dark:border-slate-600 transition-all hover:shadow-xl hover:shadow-black/20">
      {/* Media preview area */}
      <div className="relative h-44 bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden">
        {item.type === 'images' && mediaUrl ? (
          <img src={mediaUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : item.type === 'videos' && mediaUrl ? (
          <div className="relative w-full h-full group">
            {item.thumbnail ? (
              <img src={buildMediaUrl(item.thumbnail)} alt="thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-white dark:bg-slate-800 flex items-center justify-center">
                 <Film className="w-12 h-12 text-slate-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Film className="w-5 h-5 text-slate-900 dark:text-white ml-1" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <TypeIcon type={item.type} className="w-14 h-14" />
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{item.type}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(item)}
              className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 text-red-400 hover:text-red-300 hover:border-red-500/40 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card info */}
      <div className="p-3">
        <p className="text-slate-800 dark:text-slate-200 text-sm font-medium truncate mb-1.5">{item.title}</p>
        <div className="flex items-center justify-between">
          <TypeBadge type={item.type} />
          {item.src && (
            <a
              href={buildMediaUrl(item.src)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 dark:text-slate-500 hover:text-cyan-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
const FILTER_TABS = ['All', 'images', 'videos', 'documents', 'products'];

export default function GalleryPage() {
  const {
    galleryItems, loading, error, filter, setFilter,
    fetchGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem,
  } = useGallery();

  const { toasts, toast, removeToast } = useToast();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Stats
  const counts = {
    All: galleryItems.length,
    images: galleryItems.filter((i) => i.type === 'images').length,
    videos: galleryItems.filter((i) => i.type === 'videos').length,
    documents: galleryItems.filter((i) => i.type === 'documents').length,
    products: galleryItems.filter((i) => i.type === 'products').length,
  };

  // Client-side search
  const displayed = galleryItems.filter((item) => {
    const q = search.toLowerCase();
    return !q || item.title?.toLowerCase().includes(q) || item.type?.toLowerCase().includes(q);
  });

  const handleCreate = () => { setEditItem(null); setShowModal(true); };
  const handleEdit = (item) => { setEditItem(item); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setEditItem(null); };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editItem) {
        await updateGalleryItem(editItem._id || editItem.id, formData);
        toast('Media updated successfully', 'success');
      } else {
        await createGalleryItem(formData);
        toast('Media added successfully', 'success');
      }
      handleCloseModal();
    } catch (e) {
      toast(e?.response?.data?.message || e.message || 'Something went wrong', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      await deleteGalleryItem(deletingItem._id || deletingItem.id);
      toast('Media deleted', 'success');
      setDeletingItem(null);
    } catch (e) {
      toast(e?.response?.data?.message || e.message || 'Failed to delete', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-cyan-400" />
            Gallery
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage images, videos and documents</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchGallery(filter)}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-cyan-500 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2.5 transition-colors ${viewMode === 'table' ? 'bg-cyan-500 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 dark:text-white text-sm font-semibold transition-colors shadow-lg shadow-cyan-500/25"
          >
            <Plus className="w-4 h-4" />
            Add Media
          </button>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => {
          const isActive = (filter === null && tab === 'All') || filter === tab;
          const c = tab === 'All' ? null : TYPE_COLORS[tab];
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab === 'All' ? null : tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                isActive
                  ? tab === 'All'
                    ? 'bg-cyan-500 border-cyan-500 text-slate-900 dark:text-white'
                    : `${c.bg} ${c.border} ${c.text}`
                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:border-slate-600 hover:text-slate-800 dark:text-slate-200'
              }`}
            >
              {tab === 'All' ? <Filter className="w-3.5 h-3.5" /> : <TypeIcon type={tab} className="w-3.5 h-3.5" />}
              {tab}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive && tab !== 'All' ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                {counts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search media by title or type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 text-sm outline-none transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          {error}
          <button onClick={() => fetchGallery(filter)} className="ml-auto text-xs underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* ── Grid View ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <GridSkeleton />
          ) : displayed.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center text-center">
              <ImageIcon className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No media found</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                {search ? 'Try a different search term' : 'Click "Add Media" to get started'}
              </p>
            </div>
          ) : (
            displayed.map((item) => (
              <GalleryCard
                key={item._id || item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={setDeletingItem}
              />
            ))
          )}
        </div>
      )}

      {/* ── Table View ── */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-medium">Title</th>
                  <th className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-medium">Source / File</th>
                  <th className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? (
                  <TableSkeleton />
                ) : displayed.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center">
                      <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400">No media found</p>
                    </td>
                  </tr>
                ) : (
                  displayed.map((item) => {
                    const mediaUrl = buildMediaUrl(item.src);
                    return (
                      <tr key={item._id || item.id} className="hover:bg-slate-100 dark:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.type === 'images' && mediaUrl ? (
                              <img src={mediaUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover border border-slate-300 dark:border-slate-600 shrink-0" />
                            ) : (
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                                item.type === 'videos' ? 'bg-purple-500/10 border-purple-500/20'
                                  : item.type === 'documents' ? 'bg-amber-500/10 border-amber-500/20'
                                  : item.type === 'products' ? 'bg-emerald-500/10 border-emerald-500/20'
                                  : 'bg-cyan-500/10 border-cyan-500/20'
                              }`}>
                                <TypeIcon type={item.type} className="w-5 h-5" />
                              </div>
                            )}
                            <span className="text-slate-800 dark:text-slate-200 font-medium">{item.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><TypeBadge type={item.type} /></td>
                        <td className="px-4 py-3">
                          {mediaUrl ? (
                            <a
                              href={mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 text-xs font-mono flex items-center gap-1 max-w-xs truncate"
                            >
                              <LinkIcon className="w-3 h-3 shrink-0" />
                              <span className="truncate">{item.src}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-xs">No source</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 hover:text-cyan-300 transition-all"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingItem(item)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {!loading && displayed.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs">
              Showing <span className="text-slate-800 dark:text-slate-200 font-medium">{displayed.length}</span> of{' '}
              <span className="text-slate-800 dark:text-slate-200 font-medium">{galleryItems.length}</span> items
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <GalleryModal
          item={editItem}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          loading={formLoading}
        />
      )}
      {deletingItem && (
        <DeleteModal
          item={deletingItem}
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}











