-- Add video support columns to banners table
ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image';

-- Add comment for clarity
COMMENT ON COLUMN public.banners.media_type IS 'Type of media: image or video';
COMMENT ON COLUMN public.banners.video_url IS 'URL of the generated video for video banners';