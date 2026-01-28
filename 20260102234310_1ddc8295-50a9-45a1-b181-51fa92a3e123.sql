-- Add banner_image column to email_templates table
ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS banner_image TEXT;