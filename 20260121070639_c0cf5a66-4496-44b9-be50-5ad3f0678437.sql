-- Create wishlist_items table
CREATE TABLE public.wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id),
  UNIQUE(session_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for wishlist
CREATE POLICY "Users can manage their own wishlist"
ON public.wishlist_items FOR ALL
USING (auth.uid() = user_id OR session_id IS NOT NULL)
WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Anyone can view wishlist items"
ON public.wishlist_items FOR SELECT
USING (true);

-- Create CCTV quotes table
CREATE TABLE public.cctv_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  client_location TEXT,
  customer_type TEXT,
  project_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  results_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_cost NUMERIC,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  follow_up_date TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cctv_quotes ENABLE ROW LEVEL SECURITY;

-- RLS policies for CCTV quotes
CREATE POLICY "Admins can manage CCTV quotes"
ON public.cctv_quotes FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view CCTV quotes"
ON public.cctv_quotes FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create machine quotes table
CREATE TABLE public.machine_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  client_location TEXT,
  customer_type TEXT,
  industry_type TEXT,
  requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
  selected_machines JSONB NOT NULL DEFAULT '{}'::jsonb,
  results_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_cost NUMERIC,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  follow_up_date TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.machine_quotes ENABLE ROW LEVEL SECURITY;

-- RLS policies for machine quotes
CREATE POLICY "Admins can manage machine quotes"
ON public.machine_quotes FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view machine quotes"
ON public.machine_quotes FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_cctv_quotes_updated_at
BEFORE UPDATE ON public.cctv_quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_machine_quotes_updated_at
BEFORE UPDATE ON public.machine_quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();