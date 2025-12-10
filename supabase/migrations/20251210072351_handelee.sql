-- First, drop existing policies
DROP POLICY IF EXISTS "Public images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Check if bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images1', 'images1', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create new, simpler policies
CREATE POLICY "Enable read access for all users"
ON storage.objects FOR SELECT
USING (bucket_id = 'images1');

CREATE POLICY "Enable insert for authenticated users only"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images1' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Enable update for users based on user_id"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'images1' 
    AND auth.uid() = owner
)
WITH CHECK (
    bucket_id = 'images1' 
    AND auth.uid() = owner
);

CREATE POLICY "Enable delete for users based on user_id"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images1' 
    AND auth.uid() = owner
);

-- Alternative: Allow all authenticated users to upload to any folder (for development)
-- DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
-- CREATE POLICY "Allow authenticated users to upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--     bucket_id = 'images1' 
--     AND auth.role() = 'authenticated'
-- );