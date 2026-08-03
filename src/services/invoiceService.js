import { supabase } from '../lib/supabase';

/**
 * Generate the next sequential invoice number in format INV-000001
 */
export async function generateNextInvoiceNumber() {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('Error querying invoice sequence from Supabase:', error.message);
      return 'INV-000001';
    }

    let maxNum = 0;
    if (data && data.length > 0) {
      data.forEach(inv => {
        if (inv.invoice_number) {
          const match = inv.invoice_number.match(/\d+$/);
          if (match) {
            const num = parseInt(match[0], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        }
      });
    }

    const nextNum = maxNum + 1;
    return `INV-${String(nextNum).padStart(6, '0')}`;
  } catch (err) {
    console.error('Invoice number generation error:', err);
    return 'INV-000001';
  }
}

/**
 * Fetch all invoices with relational line items from Supabase ordered by newest first.
 */
export async function fetchInvoicesFromSupabase() {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, items:invoice_items(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to fetch invoices from Supabase');
  }

  // Normalize data for UI component compatibility
  return (data || []).map(inv => ({
    id: inv.invoice_number || inv.id,
    uuid: inv.id,
    invoice_number: inv.invoice_number,
    customerName: inv.customer_name,
    customer_name: inv.customer_name,
    customerPhone: inv.customer_phone || '',
    customer_phone: inv.customer_phone || '',
    customerAddress: inv.customer_address || '',
    customer_address: inv.customer_address || '',
    date: inv.created_at ? inv.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    created_at: inv.created_at,
    dueDate: inv.created_at ? new Date(new Date(inv.created_at).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: inv.payment_status || 'Paid',
    payment_status: inv.payment_status || 'Paid',
    subtotal: Number(inv.subtotal || 0),
    discount: Number(inv.discount || 0),
    tax: Number(inv.tax || 0),
    taxPercent: inv.subtotal ? Math.round((Number(inv.tax || 0) / Math.max(1, Number(inv.subtotal) - Number(inv.discount || 0))) * 100) : 0,
    taxAmount: Number(inv.tax || 0),
    grandTotal: Number(inv.grand_total || 0),
    grand_total: Number(inv.grand_total || 0),
    notes: inv.notes || '',
    items: (inv.items || []).map(item => ({
      id: item.id,
      productId: item.product_id || '',
      product_id: item.product_id || '',
      productName: item.product_name,
      product_name: item.product_name,
      category: item.category || '',
      packing: item.packing || '',
      qty: Number(item.quantity || 1),
      quantity: Number(item.quantity || 1),
      unitPrice: Number(item.unit_price || 0),
      unit_price: Number(item.unit_price || 0),
      total: Number(item.line_total || 0),
      line_total: Number(item.line_total || 0)
    }))
  }));
}

/**
 * Save an invoice header and all line items atomically to Supabase.
 */
export async function saveInvoiceToSupabase(invoiceData) {
  if (!invoiceData.customer_name || !invoiceData.customer_name.trim()) {
    throw new Error('Customer Name is required');
  }

  if (!invoiceData.items || invoiceData.items.length === 0) {
    throw new Error('Invoice must contain at least one product item');
  }

  for (const item of invoiceData.items) {
    if (!item.product_name || !item.product_name.trim()) {
      throw new Error('Product name is required for all line items');
    }
  }

  const invNumber = invoiceData.invoice_number || (await generateNextInvoiceNumber());

  const headerPayload = {
    invoice_number: invNumber,
    customer_name: invoiceData.customer_name.trim(),
    customer_phone: invoiceData.customer_phone ? invoiceData.customer_phone.trim() : null,
    customer_address: invoiceData.customer_address ? invoiceData.customer_address.trim() : null,
    subtotal: Number(invoiceData.subtotal || 0),
    discount: Number(invoiceData.discount || 0),
    tax: Number(invoiceData.tax || 0),
    grand_total: Number(invoiceData.grand_total || 0),
    payment_status: invoiceData.payment_status || 'Paid',
    notes: invoiceData.notes ? invoiceData.notes.trim() : null
  };

  const { data: headerData, error: headerError } = await supabase
    .from('invoices')
    .insert([headerPayload])
    .select();

  if (headerError) {
    throw new Error(headerError.message || 'Failed to save invoice header to Supabase');
  }

  const createdInvoice = headerData && headerData[0] ? headerData[0] : null;

  if (!createdInvoice) {
    throw new Error('Failed to retrieve created invoice record from Supabase');
  }

  const itemsPayload = invoiceData.items.map(item => ({
    invoice_id: createdInvoice.id,
    product_id: (item.product_id && item.product_id.length > 20) ? item.product_id : (item.productId && item.productId.length > 20 ? item.productId : null),
    product_name: (item.product_name || item.productName).trim(),
    category: item.category || null,
    packing: item.packing || null,
    quantity: Number(item.quantity || item.qty || 1),
    unit_price: Number(item.unit_price || item.unitPrice || 0),
    line_total: Number(item.line_total || item.total || 0)
  }));

  const { data: itemsData, error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsPayload)
    .select();

  if (itemsError) {
    console.error('Line items insertion error. Rolling back invoice header...', itemsError);
    await supabase.from('invoices').delete().eq('id', createdInvoice.id);
    throw new Error(`Failed to save invoice items: ${itemsError.message}`);
  }

  return {
    invoice: createdInvoice,
    items: itemsData || []
  };
}

/**
 * Update an existing invoice and its line items in Supabase.
 */
export async function updateInvoiceInSupabase(id, invoiceData) {
  // First locate target record UUID
  let uuidTarget = id;
  if (!id.includes('-') || id.startsWith('INV-')) {
    const { data: searchData } = await supabase
      .from('invoices')
      .select('id')
      .eq('invoice_number', id)
      .maybeSingle();
    if (searchData && searchData.id) {
      uuidTarget = searchData.id;
    }
  }

  const headerPayload = {
    customer_name: (invoiceData.customer_name || invoiceData.customerName).trim(),
    customer_phone: (invoiceData.customer_phone || invoiceData.customerPhone || '').trim() || null,
    customer_address: (invoiceData.customer_address || invoiceData.customerAddress || '').trim() || null,
    subtotal: Number(invoiceData.subtotal || 0),
    discount: Number(invoiceData.discount || 0),
    tax: Number(invoiceData.tax || invoiceData.taxAmount || 0),
    grand_total: Number(invoiceData.grand_total || invoiceData.grandTotal || 0),
    payment_status: invoiceData.payment_status || invoiceData.status || 'Paid',
    notes: (invoiceData.notes || '').trim() || null
  };

  const { data: updatedHeader, error: headerError } = await supabase
    .from('invoices')
    .update(headerPayload)
    .eq('id', uuidTarget)
    .select();

  if (headerError) {
    throw new Error(headerError.message || 'Failed to update invoice in Supabase');
  }

  // Replace line items: Delete old items, insert updated items
  await supabase.from('invoice_items').delete().eq('invoice_id', uuidTarget);

  const itemsPayload = (invoiceData.items || []).map(item => ({
    invoice_id: uuidTarget,
    product_id: (item.product_id && item.product_id.length > 20) ? item.product_id : (item.productId && item.productId.length > 20 ? item.productId : null),
    product_name: (item.product_name || item.productName || '').trim(),
    category: item.category || null,
    packing: item.packing || null,
    quantity: Number(item.quantity || item.qty || 1),
    unit_price: Number(item.unit_price || item.unitPrice || 0),
    line_total: Number(item.line_total || item.total || 0)
  }));

  if (itemsPayload.length > 0) {
    const { data: updatedItems, error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsPayload)
      .select();

    if (itemsError) {
      throw new Error(`Failed to update invoice items: ${itemsError.message}`);
    }

    return { invoice: updatedHeader[0], items: updatedItems };
  }

  return { invoice: updatedHeader[0], items: [] };
}

/**
 * Delete an invoice from Supabase by ID or invoice_number.
 * Relational foreign key ON DELETE CASCADE automatically deletes invoice_items.
 */
export async function deleteInvoiceFromSupabase(id) {
  let query = supabase.from('invoices').delete();

  if (id.includes('-') && id.startsWith('INV-')) {
    query = query.eq('invoice_number', id);
  } else {
    query = query.eq('id', id);
  }

  const { error } = await query;

  if (error) {
    throw new Error(error.message || 'Failed to delete invoice from Supabase');
  }

  return true;
}

/**
 * Update payment status of an invoice in Supabase.
 * Supports status: Paid, Pending, Overdue.
 * Enforces security rule: Paid status is permanent and cannot be reverted.
 */
export async function updateInvoiceStatusInSupabase(id, status) {
  if (!id) throw new Error('Invoice ID is required');

  const validStatuses = ['Paid', 'Pending', 'Overdue'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid payment status: ${status}`);
  }

  let uuidTarget = id;
  let queryField = 'id';

  if (id.includes('-') && id.startsWith('INV-')) {
    queryField = 'invoice_number';
  }

  // Check current status in Supabase before attempting update
  const { data: currentInvoice, error: fetchErr } = await supabase
    .from('invoices')
    .select('id, payment_status')
    .eq(queryField, id)
    .maybeSingle();

  if (fetchErr) {
    throw new Error(fetchErr.message || 'Failed to verify current invoice status');
  }

  if (currentInvoice) {
    if (currentInvoice.payment_status === 'Paid' && status !== 'Paid') {
      throw new Error('Payment status is already Paid and cannot be changed back.');
    }
    uuidTarget = currentInvoice.id;
  }

  const { data, error } = await supabase
    .from('invoices')
    .update({ payment_status: status })
    .eq('id', uuidTarget)
    .select();

  if (error) {
    throw new Error(error.message || 'Failed to update payment status in Supabase');
  }

  return data && data[0] ? data[0] : null;
}
