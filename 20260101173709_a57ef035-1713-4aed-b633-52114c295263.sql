-- Add category and tags to blog_posts for filtering
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];