import { supabase } from '../lib/supabase';

const DEFAULT_SETTINGS = {
  id: 'default',
  name: 'UK CHEF FOOD DISTRIBUTION',
  tagline: 'Wholesale Recipe & Food Distribution System',
  logoUrl: 'https://res.cloudinary.com/dwgwwlbrg/image/upload/v1784386120/PHOTO-2026-07-16-15-43-03_y1kevv.jpg',
  company_logo_url: 'https://res.cloudinary.com/dwgwwlbrg/image/upload/v1784386120/PHOTO-2026-07-16-15-43-03_y1kevv.jpg',
  address: 'Main Boulevard, Gulberg III, Lahore, Pakistan',
  phone: '+92 300 1234567',
  email: 'info@ukchef.pk',
  website: 'https://ukchef.pk',
  city: 'Lahore, Pakistan',
  ntn: '1234567-8',
  gst: '12-34-5678-901-23',
  invoicePrefix: 'INV-',
  startingNumber: 1,
  defaultTaxRate: 0,
  currency: 'PKR',
  currencySymbol: 'Rs.',
  paymentTerms: 'Payment due within 14 days of invoice issue.',
  footerNote: 'Thank you for your business with UK Chef Food Distribution!',
  bankName: 'Meezan Bank Limited',
  accountTitle: 'UK CHEF FOOD DISTRIBUTION',
  accountNumber: '01020304050607',
  iban: 'PK92MEZN0001020304050607'
};

let cachedSettings = null;

/**
 * Validate company settings input fields.
 */
export function validateCompanySettings(data) {
  if (!data.name || !data.name.trim()) {
    throw new Error('Official Company Name is required');
  }

  if (!data.phone || !data.phone.trim()) {
    throw new Error('Company Phone Number is required');
  }

  if (data.email && data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      throw new Error('Please enter a valid Company Email address');
    }
  }

  if (data.defaultTaxRate !== undefined && data.defaultTaxRate !== null) {
    const tax = Number(data.defaultTaxRate);
    if (isNaN(tax) || tax < 0 || tax > 100) {
      throw new Error('Default Tax Percentage must be a value between 0 and 100');
    }
  }

  if (data.website && data.website.trim() && data.website.trim() !== '#') {
    try {
      const urlStr = data.website.trim().startsWith('http') ? data.website.trim() : `https://${data.website.trim()}`;
      new URL(urlStr);
    } catch {
      throw new Error('Please enter a valid website URL (e.g. https://ukchef.pk)');
    }
  }

  return true;
}

/**
 * Fetch company settings from Supabase.
 */
