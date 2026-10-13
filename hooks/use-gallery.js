'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export function useGallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(null); // null = all, 'Images', 'Videos', 'Documents'

  const fetchGallery = useCallback(async (type = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = type ? { type } : {};
      const res = await api.get('/gallery', { params });
      setGalleryItems(res.data.data || res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to fetch gallery');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery(filter);
  }, [fetchGallery, filter]);

  const createGalleryItem = async (formData) => {
    const res = await api.post('/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await fetchGallery(filter);
    return res.data;
  };

  const updateGalleryItem = async (id, formData) => {
    const res = await api.put(`/gallery/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await fetchGallery(filter);
    return res.data;
  };

  const deleteGalleryItem = async (id) => {
    await api.delete(`/gallery/${id}`);
    await fetchGallery(filter);
  };

  return {
    galleryItems,
    loading,
    error,
    filter,
    setFilter,
    fetchGallery,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
  };
}
