-- Create events table to track blog post performance
CREATE TABLE IF NOT EXISTS public.blog_post_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'view' | 'home_click'
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_post_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert view/click events (no PII stored)
CREATE POLICY "Anyone can insert blog post events"
ON public.blog_post_events
FOR INSERT
TO public
WITH CHECK (true);

-- Only admins can read events for analytics
CREATE POLICY "Admins can read blog post events"
ON public.blog_post_events
FOR SELECT
TO public
USING (has_role(auth.uid(), 'admin'));