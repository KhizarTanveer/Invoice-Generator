import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Toast from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import InvoicePreviewModal from './components/invoice/InvoicePreviewModal';
import ProductModal from './components/product/ProductModal';

import { 
  initialCompanyInfo, 
  initialCategories, 
  initialProducts, 
  initialCustomers, 
  initialInvoices, 
  initialStats 
} from './mock/mockData';

import { getCurrentSession, logoutAdmin, subscribeToAuthChanges } from './services/authService';
import { fetchProductsFromSupabase } from './services/productService';
import { fetchCompanySettingsFromSupabase } from './services/settingsService';

// Lazy-loaded page components for route-level code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NewInvoicePage = lazy(() => import('./pages/NewInvoicePage'));
const InvoiceHistoryPage = lazy(() => import('./pages/InvoiceHistoryPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// LocalStorage Helper Keys
const STORAGE_KEYS = {
  AUTH: 'ukchef_auth_session',
  COMPANY: 'ukchef_company_info',
  PRODUCTS: 'ukchef_products',
  CUSTOMERS: 'ukchef_customers',
  INVOICES: 'ukchef_invoices',
  STATS: 'ukchef_stats',
  THEME: 'ukchef_theme'
};

const getStored = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
};

const PageFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 text-center">
    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
    <p className="text-xs font-semibold text-slate-500">Loading section...</p>
  </div>
);

