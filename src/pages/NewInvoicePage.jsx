import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Save, 
  FileText, 
  Calculator, 
  Loader2,
  Printer,
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import { fetchProductsFromSupabase } from '../services/productService';
import { saveInvoiceToSupabase, updateInvoiceInSupabase, generateNextInvoiceNumber } from '../services/invoiceService';

export default function NewInvoicePage({ 
  companyInfo, 
  products = [], 
  customers = [], 
  initialInvoice = null,
  onSaveInvoice, 
  onPreviewInvoice,
  onNavigate,
  onToast 
}) {
  // Supabase Active Products state
  const [activeProducts, setActiveProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Sequential invoice ID (e.g. INV-000001)
  const [invoiceId, setInvoiceId] = useState('INV-000001');

  // Form State - Blank by default
  const [customerName, setCustomerName] = useState(initialInvoice?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialInvoice?.customerPhone || '');
  const [customerAddress, setCustomerAddress] = useState(initialInvoice?.customerAddress || '');
  const [invoiceDate, setInvoiceDate] = useState(
    initialInvoice?.date || new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(
    initialInvoice?.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [paymentStatus, setPaymentStatus] = useState(initialInvoice?.status || 'Paid');

  // Initial Line Items - Blank row
  const createEmptyRow = () => ({
    productId: '',
    productName: '',
    category: '',
    packing: '',
    qty: 1,
    unitPrice: 0,
    total: 0
  });

  const [items, setItems] = useState(
    initialInvoice?.items || [createEmptyRow()]
  );

  const [discount, setDiscount] = useState(initialInvoice?.discount || 0);
  const [taxPercent, setTaxPercent] = useState(
    initialInvoice?.taxPercent !== undefined ? initialInvoice.taxPercent : (companyInfo?.defaultTaxRate || 0)
  );
  const [notes, setNotes] = useState(initialInvoice?.notes || '');

  // Fetch active products directly from Supabase
  useEffect(() => {
    let isMounted = true;
    setLoadingProducts(true);
    fetchProductsFromSupabase()
      .then((data) => {
        if (isMounted && data) {
          const activeOnly = data.filter(p => !p.status || p.status === 'Active');
          setActiveProducts(activeOnly);
        }
      })
      .catch((err) => {
        console.error('Error fetching Supabase products:', err);
        if (isMounted && products && products.length > 0) {
          setActiveProducts(products.filter(p => !p.status || p.status === 'Active'));
        }
      })
      .finally(() => {
        if (isMounted) setLoadingProducts(false);
      });
    return () => { isMounted = false; };
  }, [products]);

  // Fetch / Generate next sequence number from Supabase
  const loadNextInvoiceNumber = useCallback(async () => {
    if (initialInvoice?.id || initialInvoice?.invoice_number) {
      setInvoiceId(initialInvoice.invoice_number || initialInvoice.id);
      return;
    }
    try {
      const nextNum = await generateNextInvoiceNumber();
      setInvoiceId(nextNum);
    } catch (err) {
      console.error('Failed to generate invoice sequence:', err);
      setInvoiceId('INV-000001');
    }
  }, [initialInvoice]);

  useEffect(() => {
    loadNextInvoiceNumber();
    if (initialInvoice) {
      setCustomerName(initialInvoice.customerName || initialInvoice.customer_name || '');
      setCustomerPhone(initialInvoice.customerPhone || initialInvoice.customer_phone || '');
      setCustomerAddress(initialInvoice.customerAddress || initialInvoice.customer_address || '');
      setInvoiceDate(initialInvoice.date || initialInvoice.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]);
      setDueDate(initialInvoice.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setPaymentStatus(initialInvoice.status || initialInvoice.payment_status || 'Paid');
      setItems(initialInvoice.items || [createEmptyRow()]);
      setDiscount(initialInvoice.discount || 0);
      setTaxPercent(initialInvoice.taxPercent !== undefined ? initialInvoice.taxPercent : (initialInvoice.tax || 0));
      setNotes(initialInvoice.notes || '');
    }
  }, [initialInvoice, loadNextInvoiceNumber]);

  // Auto Calculations
  const subtotal = items.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const discountedSubtotal = Math.max(0, subtotal - Number(discount || 0));
  const taxAmount = Math.round(discountedSubtotal * (Number(taxPercent || 0) / 100));
  const grandTotal = discountedSubtotal + taxAmount;

  // Handle Customer Selection Dropdown
  const handleSelectCustomer = (e) => {
    const selectedCustName = e.target.value;
    if (!selectedCustName) return;
    setCustomerName(selectedCustName);
    const foundCust = customers.find(c => c.name === selectedCustName);
    if (foundCust) {
      setCustomerPhone(foundCust.phone || '');
      setCustomerAddress(foundCust.address || '');
    }
  };

  // Product Line Items Handlers
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    const currentItem = { ...updatedItems[index] };

    if (field === 'productId') {
      const foundProduct = activeProducts.find(p => p.id === value);
      if (foundProduct) {
        currentItem.productId = foundProduct.id;
        currentItem.productName = foundProduct.name;
        currentItem.category = foundProduct.category || '';
        currentItem.packing = foundProduct.packing || foundProduct.unit || '';
        const price = Number(foundProduct.trade_price !== undefined ? foundProduct.trade_price : foundProduct.price) || 0;
        currentItem.unitPrice = price;
        currentItem.total = currentItem.qty * price;
      } else {
        currentItem.productId = '';
        currentItem.productName = value;
      }
    } else if (field === 'productName') {
      currentItem.productName = value;
    } else if (field === 'packing') {
      currentItem.packing = value;
    } else if (field === 'qty') {
      const q = Math.max(1, Number(value) || 1);
      currentItem.qty = q;
      currentItem.total = q * Number(currentItem.unitPrice || 0);
    } else if (field === 'unitPrice') {
      const p = Math.max(0, Number(value) || 0);
      currentItem.unitPrice = p;
      currentItem.total = Number(currentItem.qty || 1) * p;
    }

    updatedItems[index] = currentItem;
    setItems(updatedItems);
  };

  const handleAddRow = () => {
    setItems([...items, createEmptyRow()]);
  };

  const handleDeleteRow = (index) => {
    if (items.length <= 1) {
      if (onToast) onToast('Invoice must contain at least 1 item line', 'error');
      return;
    }
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const buildInvoiceObject = () => ({
    id: invoiceId || 'INV-000001',
    invoice_number: invoiceId || 'INV-000001',
    customerName: customerName.trim() || 'Customer Name',
    customer_name: customerName.trim() || 'Customer Name',
    customerPhone,
    customer_phone: customerPhone,
    customerAddress,
    customer_address: customerAddress,
    date: invoiceDate,
    dueDate,
    status: paymentStatus,
    payment_status: paymentStatus,
    items: items.map(item => ({
      ...item,
      product_id: item.productId,
      product_name: item.productName,
      category: item.category,
      packing: item.packing,
      quantity: item.qty,
      unit_price: item.unitPrice,
      line_total: item.total
    })),
    subtotal,
    discount: Number(discount || 0),
    taxPercent: Number(taxPercent || 0),
    taxAmount,
    tax: taxAmount,
    grandTotal,
    grand_total: grandTotal,
    notes
  });

  // Save Invoice to Supabase
  const handleSave = async () => {
    if (!customerName.trim()) {
      if (onToast) onToast('Please enter Customer Name', 'error');
      return;
    }

    const invalidItem = items.find(i => !i.productName || !i.productName.trim());
    if (invalidItem) {
      if (onToast) onToast('Please enter or select a product name for all items', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const invoicePayload = {
        invoice_number: invoiceId,
        customer_name: customerName.trim(),
        customer_phone: customerPhone ? customerPhone.trim() : null,
        customer_address: customerAddress ? customerAddress.trim() : null,
        subtotal,
        discount: Number(discount || 0),
        tax: taxAmount,
        grand_total: grandTotal,
        payment_status: paymentStatus,
        notes: notes ? notes.trim() : null,
        items: items.map(item => ({
          product_id: item.productId,
          product_name: item.productName,
          category: item.category,
          packing: item.packing,
          quantity: item.qty,
          unit_price: item.unitPrice,
          line_total: item.total
        }))
      };

      let result;
      if (initialInvoice && (initialInvoice.uuid || initialInvoice.id)) {
        const targetId = initialInvoice.uuid || initialInvoice.id;
        result = await updateInvoiceInSupabase(targetId, invoicePayload);
        if (onToast) {
          onToast(`Invoice ${invoiceId} updated successfully in Supabase!`, 'success');
        }
      } else {
        result = await saveInvoiceToSupabase(invoicePayload);
        if (onToast) {
          onToast(`Invoice ${result.invoice.invoice_number || invoiceId} saved successfully to Supabase!`, 'success');
        }
      }

      // Notify parent App if callback exists
      if (onSaveInvoice) {
        onSaveInvoice(buildInvoiceObject());
      }

      // Clear/Reset form fields on success
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setItems([createEmptyRow()]);
      setDiscount(0);
      setNotes('');

      // Auto-generate next sequence invoice number
      await loadNextInvoiceNumber();
    } catch (err) {
      console.error('Failed to save invoice to Supabase:', err);
      if (onToast) {
        onToast(`Failed to save invoice: ${err.message}`, 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    const invoiceObj = buildInvoiceObject();
    onPreviewInvoice(invoiceObj);
  };

  const handlePrintDirect = () => {
    const invoiceObj = buildInvoiceObject();
    onPreviewInvoice(invoiceObj);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Create New Invoice</h1>
            <p className="text-xs text-slate-500 font-medium">Auto invoice sequence: <strong className="text-brand-600 font-mono">{invoiceId}</strong></p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePreview}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Eye className="w-4 h-4 text-slate-600" /> Preview A4
          </button>

          <button
            onClick={handlePrintDirect}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4 text-slate-300" /> Print
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Invoice
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Section: Customer Info & Line Items */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Customer Information */}
          <div className="bg-white rounded-card p-6 border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand-600" /> Customer Information
              </h2>
              <span className="text-xs text-slate-400 font-medium">Billed Party</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {customers.length > 0 && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Saved Customer
                  </label>
                  <select
                    onChange={handleSelectCustomer}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 font-semibold text-slate-900"
                  >
                    <option value="">-- Choose from saved customers --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Phone #
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter Phone Number"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter Address"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Line Items Table */}
          <div className="bg-white rounded-card p-6 border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" /> Invoice Items
              </h2>
              <button
                type="button"
                onClick={handleAddRow}
                disabled={isSaving}
                className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Add Item Line
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-3 min-w-[220px]">Select Product</th>
                    <th className="py-3 px-3 w-32">Packing</th>
                    <th className="py-3 px-3 w-20 text-center">Qty</th>
                    <th className="py-3 px-3 w-32 text-right">Trade Price (PKR)</th>
                    <th className="py-3 px-3 w-32 text-right">Total (PKR)</th>
                    <th className="py-3 px-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      
                      {/* Product Select & Custom Name Input */}
                      <td className="py-3 px-3">
                        <select
                          value={row.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          disabled={loadingProducts || isSaving}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white font-semibold text-slate-900 mb-1"
                        >
                          <option value="">
                            {loadingProducts ? 'Loading Supabase products...' : '-- Select Product --'}
                          </option>
                          {activeProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.packing}) - Rs. {Number(p.trade_price).toLocaleString()}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          placeholder="Product description..."
                          value={row.productName}
                          onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                          disabled={isSaving}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50/80 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 font-medium text-slate-700"
                        />
                      </td>

                      {/* Packing */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          placeholder="Packing..."
                          value={row.packing}
                          onChange={(e) => handleItemChange(idx, 'packing', e.target.value)}
                          disabled={isSaving}
                          className="w-full px-2.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white font-mono"
                        />
                      </td>

                      {/* Qty Input */}
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min="1"
                          value={row.qty}
                          onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                          disabled={isSaving}
                          className="w-full px-2 py-2 text-center font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white font-mono"
                        />
                      </td>

                      {/* Trade Price (Unit Price) */}
                      <td className="py-3 px-3">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">Rs.</span>
                          <input
                            type="number"
                            step="any"
                            value={row.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                            disabled={isSaving}
                            className="w-full pl-7 pr-2 py-2 text-right font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white font-mono"
                          />
                        </div>
                      </td>

                      {/* Line Total */}
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900">
                        Rs. {Number(row.total).toLocaleString()}
                      </td>

                      {/* Delete Row */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(idx)}
                          disabled={isSaving}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Remove line item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleAddRow}
                disabled={isSaving}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Add another item line
              </button>
              <span className="text-xs text-slate-400">
                {items.length} line item(s)
              </span>
            </div>
          </div>

          {/* Card 3: Additional Notes */}
          <div className="bg-white rounded-card p-6 border border-slate-200/80 shadow-card">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Invoice Terms & Notes
            </label>
            <textarea
              rows={3}
              placeholder="Enter payment terms or notes for client..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSaving}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 leading-relaxed font-medium text-slate-700 disabled:opacity-50"
            />
          </div>

        </div>

        {/* Right Sidebar: Meta & Calculations */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Invoice Meta Panel */}
          <div className="bg-white rounded-card p-6 border border-slate-200/80 shadow-card space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Invoice Attributes
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Invoice Number #</span>
                <span className="text-[10px] text-brand-600 font-normal">Auto Sequence</span>
              </label>
              <input
                type="text"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                disabled={isSaving}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-brand-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                disabled={isSaving}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Draft">Draft</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Financial Summary Card */}
          <div className="bg-slate-900 rounded-card p-6 text-white border border-slate-800 shadow-card space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
              <Calculator className="w-4 h-4 text-brand-400" /> Payment Summary (PKR)
            </h2>

            <div className="space-y-3 text-xs">
              
              {/* Subtotal */}
              <div className="flex justify-between items-center text-slate-300">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-white">Rs. {subtotal.toLocaleString()}</span>
              </div>

              {/* Discount Input */}
              <div className="flex justify-between items-center text-slate-300 gap-2">
                <span>Discount (PKR):</span>
                <div className="w-32 relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">Rs.</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    disabled={isSaving}
                    className="w-full pl-7 pr-2 py-1 text-right text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Tax Rate % */}
              <div className="flex justify-between items-center text-slate-300 gap-2">
                <span>Tax Rate (%):</span>
                <div className="w-24 relative">
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    disabled={isSaving}
                    className="w-full pr-6 pl-2 py-1 text-right text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono disabled:opacity-50"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">%</span>
                </div>
              </div>

              {/* Tax Amount */}
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Tax Amount:</span>
                <span className="font-mono text-slate-200">Rs. {taxAmount.toLocaleString()}</span>
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-base font-extrabold text-brand-400">
                <span>Grand Total:</span>
                <span className="font-mono text-xl text-white">Rs. {grandTotal.toLocaleString()}</span>
              </div>

            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving to Supabase...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Invoice
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
