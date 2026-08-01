import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileCheck, 
  Palette, 
  Save, 
  RotateCcw, 
  Moon, 
  Sun, 
  Settings as SettingsIcon,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Globe,
  Landmark
} from 'lucide-react';
import { 
  fetchCompanySettingsFromSupabase, 
  updateCompanySettingsInSupabase, 
  uploadCompanyAssetToSupabase,
  validateCompanySettings 
} from '../services/settingsService';

export default function SettingsPage({ 
  companyInfo, 
  onSaveCompanyInfo, 
  onToast, 
  isDarkMode, 
  setIsDarkMode 
}) {
  const [formData, setFormData] = useState({ ...companyInfo });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [logoPreview, setLogoPreview] = useState(companyInfo?.logoUrl || companyInfo?.company_logo_url || '');

  // Sync initial companyInfo prop
  useEffect(() => {
    if (companyInfo) {
      setFormData(prev => ({ ...prev, ...companyInfo }));
      if (companyInfo.logoUrl || companyInfo.company_logo_url) {
        setLogoPreview(companyInfo.logoUrl || companyInfo.company_logo_url);
      }
    }
  }, [companyInfo]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Image Upload Handler with Preview
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (onToast) onToast('Please select a valid image file (PNG, JPG, SVG)', 'error');
      return;
    }

    // Local instant preview
    const localPreviewUrl = URL.createObjectURL(file);
    setLogoPreview(localPreviewUrl);
    setUploading(true);

    try {
      const uploadedUrl = await uploadCompanyAssetToSupabase(file);
      if (uploadedUrl) {
        setLogoPreview(uploadedUrl);
        handleChange('logoUrl', uploadedUrl);
        if (onToast) onToast('Company logo uploaded successfully!', 'success');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      if (onToast) onToast('Logo upload failed. Using local preview.', 'warning');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      validateCompanySettings(formData);
    } catch (valErr) {
      setError(valErr.message);
      if (onToast) onToast(valErr.message, 'error');
      return;
    }

    setLoading(true);
    try {
      const updated = await updateCompanySettingsInSupabase(formData);
      onSaveCompanyInfo(updated);
      if (onToast) onToast('Company settings & preferences saved successfully to Supabase!', 'success');
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.message || 'Failed to save settings to Supabase');
      if (onToast) onToast(err.message || 'Save failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const freshData = await fetchCompanySettingsFromSupabase();
      setFormData(freshData);
      setLogoPreview(freshData.logoUrl || freshData.company_logo_url || '');
      setError(null);
      if (onToast) onToast('Settings reset to live Supabase database state', 'info');
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-card border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-brand-600" /> Company Settings & Preferences
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure company branding, default tax rates, currency, and invoice defaults
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-card p-4 flex items-center justify-between text-xs text-rose-700">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Company Branding & Logo Upload */}
        <div className="bg-white rounded-card p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-600" /> Company Information & Branding
            </h2>
            <span className="text-xs text-slate-400 font-medium">Prints on Invoices & Portals</span>
          </div>

          {/* Logo Upload Box */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-24 h-24 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shadow-xs shrink-0 group">
              {logoPreview ? (
                <img src={logoPreview} alt="Company Logo Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-300" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <h3 className="text-sm font-bold text-slate-900">Official Company Logo</h3>
              <p className="text-xs text-slate-500">
                Upload your company brand logo. Supported formats: PNG, JPG, SVG. Recommended: Square image.
              </p>
              
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <label className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5" /> Upload New Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview('');
                      handleChange('logoUrl', '');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="Enter Company Name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number(s) *
              </label>
              <input
                type="text"
                required
                placeholder="Enter Phone Number"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Email Address
              </label>
              <input
                type="email"
                placeholder="info@ukchef.pk"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Company Website URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="https://ukchef.pk"
                  value={formData.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                NTN (National Tax Number)
              </label>
              <input
                type="text"
                placeholder="1234567-8"
                value={formData.ntn || ''}
                onChange={(e) => handleChange('ntn', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                GST / Sales Tax Registration #
              </label>
              <input
                type="text"
                placeholder="12-34-5678-901-23"
                value={formData.gst || ''}
                onChange={(e) => handleChange('gst', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Headquarters Address
              </label>
              <input
                type="text"
                placeholder="Enter Company Address"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-medium"
              />
            </div>

          </div>
        </div>

        {/* Section 2: Invoice Configuration & Financial Settings */}
        <div className="bg-white rounded-card p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand-600" /> Invoice Defaults & Configuration
            </h2>
            <span className="text-xs text-slate-400 font-medium">Automatic Calculations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Invoice Prefix
              </label>
              <input
                type="text"
                placeholder="INV"
                value={formData.invoicePrefix || ''}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Tax Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.defaultTaxRate !== undefined ? formData.defaultTaxRate : 0}
                  onChange={(e) => handleChange('defaultTaxRate', e.target.value)}
                  className="w-full pr-8 pl-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Currency Standard
              </label>
              <input
                type="text"
                value={`${formData.currency || 'PKR'} (${formData.currencySymbol || 'Rs.'})`}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Terms
              </label>
              <input
                type="text"
                placeholder="Payment due within 14 days"
                value={formData.paymentTerms || ''}
                onChange={(e) => handleChange('paymentTerms', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Invoice Footer Note / Disclaimer
              </label>
              <textarea
                rows="2"
                placeholder="Thank you for your business!"
                value={formData.footerNote || ''}
                onChange={(e) => handleChange('footerNote', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium"
              ></textarea>
            </div>

            {/* Bank details */}
            <div className="sm:col-span-2 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-600" /> Official Bank Account Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Bank Name</label>
                  <input
                    type="text"
                    placeholder="Meezan Bank"
                    value={formData.bankName || ''}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Account Title</label>
                  <input
                    type="text"
                    placeholder="Company Title"
                    value={formData.accountTitle || ''}
                    onChange={(e) => handleChange('accountTitle', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Account Number</label>
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={formData.accountNumber || ''}
                    onChange={(e) => handleChange('accountNumber', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">IBAN</label>
                  <input
                    type="text"
                    placeholder="PK92MEZN..."
                    value={formData.iban || ''}
                    onChange={(e) => handleChange('iban', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Section 3: Appearance & Theme */}
        <div className="bg-white rounded-card p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand-600" /> Interface Appearance
            </h2>
            <span className="text-xs text-slate-400 font-medium">Visual Mode</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400">
                  <Moon className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                  <Sun className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dark Mode Toggle UI</h3>
                <p className="text-xs text-slate-500">Switch between light SaaS clean aesthetic and dark mode theme</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                if (onToast) onToast(`Switched to ${!isDarkMode ? 'Dark' : 'Light'} Mode interface`, 'info');
              }}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 ${
                isDarkMode 
                  ? 'bg-slate-900 text-white hover:bg-slate-800' 
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
              {isDarkMode ? 'Light Theme' : 'Dark Theme'}
            </button>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors disabled:opacity-50"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Preferences
          </button>
        </div>

      </form>
    </div>
  );
}
