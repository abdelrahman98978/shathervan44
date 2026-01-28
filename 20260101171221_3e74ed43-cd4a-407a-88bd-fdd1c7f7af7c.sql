-- Create newsletter_subscribers table to store newsletter opt-ins
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  source text DEFAULT 'footer',
  is_active boolean NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
FOR INSERT
TO public
WITH CHECK (true);

-- Admins can view and manage subscribers
CREATE POLICY "Admins can manage newsletter subscribers" ON public.newsletter_subscribers
FOR ALL
TO public
USING (has_role(auth.uid(), 'admin'::app_role));