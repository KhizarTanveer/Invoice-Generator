import React, { useState, useEffect } from 'react';
import { X, Package, Loader2 } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Recipes & Marinades',
  'Organic Dry Vegetables',
  'Pure Spices',
  'Mayo • Sauces • Vinegar'
];

export default function ProductModal({ product, categories, onClose, onSave, isSaving }) {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: '',
    category: 'Recipes & Marinades',
    packing: '',
    trade_price: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  const availableCategories = (categories && categories.length > 0)
    ? categories.filter(c => c !== 'All Categories')
    : DEFAULT_CATEGORIES;

  useEffect(() => {
    if (product) {
      const defaultCat = (categories && categories.length > 0)
        ? categories.filter(c => c !== 'All Categories')[0]
        : DEFAULT_CATEGORIES[0];
      setFormData({
        id: product.id,
        name: product.name || '',
        category: product.category || defaultCat || 'Recipes & Marinades',
        packing: product.packing || product.unit || '',
        trade_price: product.trade_price !== undefined ? product.trade_price : (product.price || ''),
        status: product.status || 'Active'
      });
    }
  }, [product, categories]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSaving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSaving]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.packing.trim()) newErrors.packing = 'Packing detail is required';
    if (formData.trade_price === '' || Number(formData.trade_price) < 0) {
      newErrors.trade_price = 'Valid trade price (PKR) is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate() || isSaving) return;

    onSave({
      ...(formData.id ? { id: formData.id } : {}),
      name: formData.name,
      category: formData.category,
      packing: formData.packing,
      trade_price: Number(formData.trade_price),
      status: formData.status
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-600 text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 id="product-modal-title" className="font-bold text-base">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
              <p className="text-xs text-slate-400">UK Chef Supabase Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Chicken Tikka Masala"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                errors.name ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 font-medium mt-1">{errors.name}</p>}
          </div>

          {/* Category & Packing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium text-slate-800"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Packing *
              </label>
              <input
                type="text"
                placeholder="e.g. 1kg /20kG"
                value={formData.packing}
                onChange={(e) => setFormData({ ...formData, packing: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                  errors.packing ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
              {errors.packing && <p className="text-xs text-rose-500 font-medium mt-1">{errors.packing}</p>}
            </div>
          </div>

          {/* Trade Price & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Trade Price (PKR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rs.</span>
                <input
                  type="number"
                  placeholder="0"
                  step="any"
                  value={formData.trade_price}
                  onChange={(e) => setFormData({ ...formData, trade_price: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 transition-all font-mono ${
                    errors.trade_price ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                  }`}
                />
              </div>
              {errors.trade_price && <p className="text-xs text-rose-500 font-medium mt-1">{errors.trade_price}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium text-slate-800"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
