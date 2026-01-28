-- جدول تذكيرات عروض الكاميرات
CREATE TABLE public.cctv_quote_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.cctv_quotes(id) ON DELETE CASCADE,
  reminder_date TIMESTAMPTZ NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT 'follow_up',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول تذكيرات عروض الماكينات
CREATE TABLE public.machine_quote_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.machine_quotes(id) ON DELETE CASCADE,
  reminder_date TIMESTAMPTZ NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT 'follow_up',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- تمكين RLS
ALTER TABLE public.cctv_quote_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_quote_reminders ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لتذكيرات الكاميرات
CREATE POLICY "Admins can manage cctv reminders" ON public.cctv_quote_reminders
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view cctv reminders" ON public.cctv_quote_reminders
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- سياسات RLS لتذكيرات الماكينات
CREATE POLICY "Admins can manage machine reminders" ON public.machine_quote_reminders
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view machine reminders" ON public.machine_quote_reminders
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Triggers لتحديث updated_at
CREATE TRIGGER update_cctv_quote_reminders_updated_at
  BEFORE UPDATE ON public.cctv_quote_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_machine_quote_reminders_updated_at
  BEFORE UPDATE ON public.machine_quote_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();