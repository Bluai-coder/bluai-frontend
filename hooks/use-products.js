'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/products');
      setProducts(res.data.data || res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (formData) => {
    const res = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0, // Bypass 30s timeout for large files
    });
    await fetchProducts();
    return res.data;
  };

  const updateProduct = async (id, formData) => {
    const res = await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0, // Bypass 30s timeout for large files
    });
    await fetchProducts();
    return res.data;
  };

  const deleteProduct = async (id) => {
    await api.delete(`/products/${id}`);
    await fetchProducts();
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
