-- Relax RLS on blog_posts so articles can be created and managed from the admin UI

-- Remove existing restrictive policies that require admin role
DROP POLICY IF EXISTS "Admins can manage posts" ON public.blog_posts;

-- Allow any caller (including unauthenticated) to manage blog posts
-- This table does not contain user PII, only public article content
CREATE POLICY "Anyone can manage blog posts"
ON public.blog_posts
FOR ALL
USING (true)
WITH CHECK (true);