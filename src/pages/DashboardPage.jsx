import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  DollarSign, 
  Package, 
  Users, 
  PlusCircle, 
  ArrowUpRight, 
  Eye, 
  Calendar,
  Sparkles,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  RotateCcw,
  BarChart3,
  X,
  CalendarDays,
  Receipt,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import { fetchDashboardAnalyticsFromSupabase, formatMonthName } from '../services/dashboardService';

export default function DashboardPage({ 
  onNavigate, 
  onViewInvoice, 
  onOpenAddProduct 
}) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardAnalyticsFromSupabase();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching dashboard analytics from Supabase:', err);
      setError(err.message || 'Failed to load live dashboard analytics from Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-800 rounded-card-lg p-6 lg:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-100 text-xs font-semibold backdrop-blur-md mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" /> Operations Dashboard • Live Supabase Connected
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Welcome, Admin 👋</h1>
          <p className="text-xs lg:text-sm text-brand-100 mt-1 max-w-xl leading-relaxed">
            Real-time operations & financial analytics. Track live sales, issue PKR invoices, and monitor inventory.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 font-bold text-xs border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5"
            title="Refresh Live Dashboard Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => onNavigate('new-invoice')}
            className="px-4 py-2.5 rounded-xl bg-white text-brand-700 hover:bg-brand-50 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-brand-600" /> Create Invoice
          </button>

          <button
            onClick={onOpenAddProduct}
            className="px-4 py-2.5 rounded-xl bg-brand-900/60 text-white hover:bg-brand-950 font-bold text-xs border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-brand-300" /> Add Product
          </button>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <ShoppingBag className="w-72 h-72" />
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
            onClick={loadDashboardData}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main KPI Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Invoices */}
        <StatCard
          title="Total Invoices"
          value={loading ? '...' : (analytics?.totalInvoices || 0)}
          subtitle="Generated in database"
          icon={FileText}
          iconBg="bg-blue-50 text-blue-600"
          trend={`${analytics?.totalInvoices || 0} total`}
          trendUp={true}
        />

        {/* Card 2: Monthly Revenue Card */}
        <div className="bg-white rounded-card p-5 border border-slate-200/80 shadow-card hover:shadow-soft-hover transition-all duration-300 flex flex-col justify-between relative group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Monthly Revenue
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {loading ? '...' : `Rs. ${(analytics?.currentMonthRevenuePKR || 0).toLocaleString()}`}
              </h3>
            </div>
            
            <p className="text-[11px] text-slate-500 mt-1 font-semibold flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-brand-600" /> {analytics?.currentMonthName || formatMonthName(todayStr.slice(0, 7))}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setShowMonthlyModal(true)}
              className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-200/60"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" /> View Monthly History
            </button>
          </div>
        </div>

        {/* Card 3: Total Products */}
        <StatCard
          title="Total Products"
          value={loading ? '...' : (analytics?.totalProducts || 0)}
          subtitle="Inventory catalogue"
          icon={Package}
          iconBg="bg-indigo-50 text-indigo-600"
          trend="Supabase DB"
          trendUp={true}
        />

        {/* Card 4: Total Customers */}
        <StatCard
          title="Total Customers"
          value={loading ? '...' : (analytics?.totalCustomers || 0)}
          subtitle="Unique billed parties"
          icon={Users}
          iconBg="bg-amber-50 text-amber-600"
          trend="Registered"
          trendUp={true}
        />
      </div>

      {/* Second Row: Today's Summary & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Today's Summary (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-card p-6 border border-slate-200/80 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" /> Today's Summary
              </h2>
              <p className="text-xs text-slate-500 font-medium">Live daily performance counters ({todayStr})</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Refresh Today's Counters"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} /> Refresh Counters
              </button>

              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
                Live Daily
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-brand-200 transition-colors">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Invoices Today</span>
              <p className="text-2xl font-black text-slate-900">
                {loading ? '...' : (analytics?.invoicesTodayCount || 0)}
              </p>
              <span className="text-[11px] text-slate-500 font-semibold inline-flex items-center gap-1 mt-1">
                {(analytics?.invoicesTodayCount || 0) > 0 ? `${analytics.invoicesTodayCount} created today` : 'No invoices today'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-200/70 hover:border-brand-300 transition-colors">
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block mb-1">Today's Sales (PKR)</span>
              <p className="text-2xl font-black text-brand-900 font-mono">
                {loading ? '...' : `Rs. ${(analytics?.todaySalesAmount || 0).toLocaleString()}`}
              </p>
              <span className="text-[11px] text-brand-600 font-semibold inline-flex items-center gap-1 mt-1">
                {(analytics?.todaySalesAmount || 0) > 0 ? 'Gross revenue today' : 'Rs. 0 sales today'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-brand-200 transition-colors">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">New Customers</span>
              <p className="text-2xl font-black text-slate-900">
                {loading ? '...' : (analytics?.newCustomersTodayCount || 0)}
              </p>
              <span className="text-[11px] text-slate-500 font-semibold inline-flex items-center gap-1 mt-1">
                First invoice today
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Card (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 rounded-card p-6 text-white border border-slate-800 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" /> Quick Operations
            </h2>
            <p className="text-xs text-slate-400 font-medium mb-4">Direct shortcuts for operational data entry</p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('new-invoice')}
              className="w-full p-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-between transition-all group"
            >
              <span className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4" /> Create New Invoice
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenAddProduct}
              className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-between transition-all group"
            >
              <span className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-brand-400" /> Add New Inventory Product
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('history')}
              className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-between transition-all group"
            >
              <span className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-emerald-400" /> View Full Invoice History
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* Third Section: Recent 10 Invoices Table / Empty State */}
      <div className="bg-white rounded-card border border-slate-200/80 shadow-card overflow-hidden">
        
        {/* Table Header toolbar */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Invoices</h2>
            <p className="text-xs text-slate-500">Latest transactions registered in Supabase database</p>
          </div>

          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100 transition-colors"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table / Loading / Empty State */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 px-4">
            <Loader2 className="w-8 h-8 mx-auto text-brand-600 animate-spin mb-3" />
            <p className="font-bold text-sm text-slate-700">Loading live dashboard metrics from Supabase...</p>
            <p className="text-xs text-slate-400">Querying live database records</p>
          </div>
        ) : (analytics?.recentInvoices || []).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                  <th className="py-3.5 px-5">Invoice #</th>
                  <th className="py-3.5 px-5">Customer Name</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-right">Grand Total (PKR)</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {analytics.recentInvoices.map((inv) => (
                  <tr key={inv.uuid || inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900 font-mono">
                      {inv.invoice_number || inv.id}
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-slate-900">{inv.customerName || inv.customer_name}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {inv.customerPhone || inv.customer_phone || 'No Phone'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono">{inv.date}</td>
                    <td className="py-3.5 px-5 text-right font-mono font-extrabold text-slate-900">
                      Rs. {Number(inv.grandTotal || inv.grand_total || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <StatusBadge status={inv.status || inv.payment_status || 'Paid'} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white font-bold text-[11px] transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 px-4">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="font-extrabold text-base text-slate-800 mb-1">No Invoices Issued Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
              Create your very first invoice to populate real-time Supabase dashboard analytics.
            </p>
            <button
              onClick={() => onNavigate('new-invoice')}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 inline-flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Create First Invoice
            </button>
          </div>
        )}

      </div>

      {/* Monthly Revenue History Modal */}
      {showMonthlyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Monthly Revenue Breakdown</h3>
                  <p className="text-xs text-slate-400">UK Chef Monthly Sales History (PKR)</p>
                </div>
              </div>
              <button
                onClick={() => setShowMonthlyModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Active Month Banner */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Active Month ({analytics?.currentMonthName})
                </span>
                <h4 className="text-3xl font-black text-emerald-600 font-mono">
                  Rs. {(analytics?.currentMonthRevenuePKR || 0).toLocaleString()}
                </h4>
              </div>
              <div className="text-left sm:text-right text-xs text-slate-500">
                <p className="font-bold text-slate-700">{analytics?.currentMonthInvoicesCount || 0} Invoices Issued</p>
                <p className="text-[11px] text-slate-400">Resets automatically on 1st of next month</p>
              </div>
            </div>

            {/* Monthly History List */}
            <div className="p-6 max-h-96 overflow-y-auto space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                All Monthly Records
              </h4>

              {(analytics?.monthlyHistoryList || []).length > 0 ? (
                analytics.monthlyHistoryList.map((item) => {
                  const isCurrent = item.monthKey === analytics?.currentMonthKey;
                  const avgValue = item.count > 0 ? Math.round(item.totalRevenue / item.count) : 0;

                  return (
                    <div 
                      key={item.monthKey}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                        isCurrent 
                          ? 'bg-emerald-50/60 border-emerald-200/80 shadow-xs' 
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-sm text-slate-900">{item.monthName}</h5>
                            {isCurrent && (
                              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {item.count} Invoices • Avg: Rs. {avgValue.toLocaleString()} / inv
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-mono font-black text-base text-slate-900">
                          Rs. {item.totalRevenue.toLocaleString()}
                        </p>
                        <span className="text-[11px] text-emerald-600 font-semibold">Total Revenue</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="text-xs font-semibold text-slate-600">No monthly revenue history recorded yet</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowMonthlyModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Close Breakdown
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