export async function fetchCompanySettingsFromSupabase(forceRefresh = false) {
  if (!forceRefresh && cachedSettings) {
    return cachedSettings;
  }
  try {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      cachedSettings = DEFAULT_SETTINGS;
      return DEFAULT_SETTINGS;
    }

    const normalized = {
      id: data.id,
      name: data.company_name || DEFAULT_SETTINGS.name,
      tagline: DEFAULT_SETTINGS.tagline,
      logoUrl: data.company_logo_url || DEFAULT_SETTINGS.logoUrl,
      company_logo_url: data.company_logo_url || DEFAULT_SETTINGS.logoUrl,
      address: data.company_address || DEFAULT_SETTINGS.address,
      phone: data.company_phone || DEFAULT_SETTINGS.phone,
      email: data.company_email || DEFAULT_SETTINGS.email,
      website: data.company_website || DEFAULT_SETTINGS.website,
      city: 'Lahore, Pakistan',
      ntn: data.company_ntn || DEFAULT_SETTINGS.ntn,
      gst: data.company_gst || DEFAULT_SETTINGS.gst,
      invoicePrefix: data.invoice_prefix || DEFAULT_SETTINGS.invoicePrefix,
      startingNumber: DEFAULT_SETTINGS.startingNumber,
      defaultTaxRate: Number(data.default_tax_percentage || 0),
      currency: data.currency || DEFAULT_SETTINGS.currency,
      currencySymbol: data.currency_symbol || DEFAULT_SETTINGS.currencySymbol,
      paymentTerms: data.payment_terms || DEFAULT_SETTINGS.paymentTerms,
      footerNote: data.footer_note || DEFAULT_SETTINGS.footerNote,
      bankName: data.bank_name || DEFAULT_SETTINGS.bankName,
      accountTitle: data.bank_account_title || DEFAULT_SETTINGS.accountTitle,
      accountNumber: data.bank_account_number || DEFAULT_SETTINGS.accountNumber,
      iban: data.iban || DEFAULT_SETTINGS.iban
    };

    cachedSettings = normalized;
    return normalized;
  } catch (err) {
    console.warn('Company settings fetch warning:', err);
    cachedSettings = DEFAULT_SETTINGS;
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update company settings in Supabase.
 */
export async function updateCompanySettingsInSupabase(data) {
  validateCompanySettings(data);

  const payload = {
    company_name: (data.name || data.company_name).trim(),
    company_logo_url: data.logoUrl || data.company_logo_url || null,
    company_address: (data.address || '').trim() || null,
    company_phone: (data.phone || '').trim() || null,
    company_email: (data.email || '').trim() || null,
    company_website: (data.website || '').trim() || null,
    company_ntn: (data.ntn || '').trim() || null,
    company_gst: (data.gst || '').trim() || null,
    invoice_prefix: (data.invoicePrefix || 'INV').trim(),
    currency: (data.currency || 'PKR').trim(),
    currency_symbol: (data.currencySymbol || 'Rs.').trim(),
    default_tax_percentage: Number(data.defaultTaxRate || 0),
    payment_terms: (data.paymentTerms || '').trim() || null,
    footer_note: (data.footerNote || '').trim() || null,
    bank_name: (data.bankName || '').trim() || null,
    bank_account_title: (data.accountTitle || '').trim() || null,
    bank_account_number: (data.accountNumber || '').trim() || null,
    iban: (data.iban || '').trim() || null,
    updated_at: new Date().toISOString()
  };

  let targetId = data.id;

  // Check if a row exists
  if (!targetId || targetId === 'default') {
    const { data: existing } = await supabase.from('company_settings').select('id').limit(1).maybeSingle();
    if (existing && existing.id) {
      targetId = existing.id;
    }
  }

  let result;
  if (targetId && targetId !== 'default') {
    const { data: updated, error } = await supabase
      .from('company_settings')
      .update(payload)
      .eq('id', targetId)
      .select();

    if (error) throw new Error(error.message || 'Failed to update company settings');
    result = updated && updated[0] ? updated[0] : payload;
  } else {
    const { data: inserted, error } = await supabase
      .from('company_settings')
      .insert([payload])
      .select();

    if (error) throw new Error(error.message || 'Failed to insert company settings');
    result = inserted && inserted[0] ? inserted[0] : payload;
  }

  const updatedNormalized = {
    ...data,
    id: result.id || targetId || 'default',
    name: result.company_name || data.name,
    logoUrl: result.company_logo_url || data.logoUrl,
    address: result.company_address || data.address,
    phone: result.company_phone || data.phone,
    email: result.company_email || data.email,
    website: result.company_website || data.website,
    ntn: result.company_ntn || data.ntn,
    gst: result.company_gst || data.gst,
    invoicePrefix: result.invoice_prefix || data.invoicePrefix,
    defaultTaxRate: Number(result.default_tax_percentage || 0),
    paymentTerms: result.payment_terms || data.paymentTerms,
    footerNote: result.footer_note || data.footerNote,
    bankName: result.bank_name || data.bankName,
    accountTitle: result.bank_account_title || data.accountTitle,
    accountNumber: result.bank_account_number || data.accountNumber,
    iban: result.iban || data.iban
  };

  cachedSettings = updatedNormalized;
  return updatedNormalized;
}

/**
 * Upload logo/asset to Supabase Storage bucket 'company-assets'.
 * Falls back to base64 Data URL if storage bucket is unavailable.
 */
export async function uploadCompanyAssetToSupabase(file) {
  if (!file) return null;

  try {
    const fileExt = file.name ? file.name.split('.').pop() : 'png';
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('company-assets')
      .upload(filePath, file, { upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);

      if (publicUrlData && publicUrlData.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (err) {
    console.warn('Supabase storage upload fallback:', err);
  }

  // Fallback: Read file as Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
