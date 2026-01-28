-- Create solar_quotes table for storing quotes
CREATE TABLE public.solar_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_location TEXT,
  customer_type TEXT,
  system_type TEXT NOT NULL,
  system_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  results_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_cost DECIMAL(12,2),
  status TEXT DEFAULT 'draft',
  notes TEXT,
  follow_up_date TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create solar_component_pricing table for dynamic pricing
CREATE TABLE public.solar_component_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_key TEXT UNIQUE NOT NULL,
  component_name_ar TEXT NOT NULL,
  component_name_en TEXT,
  unit TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID
);

-- Create solar_pricing_history table for tracking price changes
CREATE TABLE public.solar_pricing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_key TEXT NOT NULL,
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now(),
  changed_by UUID
);

-- Enable RLS
ALTER TABLE public.solar_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_component_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_pricing_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for solar_quotes
CREATE POLICY "Admins can manage solar quotes" ON public.solar_quotes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view solar quotes" ON public.solar_quotes
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for solar_component_pricing
CREATE POLICY "Anyone can view pricing" ON public.solar_component_pricing
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage pricing" ON public.solar_component_pricing
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for solar_pricing_history
CREATE POLICY "Admins can view pricing history" ON public.solar_pricing_history
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert pricing history" ON public.solar_pricing_history
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default pricing data
INSERT INTO public.solar_component_pricing (component_key, component_name_ar, component_name_en, unit, price) VALUES
('panel_550w', 'لوح شمسي 550 واط', 'Solar Panel 550W', 'لوح', 120),
('panel_450w', 'لوح شمسي 450 واط', 'Solar Panel 450W', 'لوح', 100),
('inverter_string', 'إنفرتر سلسلي', 'String Inverter', 'كيلوواط', 100),
('inverter_hybrid', 'إنفرتر هجين', 'Hybrid Inverter', 'كيلوواط', 180),
('inverter_pump', 'إنفرتر طرمبة', 'Pump Inverter', 'كيلوواط', 150),
('battery_lithium', 'بطارية ليثيوم', 'Lithium Battery', 'كيلوواط/ساعة', 200),
('battery_gel', 'بطارية جل', 'Gel Battery', 'كيلوواط/ساعة', 100),
('pump_dc_submersible', 'طرمبة غاطسة DC', 'DC Submersible Pump', 'حصان', 400),
('pump_ac_submersible', 'طرمبة غاطسة AC', 'AC Submersible Pump', 'حصان', 300),
('mounting_structure', 'هيكل تثبيت', 'Mounting Structure', 'متر', 25),
('cable_dc', 'كابل DC', 'DC Cable', 'متر', 3),
('cable_ac', 'كابل AC', 'AC Cable', 'متر', 2),
('cable_submersible', 'كابل غاطس', 'Submersible Cable', 'متر', 8),
('mppt_controller', 'منظم MPPT', 'MPPT Controller', 'قطعة', 250),
('installation', 'تكلفة التركيب', 'Installation Cost', 'نسبة %', 12);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_solar_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for solar_quotes
CREATE TRIGGER update_solar_quotes_updated_at
  BEFORE UPDATE ON public.solar_quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_solar_quotes_updated_at();

-- Create function to log pricing changes
CREATE OR REPLACE FUNCTION public.log_pricing_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO public.solar_pricing_history (component_key, old_price, new_price, changed_by)
    VALUES (NEW.component_key, OLD.price, NEW.price, NEW.updated_by);
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for pricing changes
CREATE TRIGGER log_pricing_change
  BEFORE UPDATE ON public.solar_component_pricing
  FOR EACH ROW
  EXECUTE FUNCTION public.log_pricing_change();