-- Create company_settings table & security policies
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'UK CHEF FOOD DISTRIBUTION',
    company_logo_url TEXT,
    company_address TEXT DEFAULT 'Main Boulevard, Gulberg III, Lahore, Pakistan',
    company_phone TEXT DEFAULT '+92 300 1234567',
    company_email TEXT DEFAULT 'info@ukchef.pk',
    company_website TEXT DEFAULT 'https://ukchef.pk',
    company_ntn TEXT DEFAULT '1234567-8',
    company_gst TEXT DEFAULT '12-34-5678-901-23',
    invoice_prefix TEXT DEFAULT 'INV',
    currency TEXT DEFAULT 'PKR',
    currency_symbol TEXT DEFAULT 'Rs.',
    default_tax_percentage NUMERIC DEFAULT 0,
    payment_terms TEXT DEFAULT 'Payment due within 14 days of invoice issue.',
    footer_note TEXT DEFAULT 'Thank you for your business with UK Chef Food Distribution!',
    bank_name TEXT DEFAULT 'Meezan Bank Limited',
    bank_account_title TEXT DEFAULT 'UK CHEF FOOD DISTRIBUTION',
    bank_account_number TEXT DEFAULT '01020304050607',
    iban TEXT DEFAULT 'PK92MEZN0001020304050607',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access on company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "Authenticated users manage company_settings" ON public.company_settings;

-- RLS policies
CREATE POLICY "Allow public read access on company_settings" ON public.company_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage company_settings" ON public.company_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Permissions
GRANT SELECT ON public.company_settings TO anon;
GRANT ALL ON public.company_settings TO authenticated, service_role;

-- Seed initial row if table is empty
INSERT INTO public.company_settings (
    company_name,
    company_logo_url,
    company_address,
    company_phone,
    company_email,
    company_website,
    company_ntn,
    company_gst,
    invoice_prefix,
    currency,
    currency_symbol,
    default_tax_percentage,
    payment_terms,
    footer_note,
    bank_name,
    bank_account_title,
    bank_account_number,
    iban
) SELECT 
    'UK CHEF FOOD DISTRIBUTION',
    'https://res.cloudinary.com/dwgwwlbrg/image/upload/v1784386120/PHOTO-2026-07-16-15-43-03_y1kevv.jpg',
    'Main Boulevard, Gulberg III, Lahore, Pakistan',
    '+92 300 1234567',
    'info@ukchef.pk',
    'https://ukchef.pk',
    '1234567-8',
    '12-34-5678-901-23',
    'INV',
    'PKR',
    'Rs.',
    0,
    'Payment due within 14 days of invoice issue.',
    'Thank you for your business with UK Chef Food Distribution!',
    'Meezan Bank Limited',
    'UK CHEF FOOD DISTRIBUTION',
    '01020304050607',
    'PK92MEZN0001020304050607'
WHERE NOT EXISTS (SELECT 1 FROM public.company_settings);
