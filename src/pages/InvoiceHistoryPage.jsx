import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Eye, 
  Download, 
  Edit, 
  Trash2, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  User,
  BarChart2,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import jsPDF from 'jspdf';
import { fetchInvoicesFromSupabase, deleteInvoiceFromSupabase } from '../services/invoiceService';

// Helper to extract numeric value from invoice ID (e.g. INV-000001 -> 1, INV-000002 -> 2)
const extractInvoiceNumber = (id) => {
  if (!id) return 0;
  const match = id.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

export default function InvoiceHistoryPage({ 
  onViewInvoice, 
  onEditInvoice, 
  onNavigate,
  onToast 
}) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [customerFilter, setCustomerFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // Default: Newest First
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [showStatementModal, setShowStatementModal] = useState(false);

  const itemsPerPage = 8;

  // Load live invoices from Supabase
  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInvoicesFromSupabase();
      setInvoices(data);
    } catch (err) {
      console.error('Error fetching invoices from Supabase:', err);
      setError(err.message || 'Failed to load invoices from Supabase');
      if (onToast) onToast(err.message || 'Error loading invoices', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Delete invoice handler
  const handleDeleteInvoice = async (id, invNum) => {
    const displayNum = invNum || id;
    if (!window.confirm(`Are you sure you want to delete invoice ${displayNum} from Supabase?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteInvoiceFromSupabase(id);
      setInvoices(prev => prev.filter(i => i.id !== id && i.uuid !== id));
      if (onToast) onToast(`Invoice ${displayNum} deleted successfully from Supabase`, 'info');
    } catch (err) {
      console.error('Error deleting invoice:', err);
      if (onToast) onToast(`Failed to delete invoice: ${err.message}`, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Extract unique customer names
  const customerNamesList = Array.from(
    new Set(invoices.map(i => i.customerName || i.customer_name).filter(Boolean))
  ).sort();

  // Filter logic
  let filtered = invoices.filter((inv) => {
    const invId = (inv.invoice_number || inv.id || '').toLowerCase();
    const custName = (inv.customerName || inv.customer_name || '').toLowerCase();
    const phone = (inv.customerPhone || inv.customer_phone || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = 
      invId.includes(term) ||
      custName.includes(term) ||
      phone.includes(term);

    const invStatus = (inv.status || inv.payment_status || '').toLowerCase();
    const matchesStatus = statusFilter === 'All' || invStatus === statusFilter.toLowerCase();
    const matchesCustomer = customerFilter === 'All' || custName === customerFilter.toLowerCase();
    const matchesDate = !dateFilter || (inv.date && inv.date.includes(dateFilter));

    return matchesSearch && matchesStatus && matchesCustomer && matchesDate;
  });

  // Sort logic (Default: Newest First)
  filtered.sort((a, b) => {
    if (sortBy === 'newest') {
      const dateA = new Date(a.created_at || a.date);
      const dateB = new Date(b.created_at || b.date);
      if (dateB - dateA !== 0) return dateB - dateA;
      return extractInvoiceNumber(b.invoice_number || b.id) - extractInvoiceNumber(a.invoice_number || a.id);
    }
    if (sortBy === 'oldest') {
      const dateA = new Date(a.created_at || a.date);
      const dateB = new Date(b.created_at || b.date);
      if (dateA - dateB !== 0) return dateA - dateB;
      return extractInvoiceNumber(a.invoice_number || a.id) - extractInvoiceNumber(b.invoice_number || b.id);
    }
    if (sortBy === 'highest') return Number(b.grandTotal || b.grand_total || 0) - Number(a.grandTotal || a.grand_total || 0);
    if (sortBy === 'lowest') return Number(a.grandTotal || a.grand_total || 0) - Number(b.grandTotal || b.grand_total || 0);
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedInvoices = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Target customer for Statement Modal
  const activeCustomerName = customerFilter !== 'All' 
    ? customerFilter 
    : (searchTerm.trim() ? searchTerm.trim() : null);

  const statementInvoices = activeCustomerName 
    ? invoices.filter(i => (i.customerName || i.customer_name || '').toLowerCase().includes(activeCustomerName.toLowerCase()))
    : filtered;

  const totalBilledPKR = statementInvoices.reduce((sum, i) => sum + Number(i.grandTotal || i.grand_total || 0), 0);
  const totalPendingPKR = statementInvoices
    .filter(i => {
      const st = (i.status || i.payment_status || '').toLowerCase();
      return st === 'pending' || st === 'overdue';
    })
    .reduce((sum, i) => sum + Number(i.grandTotal || i.grand_total || 0), 0);

  // PDF Export Handler for Customer Account Statement
  const handleDownloadStatementPDF = () => {
    const targetName = activeCustomerName || (statementInvoices[0]?.customerName || 'All_Customers');

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 16;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235);
      doc.text('UK CHEF FOOD DISTRIBUTION', 15, y);

      y += 6;
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('CUSTOMER ACCOUNT LEDGER & INVOICE SUMMARY STATEMENT', 15, y);

      y += 8;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, y, pageWidth - 15, y);
      y += 8;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, y, pageWidth - 30, 24, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('ACCOUNT SUMMARY FOR:', 20, y + 6);

      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(targetName, 20, y + 13);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const phone = statementInvoices[0]?.customerPhone || statementInvoices[0]?.customer_phone || 'N/A';
      const address = statementInvoices[0]?.customerAddress || statementInvoices[0]?.customer_address || 'N/A';
      doc.text(`Phone: ${phone}  |  Address: ${address}`, 20, y + 19);

      y += 30;

      doc.setFillColor(239, 246, 255);
      doc.roundedRect(15, y, 55, 18, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(29, 78, 216);
      doc.text('TOTAL INVOICES', 20, y + 6);
      doc.setFontSize(11);
      doc.text(`${statementInvoices.length} Invoices`, 20, y + 13);

      doc.setFillColor(236, 253, 245);
      doc.roundedRect(77, y, 55, 18, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(4, 120, 87);
      doc.text('TOTAL BILLED (PKR)', 82, y + 6);
      doc.setFontSize(11);
      doc.text(`Rs. ${totalBilledPKR.toLocaleString()}`, 82, y + 13);

      doc.setFillColor(254, 242, 242);
      doc.roundedRect(139, y, 56, 18, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(185, 28, 28);
      doc.text('PENDING BALANCE', 144, y + 6);
      doc.setFontSize(11);
      doc.text(`Rs. ${totalPendingPKR.toLocaleString()}`, 144, y + 13);

      y += 26;

      doc.setFillColor(15, 23, 42);
      doc.rect(15, y, pageWidth - 30, 8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text('Invoice #', 18, y + 5.5);
      doc.text('Date', 50, y + 5.5);
      doc.text('Customer Name', 85, y + 5.5);
      doc.text('Status', 135, y + 5.5);
      doc.text('Amount (PKR)', pageWidth - 20, y + 5.5, { align: 'right' });

      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);

      statementInvoices.forEach((inv, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y, pageWidth - 30, 8, 'F');
        }

        doc.text(inv.invoice_number || inv.id || '', 18, y + 5.5);
        doc.text(inv.date || '', 50, y + 5.5);
        doc.text(inv.customerName || inv.customer_name || '', 85, y + 5.5);
        doc.text(inv.status || inv.payment_status || 'Paid', 135, y + 5.5);
        doc.text(`Rs. ${Number(inv.grandTotal || inv.grand_total || 0).toLocaleString()}`, pageWidth - 20, y + 5.5, { align: 'right' });

        y += 8;
      });

      y += 4;
      doc.setDrawColor(203, 213, 225);
      doc.line(15, y, pageWidth - 15, y);
      y += 6;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(37, 99, 235);
      doc.text('OVERALL LEDGER BILLED TOTAL:', pageWidth - 100, y);
      doc.text(`Rs. ${totalBilledPKR.toLocaleString()}`, pageWidth - 20, y, { align: 'right' });

      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Statement Generated on ${new Date().toLocaleDateString()} • UK Chef Operations`, 15, footerY);

      const fileName = `Statement_${targetName.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);

      if (onToast) onToast(`Downloaded Customer Statement: ${fileName}`, 'success');
    } catch (err) {
      console.error('Customer statement PDF error:', err);
      if (onToast) onToast('Could not save customer statement PDF', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-card border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" /> Invoice History Records
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Live Supabase database sync • {loading ? 'Loading...' : `${invoices.length} total invoices`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadInvoices}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
            title="Refresh Invoices from Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowStatementModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all"
            title="View customer ledger & overall statement PDF"
          >
            <FileSpreadsheet className="w-4 h-4" /> View Customer Statement
          </button>

          <button
            onClick={() => onNavigate('new-invoice')}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Create New Invoice
          </button>
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
            onClick={loadInvoices}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="bg-white rounded-card p-5 border border-slate-200/80 shadow-card space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          
          {/* Customer / ID Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name or invoice number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 font-medium"
            />
          </div>

          {/* Customer Filter Dropdown */}
          <div className="lg:col-span-3">
            <select
              value={customerFilter}
              onChange={(e) => {
                setCustomerFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 font-bold text-slate-900"
            >
              <option value="All">All Customers ({customerNamesList.length})</option>
              {customerNamesList.map((cName, i) => (
                <option key={i} value={cName}>{cName}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 font-bold text-slate-900"
            >
              <option value="All">All Payment Statuses</option>
              <option value="Paid">Paid Only</option>
              <option value="Pending">Pending Only</option>
              <option value="Draft">Draft Only</option>
              <option value="Overdue">Overdue Only</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 font-bold text-brand-700"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

        </div>

        {/* Customer Search Filter Active Banner */}
        {activeCustomerName && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs text-emerald-900">
              <User className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Filtered by Customer: <strong className="text-emerald-950 font-bold">{activeCustomerName}</strong> ({statementInvoices.length} invoices found • Total: <strong>Rs. {totalBilledPKR.toLocaleString()}</strong>)
              </span>
            </div>
            
            <button
              onClick={() => setShowStatementModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <BarChart2 className="w-3.5 h-3.5" /> View Full Customer Statement & Download PDF
            </button>
          </div>
        )}

      </div>

      {/* Main Invoices Table */}
      <div className="bg-white rounded-card border border-slate-200/80 shadow-card overflow-hidden">
        
        {loading ? (
          <div className="py-16 text-center text-slate-500 px-4">
            <Loader2 className="w-8 h-8 mx-auto text-brand-600 animate-spin mb-3" />
            <p className="font-bold text-sm text-slate-700">Loading invoices from Supabase...</p>
            <p className="text-xs text-slate-400">Fetching invoice headers and line items</p>
          </div>
        ) : paginatedInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-5">Invoice #</th>
                  <th className="py-3.5 px-5">Customer Name & Contact</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-center">Items</th>
                  <th className="py-3.5 px-5 text-right">Grand Total (PKR)</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedInvoices.map((inv, idx) => {
                  const lineIndex = ((currentPage - 1) * itemsPerPage) + idx + 1;
                  const itemCount = inv.items ? inv.items.length : 0;
                  const targetId = inv.uuid || inv.id;
                  const displayInvNum = inv.invoice_number || inv.id;

                  return (
                    <tr key={inv.uuid || inv.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      
                      <td className="py-4 px-4 text-center font-extrabold text-slate-400">
                        {lineIndex}
                      </td>

                      <td className="py-4 px-5 font-bold text-brand-700 font-mono">
                        {displayInvNum}
                      </td>

                      <td className="py-4 px-5">
                        <p 
                          onClick={() => {
                            setCustomerFilter(inv.customerName || inv.customer_name);
                            setShowStatementModal(true);
                          }}
                          className="font-bold text-slate-900 cursor-pointer hover:text-brand-600 transition-colors inline-flex items-center gap-1"
                          title="Click to view full customer statement"
                        >
                          {inv.customerName || inv.customer_name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {inv.customerPhone || inv.customer_phone || 'No Phone'}
                        </p>
                      </td>

                      <td className="py-4 px-5 text-slate-500 font-mono">
                        {inv.date}
                      </td>

                      <td className="py-4 px-5 text-center font-mono font-bold text-slate-700">
                        {itemCount} item(s)
                      </td>

                      <td className="py-4 px-5 text-right font-mono font-extrabold text-slate-900">
                        Rs. {Number(inv.grandTotal || inv.grand_total || 0).toLocaleString()}
                      </td>

                      <td className="py-4 px-5 text-center">
                        <StatusBadge status={inv.status || inv.payment_status || 'Paid'} />
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewInvoice(inv)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="View Invoice & Print A4 PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditInvoice(inv)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit Invoice"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteInvoice(targetId, displayInvNum)}
                            disabled={deletingId === targetId}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                            title="Delete Invoice"
                          >
                            {deletingId === targetId ? (
                              <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 px-4">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="font-extrabold text-base text-slate-800 mb-1">No Matching Invoices Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
              Try adjusting your customer search query or payment status filter options.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setCustomerFilter('All');
                setDateFilter('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>
              Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong>–<strong>{Math.min(currentPage * itemsPerPage, filtered.length)}</strong> of <strong>{filtered.length}</strong> Invoices
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-3 py-1 font-bold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Customer Account Statement Modal */}
      {showStatementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Customer Account Statement</h3>
                  <p className="text-xs text-slate-400">UK Chef Customer Ledger & Summary</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadStatementPDF}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md"
                >
                  <Download className="w-4 h-4" /> Download Statement PDF
                </button>

                <button
                  onClick={() => setShowStatementModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white text-slate-900">
              
              {/* Customer Selector Inside Modal */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Select Customer Ledger
                  </span>
                  <select
                    value={activeCustomerName || 'All'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'All') {
                        setCustomerFilter('All');
                        setSearchTerm('');
                      } else {
                        setCustomerFilter(val);
                      }
                    }}
                    className="px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="All">-- Overall All Customers Ledger --</option>
                    {customerNamesList.map((cName, i) => (
                      <option key={i} value={cName}>{cName}</option>
                    ))}
                  </select>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-500">Statement Date</p>
                  <p className="text-xs font-bold text-slate-800">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Financial KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1">Total Invoices</span>
                  <p className="text-2xl font-black text-blue-900">{statementInvoices.length}</p>
                  <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Invoices recorded</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">Total Billed (PKR)</span>
                  <p className="text-2xl font-black text-emerald-900 font-mono">Rs. {totalBilledPKR.toLocaleString()}</p>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Gross billing volume</span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-1">Pending Balance</span>
                  <p className="text-2xl font-black text-rose-900 font-mono">Rs. {totalPendingPKR.toLocaleString()}</p>
                  <span className="text-[11px] text-rose-600 font-semibold mt-1 block">Unpaid invoices</span>
                </div>
              </div>

              {/* Customer Statement Invoice Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Account Invoices & Ledger Transactions
                </h4>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Customer Name</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Amount (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {statementInvoices.map((inv) => (
                        <tr key={inv.uuid || inv.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900 font-mono">{inv.invoice_number || inv.id}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{inv.date}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{inv.customerName || inv.customer_name}</td>
                          <td className="py-3 px-4 text-center">
                            <StatusBadge status={inv.status || inv.payment_status} />
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            Rs. {Number(inv.grandTotal || inv.grand_total || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Customer Statement • UK Chef Portal
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadStatementPDF}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" /> Download Statement PDF
                </button>
                <button
                  onClick={() => setShowStatementModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
