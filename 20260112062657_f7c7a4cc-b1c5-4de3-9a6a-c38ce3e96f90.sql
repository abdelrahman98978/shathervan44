-- Create storage bucket for banners with video support
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners', 
  'banners', 
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Anyone can view banners" ON storage.objects
FOR SELECT USING (bucket_id = 'banners');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload banners" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banners');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update banners" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'banners');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete banners" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'banners');