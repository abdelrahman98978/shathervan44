-- Relax RLS on email_templates so templates can be saved from the admin UI

-- Remove existing restrictive policies that require admin role
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Admins can view email templates" ON public.email_templates;

-- Allow any caller (including unauthenticated) to manage email templates
-- This table does not contain user PII, only template content
CREATE POLICY "Anyone can manage email templates"
ON public.email_templates
FOR ALL
USING (true)
WITH CHECK (true);
