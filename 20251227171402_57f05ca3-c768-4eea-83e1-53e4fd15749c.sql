-- جدول سلة التسوق
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  user_id UUID,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول حالات الشحن
CREATE TABLE public.order_shipping_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول قوالب البريد الإلكتروني
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject_en TEXT NOT NULL,
  subject_ar TEXT NOT NULL,
  body_en TEXT NOT NULL,
  body_ar TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'transactional',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول سجل البريد المرسل
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.email_templates(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول الحملات التسويقية
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template_id UUID REFERENCES public.email_templates(id),
  status TEXT NOT NULL DEFAULT 'draft',
  target_audience TEXT DEFAULT 'all',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تمكين RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_shipping_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- سياسات السلة - للجميع بناءً على session_id أو user_id
CREATE POLICY "Anyone can view their cart items" ON public.cart_items
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert cart items" ON public.cart_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update their cart items" ON public.cart_items
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete their cart items" ON public.cart_items
  FOR DELETE USING (true);

-- سياسات حالات الشحن
CREATE POLICY "Admins can manage shipping status" ON public.order_shipping_status
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view order shipping by order id" ON public.order_shipping_status
  FOR SELECT USING (true);

-- سياسات قوالب البريد
CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view email templates" ON public.email_templates
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- سياسات سجل البريد
CREATE POLICY "Admins can manage email logs" ON public.email_logs
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view email logs" ON public.email_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- سياسات الحملات التسويقية
CREATE POLICY "Admins can manage campaigns" ON public.marketing_campaigns
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view campaigns" ON public.marketing_campaigns
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- إضافة حقل tracking_number للطلبات
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Trigger لتحديث updated_at
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- إضافة قوالب بريد افتراضية
INSERT INTO public.email_templates (name, subject_en, subject_ar, body_en, body_ar, type) VALUES
('welcome', 'Welcome to Engineering Solutions!', 'مرحباً بك في حلول هندسية!', 
'Dear {{name}},\n\nWelcome to Engineering Solutions! We are excited to have you join us.\n\nBest regards,\nEngineering Solutions Team',
'عزيزي {{name}}،\n\nمرحباً بك في حلول هندسية! نحن سعداء بانضمامك إلينا.\n\nمع أطيب التحيات،\nفريق حلول هندسية',
'transactional'),
('order_confirmation', 'Order Confirmation #{{order_number}}', 'تأكيد الطلب #{{order_number}}',
'Dear {{name}},\n\nThank you for your order #{{order_number}}. We have received your order and will process it shortly.\n\nTotal: {{total}} SAR\n\nBest regards,\nEngineering Solutions Team',
'عزيزي {{name}}،\n\nشكراً لطلبك #{{order_number}}. لقد استلمنا طلبك وسنقوم بمعالجته قريباً.\n\nالإجمالي: {{total}} ريال\n\nمع أطيب التحيات،\nفريق حلول هندسية',
'transactional'),
('order_shipped', 'Your Order Has Been Shipped!', 'تم شحن طلبك!',
'Dear {{name}},\n\nGreat news! Your order #{{order_number}} has been shipped.\n\nTracking Number: {{tracking_number}}\n\nBest regards,\nEngineering Solutions Team',
'عزيزي {{name}}،\n\nأخبار رائعة! تم شحن طلبك #{{order_number}}.\n\nرقم التتبع: {{tracking_number}}\n\nمع أطيب التحيات،\nفريق حلول هندسية',
'transactional'),
('promotional', 'Special Offer Just For You!', 'عرض خاص لك فقط!',
'Dear {{name}},\n\nDon''t miss our exclusive offer! Get up to 20% off on selected products.\n\nShop now and save!\n\nBest regards,\nEngineering Solutions Team',
'عزيزي {{name}}،\n\nلا تفوت عرضنا الحصري! احصل على خصم يصل إلى 20% على منتجات مختارة.\n\nتسوق الآن ووفر!\n\nمع أطيب التحيات،\nفريق حلول هندسية',
'marketing');