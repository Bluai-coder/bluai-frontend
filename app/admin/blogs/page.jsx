// app/admin/blogs/page.jsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import {
  FileText, Plus, Search, Pencil, Trash2, X, Upload,
  Image as ImageIcon, Calendar, User, RefreshCw, Eye,
  ChevronDown, AlertTriangle, CheckCircle2, Loader2, AlignLeft
} from 'lucide-react';
import { useBlogs } from '@/hooks/use-blogs';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

const buildImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}/${path.replace(/^\//, '')}`;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '') : '';
const truncate = (str, n = 60) => str && str.length > n ? str.slice(0, n) + '…' : str;

// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium pointer-events-auto transition-all duration-300 border
            ${t.type === 'success'
              ? 'bg-white dark:bg-slate-800 border-cyan-500/40 text-cyan-300'
              : t.type === 'error'
                ? 'bg-white dark:bg-slate-800 border-red-500/40 text-red-300'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200'
            }`}
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
// Loading Skeleton
// ─────────────────────────────────────────────
function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b border-slate-200 dark:border-slate-700/50">
          <td className="px-4 py-3"><div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-4 w-48 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-4 w-32 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-8 w-20 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" /></td>
        </tr>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────
function DeleteModal({ blog, onConfirm, onCancel, loading }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold text-lg">Delete Blog Post</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-slate-700 dark:text-slate-300 text-sm mb-6">
          Are you sure you want to delete the post by{' '}
          <span className="text-slate-900 dark:text-white font-medium">{blog?.post_by || 'Unknown'}</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-sm font-medium transition-colors"
          >
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
// Blog Form Modal
// ─────────────────────────────────────────────
function BlogModal({ blog, onClose, onSubmit, loading }) {
  const [postBy, setPostBy] = useState(blog?.post_by || '');
  const [text, setText] = useState(blog?.text || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    blog?.image ? buildImageUrl(blog.image) : null
  );
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postBy.trim()) return;
    const fd = new FormData();
    fd.append('post_by', postBy.trim());
    fd.append('text', text);
    if (imageFile) fd.append('image', imageFile);
    await onSubmit(fd);
  };

  const isEdit = !!blog;

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/70 backdrop-blur-sm"
      // onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white font-semibold">{isEdit ? 'Edit Blog Post' : 'New Blog Post'}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{isEdit ? 'Update post details' : 'Create a new post'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Posted By */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5">
              <User className="w-3.5 h-3.5 inline mr-1.5 text-cyan-400" />
              Posted By <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={postBy}
              onChange={(e) => setPostBy(e.target.value)}
              placeholder="Author name"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none text-slate-900 dark:text-white placeholder-slate-500 text-sm transition-colors"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5">
              <ImageIcon className="w-3.5 h-3.5 inline mr-1.5 text-cyan-400" />
              Cover Image
            </label>
            <div
              className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-cyan-500/60 rounded-xl p-4 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="flex items-center gap-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-lg object-cover border border-slate-300 dark:border-slate-600"
                  />
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    <p className="text-slate-800 dark:text-slate-200 font-medium">{imageFile?.name || 'Current image'}</p>
                    <p className="text-xs mt-1">Click to change image</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                    className="ml-auto text-slate-400 dark:text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Click to upload cover image</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">PNG, JPG, WebP up to 10MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Text / Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                <AlignLeft className="w-3.5 h-3.5 inline mr-1.5 text-cyan-400" />
                Content
              </label>
              <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${activeTab === 'edit'
                      ? 'bg-cyan-500 text-slate-900 dark:text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
                    }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${activeTab === 'preview'
                      ? 'bg-cyan-500 text-slate-900 dark:text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
                    }`}
                >
                  Preview
                </button>
              </div>
            </div>

            {activeTab === 'edit' ? (
              <div>
                <div className="text-editor-wrapper">
                  <ReactQuill theme="snow" value={text} onChange={setText} placeholder="Write your blog post content here..." />
                </div>
                <style jsx global>{`
                  .text-editor-wrapper .ql-toolbar {
                    background-color: #1e293b;
                    border-color: #334155;
                    border-top-left-radius: 0.75rem;
                    border-top-right-radius: 0.75rem;
                  }
                  .text-editor-wrapper .ql-container {
                    background-color: #0f172a;
                    border-color: #334155;
                    border-bottom-left-radius: 0.75rem;
                    border-bottom-right-radius: 0.75rem;
                    color: #f1f5f9;
                    min-height: 200px;
                    font-size: 0.875rem;
                  }
                  .text-editor-wrapper .ql-stroke { stroke: #94a3b8; }
                  .text-editor-wrapper .ql-fill { fill: #94a3b8; }
                  .text-editor-wrapper .ql-picker { color: #94a3b8; }
                  .text-editor-wrapper .ql-editor.ql-blank::before { color: #64748b; font-style: normal; }
                  @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                  }
                `}</style>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlignLeft className="w-3 h-3" />
                  Use line breaks for paragraphs. Plain text only.
                </p>
              </div>
            ) : (
              <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 min-h-[200px] text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {text || <span className="text-slate-400 dark:text-slate-500 italic">Nothing to preview yet…</span>}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !postBy.trim()}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 dark:text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <>{isEdit ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {isEdit ? 'Update Post' : 'Create Post'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function BlogsPage() {
  const { blogs, loading, error, fetchBlogs, createBlog, updateBlog, deleteBlog } = useBlogs();
  const { toasts, toast, removeToast } = useToast();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const [deletingBlog, setDeletingBlog] = useState(null);
  const [previewBlog, setPreviewBlog] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Stats
  const today = new Date().toDateString();
  const todayPosts = blogs.filter((b) => new Date(b.createdAt || b.created_at).toDateString() === today).length;

  // Filtered list
  const filtered = blogs.filter((b) => {
    const q = search.toLowerCase();
    return (
      !q ||
      b.post_by?.toLowerCase().includes(q) ||
      b.text?.toLowerCase().includes(q)
    );
  });

  const handleCreate = () => { setEditBlog(null); setShowModal(true); };
  const handleEdit = (blog) => { setEditBlog(blog); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setEditBlog(null); };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editBlog) { 
        await updateBlog(editBlog._id || editBlog.id, formData);
        toast('Blog post updated successfully', 'success');
      } else {
        await createBlog(formData);
        toast('Blog post created successfully', 'success');
      }
      handleCloseModal();
    } catch (e) {
      toast(e?.response?.data?.message || e.message || 'Something went wrong', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBlog) return;
    setDeleteLoading(true);
    try {
      await deleteBlog(deletingBlog._id || deletingBlog.id);
      toast('Blog post deleted', 'success');
      setDeletingBlog(null);
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
            <FileText className="w-6 h-6 text-cyan-400" />
            Blog Posts
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage and publish your blog content</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBlogs}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 dark:text-white text-sm font-semibold transition-colors shadow-lg shadow-cyan-500/25"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Posts', value: blogs.length, icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
          { label: "Today's Posts", value: todayPosts, icon: Calendar, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
          { label: 'Filtered', value: filtered.length, icon: Search, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-xl border ${bg} bg-white dark:bg-slate-800/50 px-4 py-3 flex items-center gap-3`}>
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className="text-slate-900 dark:text-white font-bold text-xl leading-none">{loading ? '—' : value}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search by author or content…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 text-sm outline-none transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          {error}
          <button onClick={fetchBlogs} className="ml-auto text-xs underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-medium w-16">Image</th>
                <th className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-medium">Content</th>
                <th className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-medium">Posted By</th>
                <th className="px-4 py-3 text-left text-slate-500 dark:text-slate-400 font-medium">Date & Time</th>
                <th className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <TableSkeleton />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No blog posts found</p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                      {search ? 'Try a different search term' : 'Click "New Post" to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((blog) => {
                  const imgUrl = buildImageUrl(blog.image);
                  return (
                    <tr
                      key={blog._id || blog.id}
                      className="hover:bg-slate-100 dark:bg-slate-700/30 transition-colors group"
                    >
                      {/* Image */}
                      <td className="px-4 py-3">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt="cover"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-300 dark:border-slate-600"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                          </div>
                        )}
                      </td>
                      {/* Content */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-slate-800 dark:text-slate-200 leading-snug">{truncate(stripHtml(blog.text), 70)}</p>
                      </td>
                      {/* Posted By */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
                          <User className="w-3 h-3" />
                          {blog.post_by || '—'}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                        <Calendar className="w-3 h-3 inline mr-1 text-slate-400 dark:text-slate-500" />
                        {formatDate(blog.createdAt || blog.created_at)}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setPreviewBlog(blog)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 transition-all"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(blog)}
                            className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 hover:text-cyan-300 transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingBlog(blog)}
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

        {/* Table footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs">
            Showing <span className="text-slate-800 dark:text-slate-200 font-medium">{filtered.length}</span> of{' '}
            <span className="text-slate-800 dark:text-slate-200 font-medium">{blogs.length}</span> posts
          </div>
        )}
      </div>

      {/* Modals */}
      {previewBlog && (
        <BlogPreviewModal
          blog={previewBlog}
          onClose={() => setPreviewBlog(null)}
        />
      )}
      {showModal && (
        <BlogModal
          blog={editBlog}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          loading={formLoading}
        />
      )}
      {deletingBlog && (
        <DeleteModal
          blog={deletingBlog}
          onConfirm={handleDelete}
          onCancel={() => setDeletingBlog(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}

// =====================================================================
// Blog Preview Modal
// =====================================================================
function BlogPreviewModal({ blog, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const imgUrl = buildImageUrl(blog?.image);

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/70 backdrop-blur-sm"
      // onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 w-full max-w-3xl h-full shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-slate-900 dark:text-white font-semibold text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            Blog Preview
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {imgUrl && (
            <img
              src={imgUrl}
              alt="Cover"
              className="w-full h-64 object-cover rounded-xl border border-slate-200 dark:border-slate-700 mb-6"
            />
          )}

          <div className="flex items-center gap-3 mb-6 text-slate-500 dark:text-slate-400 text-sm">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="font-medium text-slate-800 dark:text-slate-200">{blog?.post_by}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>{formatDate(blog?.createdAt || blog?.created_at)}</span>
            </div>
          </div>

          <div className="ql-snow">
            {blog?.text ? (
              <div 
                className="ql-editor !p-0 text-slate-800 dark:text-slate-200 min-h-0" 
                dangerouslySetInnerHTML={{ __html: blog.text }} 
              />
            ) : (
              <p className="text-slate-400 dark:text-slate-500 italic">No content provided.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

