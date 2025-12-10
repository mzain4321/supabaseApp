-- -- Disable RLS temporarily for storage.buckets (requires admin)
-- ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- -- Create the bucket
-- INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
-- VALUES (
--   'images',
--   'images',
--   true,
--   false,
--   5242880, -- 5MB
--   ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
-- );

-- -- Re-enable RLS
-- ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- -- Add RLS policies for the bucket
-- CREATE POLICY "Enable read access for all users"
-- ON storage.buckets FOR SELECT
-- USING (true);

-- CREATE POLICY "Enable insert for authenticated users only"
-- ON storage.buckets FOR INSERT
-- WITH CHECK (auth.role() = 'authenticated');

-- -- Now create policies for storage.objects
-- CREATE POLICY "Give users access to own folder"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'images');

-- CREATE POLICY "Allow authenticated users to upload to images bucket"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'images' 
--   AND auth.role() = 'authenticated'
-- );

-- CREATE POLICY "Allow users to update own files"
-- ON storage.objects FOR UPDATE
-- USING (
--   bucket_id = 'images' 
--   AND (storage.foldername(name))[1] = auth.uid()::text
-- );

-- CREATE POLICY "Allow users to delete own files"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'images' 
--   AND (storage.foldername(name))[1] = auth.uid()::text
-- );