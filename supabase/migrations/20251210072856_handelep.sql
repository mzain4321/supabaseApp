-- Fix storage policies for images1 bucket

-- First, ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('images1', 'images1', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop all existing policies for images1 bucket
DROP POLICY IF EXISTS "Public images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Create new, simpler policies that actually work
-- 1. Anyone can view images
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images1');

-- 2. Authenticated users can upload any file to images1
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images1' 
    AND auth.role() = 'authenticated'
);

-- 3. Users can update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'images1' 
    AND auth.uid() = owner
)
WITH CHECK (
    bucket_id = 'images1' 
    AND auth.uid() = owner
);

-- 4. Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images1' 
    AND auth.uid() = owner
);

-- Alternative: Allow all authenticated operations (for development)
-- DROP POLICY IF EXISTS "Allow all authenticated operations" ON storage.objects;
-- CREATE POLICY "Allow all authenticated operations"
-- ON storage.objects FOR ALL
-- USING (bucket_id = 'images1' AND auth.role() = 'authenticated')
-- WITH CHECK (bucket_id = 'images1' AND auth.role() = 'authenticated');