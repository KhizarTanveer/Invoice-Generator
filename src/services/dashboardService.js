import { supabase } from '../lib/supabase';

// Helper to format YYYY-MM into Month Name (e.g. "August 2026")
export const formatMonthName = (monthKey) => {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Fetch live dashboard analytics from Supabase using concurrent Promise.all execution.
 */
export async function fetchDashboardAnalyticsFromSupabase() {
  const [invoicesRes, productsRes] = await Promise.all([
    supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .order('created_at', { ascending: false }),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
  ]);

  if (invoicesRes.error) {
    throw new Error(invoicesRes.error.message || 'Failed to fetch invoices for dashboard');
  }

  if (productsRes.error) {
    throw new Error(productsRes.error.message || 'Failed to fetch products count for dashboard');
  }

  const invoices = invoicesRes.data || [];
  const totalProducts = productsRes.count || 0;

  // 1. Overall Statistics
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.grand_total || 0), 0);
  
  const customerNamesSet = new Set(
    invoices.map(inv => (inv.customer_name || '').trim()).filter(Boolean)
  );
  const totalCustomers = customerNamesSet.size;

  // 2. Today's Summary (Dynamic based on current local date)
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayInvoices = invoices.filter(inv => {
    if (!inv.created_at) return false;
    return inv.created_at.startsWith(todayStr);
  });

  const invoicesTodayCount = todayInvoices.length;
  const todaySalesAmount = todayInvoices.reduce((sum, inv) => sum + Number(inv.grand_total || 0), 0);

  // Calculate new customers today (customers whose earliest invoice date in database is today)
  const customerFirstInvoiceMap = new Map();
  // Traverse from oldest to newest to find earliest invoice date per customer
  [...invoices].reverse().forEach(inv => {
    const cName = (inv.customer_name || '').trim();
    if (cName && !customerFirstInvoiceMap.has(cName)) {
      const invDate = inv.created_at ? inv.created_at.split('T')[0] : '';
      customerFirstInvoiceMap.set(cName, invDate);
    }
  });

  let newCustomersTodayCount = 0;
  customerFirstInvoiceMap.forEach((firstDate) => {
    if (firstDate === todayStr) {
      newCustomersTodayCount++;
    }
  });

  // 3. Monthly Revenue Calculations
  const currentMonthKey = todayStr.slice(0, 7); // e.g. "2026-08"
  const currentMonthName = formatMonthName(currentMonthKey);
  
  const currentMonthInvoices = invoices.filter(inv => 
    inv.created_at && inv.created_at.startsWith(currentMonthKey)
  );
  const currentMonthRevenuePKR = currentMonthInvoices.reduce((sum, inv) => sum + Number(inv.grand_total || 0), 0);

  // 4. Monthly History Breakdown
  const monthlyGrouped = invoices.reduce((acc, inv) => {
    if (!inv.created_at) return acc;
    const mKey = inv.created_at.slice(0, 7);
    if (!acc[mKey]) {
      acc[mKey] = {
        monthKey: mKey,
        monthName: formatMonthName(mKey),
        totalRevenue: 0,
        count: 0
      };
    }
    acc[mKey].totalRevenue += Number(inv.grand_total || 0);
    acc[mKey].count += 1;
    return acc;
  }, {});

  const monthlyHistoryList = Object.values(monthlyGrouped).sort((a, b) => b.monthKey.localeCompare(a.monthKey));

  // 5. Recent 10 Invoices (Formatted for UI consumption)
  const recentInvoices = invoices.slice(0, 10).map(inv => ({
    id: inv.invoice_number || inv.id,
    uuid: inv.id,
    invoice_number: inv.invoice_number,
    customerName: inv.customer_name,
    customer_name: inv.customer_name,
    customerPhone: inv.customer_phone || '',
    customer_phone: inv.customer_phone || '',
    customerAddress: inv.customer_address || '',
    customer_address: inv.customer_address || '',
    date: inv.created_at ? inv.created_at.split('T')[0] : todayStr,
    created_at: inv.created_at,
    dueDate: inv.created_at ? new Date(new Date(inv.created_at).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : todayStr,
    status: inv.payment_status || 'Paid',
    payment_status: inv.payment_status || 'Paid',
    subtotal: Number(inv.subtotal || 0),
    discount: Number(inv.discount || 0),
    tax: Number(inv.tax || 0),
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

  return {
    totalInvoices,
    totalRevenue,
    totalProducts,
    totalCustomers,
    invoicesTodayCount,
    todaySalesAmount,
    newCustomersTodayCount,
    currentMonthKey,
    currentMonthName,
    currentMonthRevenuePKR,
    currentMonthInvoicesCount: currentMonthInvoices.length,
    monthlyHistoryList,
    recentInvoices,
    allInvoices: invoices
  };
}