export default function App() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Navigation & Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => 
    getStored(STORAGE_KEYS.THEME, false)
  );

  // Restore & Listen to Supabase Auth state changes
  useEffect(() => {
    let isMounted = true;
    getCurrentSession().then((sess) => {
      if (isMounted) {
        setIsAuthenticated(!!sess);
        setIsCheckingAuth(false);
      }
    });

    const subscription = subscribeToAuthChanges((event, sess) => {
      if (isMounted) {
        setIsAuthenticated(!!sess);
        setIsCheckingAuth(false);
      }
    });

    return () => {
      isMounted = false;
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Datasets (Persisted in localStorage across page reloads & sessions)
  const [companyInfo, setCompanyInfo] = useState(() => 
    getStored(STORAGE_KEYS.COMPANY, initialCompanyInfo)
  );

  const [categories] = useState(initialCategories);

  const [products, setProducts] = useState(() => 
    getStored(STORAGE_KEYS.PRODUCTS, initialProducts)
  );

  const [customers, setCustomers] = useState(() => 
    getStored(STORAGE_KEYS.CUSTOMERS, initialCustomers)
  );

  const [invoices, setInvoices] = useState(() => 
    getStored(STORAGE_KEYS.INVOICES, initialInvoices)
  );

  const [stats, setStats] = useState(() => 
    getStored(STORAGE_KEYS.STATS, initialStats)
  );

  // Modals & Notifications
  const [toast, setToast] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [productModalData, setProductModalData] = useState(null);

  // Synchronize state changes to localStorage
  useEffect(() => {
    setStored(STORAGE_KEYS.AUTH, isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    setStored(STORAGE_KEYS.COMPANY, companyInfo);
  }, [companyInfo]);

  useEffect(() => {
    setStored(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    setStored(STORAGE_KEYS.CUSTOMERS, customers);
  }, [customers]);

  useEffect(() => {
    setStored(STORAGE_KEYS.INVOICES, invoices);
  }, [invoices]);

  useEffect(() => {
    setStored(STORAGE_KEYS.STATS, stats);
  }, [stats]);

  useEffect(() => {
    setStored(STORAGE_KEYS.THEME, isDarkMode);
  }, [isDarkMode]);

  // Load products and company settings from Supabase on mount
  useEffect(() => {
    fetchProductsFromSupabase()
      .then(data => {
        if (data && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(err => console.error('Failed to sync Supabase products:', err));

    fetchCompanySettingsFromSupabase()
      .then(settings => {
        if (settings) {
          setCompanyInfo(settings);
        }
      })
      .catch(err => console.error('Failed to sync Supabase company settings:', err));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Auth Handlers
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    showToast('Signed in successfully! Welcome to UK Chef Portal.', 'success');
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    showToast('Signed out of admin session.', 'info');
  };

  // Reset Today's Summary
  const handleResetTodaySummary = () => {
    setStats(prev => ({
      ...prev,
      invoicesToday: 0,
      todaySalesPKR: 0,
      newCustomersToday: 0
    }));
    showToast("Today's Summary counters refreshed to 0!", 'info');
  };

  // Save Invoice & update statistics
  const handleSaveInvoice = (newInv) => {
    const exists = invoices.some(i => i.id === newInv.id);
    let updatedInvoices;

    if (exists) {
      updatedInvoices = invoices.map(i => i.id === newInv.id ? newInv : i);
      showToast(`Invoice ${newInv.id} updated successfully!`, 'success');
    } else {
      updatedInvoices = [...invoices, newInv];
      showToast(`Invoice ${newInv.id} issued & saved!`, 'success');

      if (newInv.customerName && !customers.some(c => c.name.toLowerCase() === newInv.customerName.toLowerCase())) {
        const newCustObj = {
          id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
          name: newInv.customerName,
          phone: newInv.customerPhone || '',
          address: newInv.customerAddress || ''
        };
        setCustomers(prevCust => [newCustObj, ...prevCust]);
      }

      setStats(prev => ({
        ...prev,
        totalInvoices: updatedInvoices.length,
        totalRevenuePKR: prev.totalRevenuePKR + Number(newInv.grandTotal || 0),
        invoicesToday: prev.invoicesToday + 1,
        todaySalesPKR: prev.todaySalesPKR + Number(newInv.grandTotal || 0)
      }));
    }

    setInvoices(updatedInvoices);
    setEditingInvoice(null);
    setActiveTab('history');
  };

  const handleDeleteInvoice = (id) => {
    if (window.confirm(`Are you sure you want to delete invoice ${id}?`)) {
      const remaining = invoices.filter(i => i.id !== id);
      setInvoices(remaining);

      const newRev = remaining.reduce((acc, curr) => acc + Number(curr.grandTotal || 0), 0);
      setStats(prev => ({
        ...prev,
        totalInvoices: remaining.length,
        totalRevenuePKR: newRev
      }));

      showToast(`Invoice ${id} deleted from storage`, 'info');
    }
  };

  const handleEditInvoice = (inv) => {
    setEditingInvoice(inv);
    setActiveTab('new-invoice');
  };

  // Product Handlers
  const handleSaveProduct = (prodData) => {
    const exists = products.some(p => p.id === prodData.id);
    let updatedProducts;

    if (exists) {
      updatedProducts = products.map(p => p.id === prodData.id ? prodData : p);
      showToast(`Product ${prodData.name} updated`, 'success');
    } else {
      updatedProducts = [prodData, ...products];
      showToast(`Product ${prodData.name} added & saved`, 'success');
      setStats(prev => ({ ...prev, totalProducts: updatedProducts.length }));
    }

    setProducts(updatedProducts);
    setProductModalData(null);
  };

  // Navbar title
  const tabTitles = {
    dashboard: 'Dashboard',
    'new-invoice': editingInvoice ? `Edit Invoice (${editingInvoice.id})` : 'New Invoice Generator',
    history: 'Invoice History Records',
    products: 'Products & Inventory',
    settings: 'Company Settings'
  };

  // While verifying session, render loading screen
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white font-sans">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-sm text-slate-300">Verifying secure session...</p>
        <p className="text-xs text-slate-500 mt-1">Supabase Authentication</p>
      </div>
    );
  }

  // If not authenticated, render LoginPage
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-surface-light text-slate-800'} font-sans antialiased flex flex-col`}>
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab !== 'new-invoice') setEditingInvoice(null);
            setActiveTab(tab);
          }}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onLogout={handleLogout}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Main Layout Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          
          {/* Top Navbar */}
          <Navbar
            activeTabTitle={tabTitles[activeTab] || 'Dashboard'}
            setMobileOpen={setMobileOpen}
            companyInfo={companyInfo}
            onLogout={handleLogout}
          />

          {/* Page Content with Lazy Loading */}
          <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
            <Suspense fallback={<PageFallback />}>
              {activeTab === 'dashboard' && (
                <DashboardPage
                  stats={stats}
                  invoices={invoices}
                  onNavigate={setActiveTab}
                  onViewInvoice={setPreviewInvoice}
                  onOpenAddProduct={() => setProductModalData({})}
                  onResetTodaySummary={handleResetTodaySummary}
                />
              )}

              {activeTab === 'new-invoice' && (
                <NewInvoicePage
                  companyInfo={companyInfo}
                  products={products}
                  customers={customers}
                  initialInvoice={editingInvoice}
                  onSaveInvoice={handleSaveInvoice}
                  onPreviewInvoice={setPreviewInvoice}
                  onNavigate={setActiveTab}
                  onToast={showToast}
                />
              )}

              {activeTab === 'history' && (
                <InvoiceHistoryPage
                  onViewInvoice={setPreviewInvoice}
                  onEditInvoice={handleEditInvoice}
                  onDeleteInvoice={handleDeleteInvoice}
                  onNavigate={setActiveTab}
                  onToast={showToast}
                />
              )}

              {activeTab === 'products' && (
                <ProductsPage
                  onToast={showToast}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsPage
                  companyInfo={companyInfo}
                  onSaveCompanyInfo={setCompanyInfo}
                  onToast={showToast}
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                />
              )}
            </Suspense>
          </main>
        </div>

        {/* Toast Alert Banner */}
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Invoice A4 Preview & Print Modal */}
        {previewInvoice && (
          <InvoicePreviewModal
            invoice={previewInvoice}
            companyInfo={companyInfo}
            onClose={() => setPreviewInvoice(null)}
            onToast={showToast}
          />
        )}

        {/* Add / Edit Product Modal */}
        {productModalData !== null && (
          <ProductModal
            product={Object.keys(productModalData).length > 0 ? productModalData : null}
            categories={categories}
            onClose={() => setProductModalData(null)}
            onSave={handleSaveProduct}
          />
        )}

      </div>
    </ErrorBoundary>
  );
}
