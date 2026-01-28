-- Add tracking columns to email_logs table
ALTER TABLE public.email_logs 
ADD COLUMN IF NOT EXISTS tracking_id uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS opened_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS clicked_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS campaign_id uuid REFERENCES public.marketing_campaigns(id);

-- Create index for tracking
CREATE INDEX IF NOT EXISTS idx_email_logs_tracking_id ON public.email_logs(tracking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign_id ON public.email_logs(campaign_id);

-- Enable realtime for email_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_logs;