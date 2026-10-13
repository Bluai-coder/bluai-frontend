'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Image, LayoutDashboard, PenSquare, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { getImageUrl, stripHtml, truncate } from '@/lib/utils';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '');

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ blogs: 0, gallery: 0, images: 0, videos: 0, documents: 0 });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentGallery, setRecentGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [blogsRes, galleryRes] = await Promise.all([
        api.get('/blogs'),
        api.get('/gallery'),
      ]);
      const blogs = blogsRes.data?.data || blogsRes.data || [];
      const gallery = galleryRes.data?.data || galleryRes.data || [];

      setStats({
        blogs: blogs.length,
        gallery: gallery.length,
        images: gallery.filter(g => g.type === 'images').length,
        videos: gallery.filter(g => g.type === 'videos').length,
        documents: gallery.filter(g => g.type === 'documents').length,
      });
      setRecentBlogs(blogs.slice(0, 5));
      setRecentGallery(gallery.slice(0, 6));
    } catch (e) {
      console.error('Dashboard fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-4" />
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white p-6 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-cyan-400" />
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Overview of your content</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-2xl p-6">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Total Blogs</p>
              <p className="text-4xl font-bold text-cyan-500 dark:text-cyan-400 mt-2">{stats.blogs}</p>
              <Link href="/admin/blogs" className="text-xs text-cyan-600 dark:text-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-400 flex items-center gap-1 mt-3">
                <PenSquare className="w-3 h-3" /> Manage →
              </Link>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Total Gallery</p>
              <p className="text-4xl font-bold text-purple-500 dark:text-purple-400 mt-2">{stats.gallery}</p>
              <Link href="/admin/gallery" className="text-xs text-purple-600 dark:text-purple-500 hover:text-purple-700 dark:hover:text-purple-400 flex items-center gap-1 mt-3">
                <Image className="w-3 h-3" /> Manage →
              </Link>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Images</p>
              <p className="text-4xl font-bold text-cyan-600 dark:text-cyan-300 mt-2">{stats.images}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Videos</p>
              <p className="text-4xl font-bold text-amber-500 dark:text-amber-300 mt-2">{stats.videos}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Documents</p>
              <p className="text-4xl font-bold text-green-600 dark:text-green-300 mt-2">{stats.documents}</p>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/blogs"
          className="group flex items-center gap-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 rounded-2xl p-5 transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Blog Posts</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stats.blogs} posts · Manage & publish</p>
          </div>
          <TrendingUp className="w-5 h-5 text-slate-400 dark:text-slate-600 ml-auto group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors" />
        </Link>
        <Link href="/admin/gallery"
          className="group flex items-center gap-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 rounded-2xl p-5 transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Image className="w-6 h-6 text-purple-500 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Gallery</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stats.gallery} items · Images, Videos, Docs</p>
          </div>
          <TrendingUp className="w-5 h-5 text-slate-400 dark:text-slate-600 ml-auto group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
        </Link>
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Blogs */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-500 dark:text-cyan-400" /> Recent Blog Posts
            </h2>
            <Link href="/admin/blogs" className="text-xs text-cyan-600 dark:text-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-400">View all →</Link>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700/50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 flex gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : recentBlogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No blog posts yet</p>
                <Link href="/admin/blogs" className="text-xs text-cyan-600 dark:text-cyan-500 hover:underline mt-1 inline-block">Create your first post →</Link>
              </div>
            ) : (
              recentBlogs.map((blog) => (
                <div key={blog.id} className="p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  {blog.image ? (
                    <img
                      src={getImageUrl(blog.image)}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-slate-200 dark:bg-slate-700"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white truncate">{truncate(stripHtml(blog.text), 60) || '(No content)'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">{blog.post_by}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{formatDate(blog.date_with_time)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Gallery */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Image className="w-4 h-4 text-purple-500 dark:text-purple-400" /> Recent Gallery
            </h2>
            <Link href="/admin/gallery" className="text-xs text-purple-600 dark:text-purple-500 hover:text-purple-700 dark:hover:text-purple-400">View all →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-3 gap-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentGallery.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
              <Image className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No gallery items yet</p>
              <Link href="/admin/gallery" className="text-xs text-purple-600 dark:text-purple-500 hover:underline mt-1 inline-block">Add your first item →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 p-4">
              {recentGallery.map((item) => (
                <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative group">
                  {item.type === 'images' && item.src ? (
                    <img src={getImageUrl(item.src)} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : item.type === 'videos' ? (
                    <div className="w-full h-full flex items-center justify-center bg-purple-500/20 dark:bg-purple-900/30">
                      <span className="text-2xl">🎬</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-500/20 dark:bg-amber-900/30">
                      <span className="text-2xl">📄</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white text-xs truncate">{item.title}</p>
                  </div>
                  <span className={`absolute top-1 right-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${item.type === 'images' ? 'bg-cyan-500/80 text-white' :
                      item.type === 'videos' ? 'bg-purple-500/80 text-white' :
                        'bg-amber-500/80 text-white'
                    }`}>
                    {item.type === 'images' ? 'IMG' : item.type === 'videos' ? 'VID' : 'DOC'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}