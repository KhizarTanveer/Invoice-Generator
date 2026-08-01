-- Configure Row Level Security (RLS) for production
-- Restrict all operations (SELECT, INSERT, UPDATE, DELETE) on products, invoices, and invoice_items to authenticated users.

-- 1. Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop all temporary public policies
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "Allow public insert access" ON public.products;
DROP POLICY IF EXISTS "Allow public update access" ON public.products;
DROP POLICY IF EXISTS "Allow public delete access" ON public.products;
DROP POLICY IF EXISTS "Allow public access for products" ON public.products;

DROP POLICY IF EXISTS "Allow public access for invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow public access for invoice_items" ON public.invoice_items;

-- 3. Create production RLS policies for authenticated users
CREATE POLICY "Authenticated users full access on products"
ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access on invoices"
ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users full access on invoice_items"
ON public.invoice_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Set table permissions
REVOKE ALL ON public.products FROM anon;
REVOKE ALL ON public.invoices FROM anon;
REVOKE ALL ON public.invoice_items FROM anon;

GRANT ALL ON public.products TO authenticated, service_role;
GRANT ALL ON public.invoices TO authenticated, service_role;
GRANT ALL ON public.invoice_items TO authenticated, service_role;
