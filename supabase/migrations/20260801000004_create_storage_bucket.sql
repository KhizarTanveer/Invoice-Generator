-- Create 'company-assets' Storage Bucket & RLS Policies in Supabase

-- 1. Insert 'company-assets' bucket into storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'company-assets', 
    'company-assets', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Drop existing policies if any
DROP POLICY IF EXISTS "Public Read Access for Company Assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert for Company Assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update for Company Assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete for Company Assets" ON storage.objects;

-- 3. Production RLS Policies on storage.objects

-- Public Read: Allows anyone to view uploaded company logos on invoices & portals
CREATE POLICY "Public Read Access for Company Assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-assets');

-- Authenticated Insert: Allows logged-in admins to upload logos & images
CREATE POLICY "Authenticated Insert for Company Assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-assets');

-- Authenticated Update: Allows logged-in admins to overwrite logo files
CREATE POLICY "Authenticated Update for Company Assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-assets')
WITH CHECK (bucket_id = 'company-assets');

-- Authenticated Delete: Allows logged-in admins to remove logo files
CREATE POLICY "Authenticated Delete for Company Assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'company-assets');
