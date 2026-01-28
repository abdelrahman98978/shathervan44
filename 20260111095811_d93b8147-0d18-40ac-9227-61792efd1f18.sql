-- Add email field to solar_quotes table
ALTER TABLE public.solar_quotes 
ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Create follow-up reminders table
CREATE TABLE IF NOT EXISTS public.solar_quote_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.solar_quotes(id) ON DELETE CASCADE,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT 'follow_up',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reminders table
ALTER TABLE public.solar_quote_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for reminders
CREATE POLICY "Admins can manage reminders" 
ON public.solar_quote_reminders 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view reminders" 
ON public.solar_quote_reminders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_solar_quote_reminders_updated_at
BEFORE UPDATE ON public.solar_quote_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();