'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Plus, Search, Pencil, Trash2, X, FileText,
  Upload, AlertTriangle, CheckCircle2, Loader2, RefreshCw, Eye
} from 'lucide-react';
import { useProducts } from '@/hooks/use-products';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

const buildMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}/${path.replace(/^\//, '')}`;
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
            `}
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
          </div>
        </div>
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
            <h3 className="text-slate-900 dark:text-white font-semibold text-lg">Delete Product</h3>
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
// Form Modal
// ─────────────────────────────────────────────
function ProductModal({ item, onClose, onSubmit, loading }) {
  const isEdit = !!item;
  const [title, setTitle] = useState(item?.title || '');
  const [glbFile, setGlbFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState(item?.images || []);

  const glbRef = useRef(null);
  const pdfRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if(!loading || !title.trim()){

      const h = (e) => e.key === 'Escape' && onClose();
      window.addEventListener('keydown', h);
      return () => window.removeEventListener('keydown', h);
    }

  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', title.trim());
    if (glbFile) fd.append('glb_file', glbFile);
    if (pdfFile) fd.append('pdf_file', pdfFile);
    existingImages.forEach(img => fd.append('existingImages', img));
    Array.from(newImages).forEach(img => fd.append('images', img));

    await onSubmit(fd);
  };

  const removeExistingImage = (idx) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/70 backdrop-blur-sm">
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
              <Box className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white font-semibold">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{isEdit ? 'Update product details' : 'Upload new product'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="e.g. 3D Chair Model"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5">
              GLB File (3D Model)
            </label>
            <input
              type="file"
              ref={glbRef}
              accept=".glb,.gltf,.zip"
              onChange={(e) => setGlbFile(e.target.files[0])}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-500 hover:file:bg-cyan-500/20"
            />
            {item?.glb_file && !glbFile && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Current file: {item.glb_file.split('/').pop()}</p>}
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5">
              PDF Document
            </label>
            <input
              type="file"
              ref={pdfRef}
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-500 hover:file:bg-cyan-500/20"
            />
            {item?.pdf_file && !pdfFile && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><FileText className="w-3 h-3 text-emerald-400" /> Current file: {item.pdf_file.split('/').pop()}</p>}
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5">
              Other Images
            </label>
            <input
              type="file"
              ref={imgRef}
              accept="image/*"
              multiple
              onChange={(e) => setNewImages(e.target.files)}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-500 hover:file:bg-cyan-500/20 mb-2"
            />

            {existingImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {existingImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={buildMediaUrl(img)} alt="product" className="w-full h-20 object-cover rounded-lg border border-slate-700" />
                    <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading || !title.trim()} className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-900 dark:text-white text-sm font-semibold flex items-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Plus className="w-4 h-4" /> Save Product</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function ProductsPage() {
  const { products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts();
  const { toasts, toast, removeToast } = useToast();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const displayed = products.filter((item) => {
    const q = search.toLowerCase();
    return !q || item.title?.toLowerCase().includes(q);
  });

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editItem) {
        await updateProduct(editItem._id || editItem.id, formData);
        toast('Product updated successfully', 'success');
      } else {
        await createProduct(formData);
        toast('Product added successfully', 'success');
      }
      setShowModal(false);
      setEditItem(null);
    } catch (e) {
      toast(e?.response?.data?.message || e.message || 'Something went wrong', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setFormLoading(true);
    try {
      await deleteProduct(deletingItem._id || deletingItem.id);
      toast('Product deleted', 'success');
      setDeletingItem(null);
    } catch (e) {
      toast(e?.response?.data?.message || e.message || 'Failed to delete', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <Toast toasts={toasts} removeToast={removeToast} />
      {deletingItem && (
        <DeleteModal item={deletingItem} onCancel={() => setDeletingItem(null)} onConfirm={handleDelete} loading={formLoading} />
      )}
      {showModal && (
        <ProductModal item={editItem} onClose={() => { setEditItem(null) }} onSubmit={handleSubmit} loading={formLoading} />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Box className="w-6 h-6 text-cyan-400" /> Products
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage 3D products and models</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchProducts()} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => { setEditItem(null); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-900 dark:text-white text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm outline-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <GridSkeleton /> : displayed.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center text-center">
            <Box className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No products found</p>
          </div>
        ) : displayed.map((item) => (
          <div key={item._id || item.id} className="group bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:border-slate-300 dark:border-slate-600">
            <div className="h-44 bg-slate-100 dark:bg-slate-700 flex items-center justify-center relative overflow-hidden">
              {item.images && item.images.length > 0 ? (
                <img src={buildMediaUrl(item.images[0])} alt="product" className="w-full h-full object-cover" />
              ) : (
                <Box className="w-12 h-12 text-slate-400" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditItem(item); setShowModal(true) }} className="p-2 rounded-xl bg-white text-cyan-500"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeletingItem(item)} className="p-2 rounded-xl bg-white text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-slate-900 dark:text-slate-100 font-medium truncate mb-1">{item.title}</p>
              <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400">
                {item.glb_file && <span className="bg-emerald-500/10 text-emerald-400 px-2 rounded-full border border-emerald-500/20">GLB</span>}
                {item.pdf_file && <span className="bg-amber-500/10 text-amber-500 px-2 rounded-full border border-amber-500/20">PDF</span>}
                {item.images?.length > 0 && <span>{item.images.length} Image(s)</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
