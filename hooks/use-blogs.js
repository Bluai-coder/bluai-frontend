'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export function useBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/blogs');
      setBlogs(res.data.data || res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const createBlog = async (formData) => {
    const res = await api.post('/blogs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await fetchBlogs();
    return res.data;
  };

  const updateBlog = async (id, formData) => {
    const res = await api.put(`/blogs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await fetchBlogs();
    return res.data;
  };

  const deleteBlog = async (id) => {
    await api.delete(`/blogs/${id}`);
    await fetchBlogs();
  };

  return { blogs, loading, error, fetchBlogs, createBlog, updateBlog, deleteBlog };
}
