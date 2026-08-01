import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Search, 
  PlusCircle, 
  Edit, 
  Trash2, 
  AlertCircle, 
  PackageCheck, 
  Layers,
  Loader2,
  RefreshCw
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import ProductModal from '../components/product/ProductModal';
import { 
  fetchProductsFromSupabase, 
  addProductToSupabase, 
  updateProductInSupabase, 
  deleteProductFromSupabase 
} from '../services/productService';

export default function ProductsPage({ onToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('name-asc');

  // Modal & Operations state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch products from Supabase database
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductsFromSupabase();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products from Supabase:', err);
      setError(err.message || 'Failed to load products from Supabase database');
      if (onToast) onToast(err.message || 'Error loading products from database', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Compute dynamic categories list
  const categoryList = ['All Categories', ...Array.from(new Set(products.map(p => p.category))).sort()];

  // Filter products by search term and category
  let filtered = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(term) ||
      (p.category && p.category.toLowerCase().includes(term)) ||
      (p.packing && p.packing.toLowerCase().includes(term));
    const matchesCat = selectedCategory === 'All Categories' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Sort products (Alphabetical by default)
  filtered.sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    if (sortBy === 'price-low') return Number(a.trade_price) - Number(b.trade_price);
    if (sortBy === 'price-high') return Number(b.trade_price) - Number(a.trade_price);
    return 0;
  });

  // Add Product Handler
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  // Edit Product Handler
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  // Save Product (Add or Update)
  const handleSaveProduct = async (formData) => {
    setIsSaving(true);
    try {
      if (editingProduct && editingProduct.id) {
        // Update existing product
        const updated = await updateProductInSupabase(editingProduct.id, formData);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? (updated || { ...p, ...formData }) : p));
        if (onToast) onToast(`Product "${formData.name}" updated successfully in Supabase!`, 'success');
      } else {
        // Add new product
        const created = await addProductToSupabase(formData);
        if (created) {
          setProducts(prev => [created, ...prev]);
        } else {
          await loadProducts();
        }
        if (onToast) onToast(`Product "${formData.name}" added to Supabase database!`, 'success');
      }
      setModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Error saving product to Supabase:', err);
      if (onToast) onToast(`Failed to save product: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from Supabase database?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteProductFromSupabase(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      if (onToast) onToast(`Product "${name}" deleted from Supabase database`, 'info');
    } catch (err) {
      console.error('Error deleting product from Supabase:', err);
      if (onToast) onToast(`Failed to delete product: ${err.message}`, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // KPI Calculations
  const activeCount = products.filter(p => p.status === 'Active').length;
  const categoriesCount = new Set(products.map(p => p.category)).size;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-card border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-600" /> Products & Inventory Manager
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Live Supabase Database integration • UK Chef product catalog
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadProducts}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
            title="Refresh from Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Add New Product
          </button>
        </div>
      </div>

      {/* Quick KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-card border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-brand-50 text-brand-600">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Products</p>
            <h3 className="text-xl font-extrabold text-slate-900">
              {loading ? '...' : `${products.length} Items`}
            </h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-card border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Status</p>
            <h3 className="text-xl font-extrabold text-emerald-700">
              {loading ? '...' : `${activeCount} Active`}
            </h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-card border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Categories</p>
            <h3 className="text-xl font-extrabold text-blue-700">
              {loading ? '...' : `${categoriesCount} Categories`}
            </h3>
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-card p-4 flex items-center justify-between text-xs text-rose-700">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadProducts}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Toolbar Card */}
      <div className="bg-white rounded-card p-4 border border-slate-200/80 shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        
        {/* Search */}
        <div className="lg:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search product name, category, or packing..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 font-medium"
          />
        </div>

        {/* Category Filter */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-semibold text-slate-800"
            >
              {categoryList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="lg:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-semibold text-slate-800"
          >
            <option value="name-asc">Sort: Product Name (A-Z)</option>
            <option value="name-desc">Sort: Product Name (Z-A)</option>
            <option value="price-low">Sort: Trade Price (Low to High)</option>
            <option value="price-high">Sort: Trade Price (High to Low)</option>
          </select>
        </div>

      </div>

      {/* Products Table */}
      <div className="bg-white rounded-card border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Product Name</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Packing</th>
                <th className="py-3.5 px-5 text-right">Trade Price (PKR)</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 mx-auto text-brand-600 animate-spin mb-3" />
                    <p className="font-bold text-sm text-slate-700">Loading products from Supabase...</p>
                    <p className="text-xs text-slate-400">Fetching live database records</p>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">{item.packing}</td>
                    <td className="py-3.5 px-5 text-right font-mono font-extrabold text-slate-900">
                      Rs. {Number(item.trade_price).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <StatusBadge status={item.status || 'Active'} type="product" />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          disabled={deletingId === item.id}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(item.id, item.name)}
                          disabled={deletingId === item.id}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center"
                          title="Delete Product"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-sm text-slate-600">No products found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search query or category filter</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categoryList}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
          isSaving={isSaving}
        />
      )}

    </div>
  );
}
