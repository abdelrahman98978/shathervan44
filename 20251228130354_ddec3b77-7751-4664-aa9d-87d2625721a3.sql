-- Add order_status_update email template
INSERT INTO public.email_templates (name, subject_ar, subject_en, body_ar, body_en, type, is_active)
VALUES (
  'order_status_update',
  'تحديث حالة طلبك #{{order_number}}',
  'Order #{{order_number}} Status Update',
  'مرحباً {{name}}،

نود إعلامك بأن حالة طلبك رقم #{{order_number}} قد تم تحديثها.

الحالة الجديدة: {{status}}
رقم التتبع: {{tracking_number}}

يمكنك تتبع شحنتك من خلال موقعنا.

شكراً لثقتك بنا!
فريق شذرفان الهندسية',
  'Hello {{name}},

Your order #{{order_number}} status has been updated.

New Status: {{status}}
Tracking Number: {{tracking_number}}

You can track your shipment on our website.

Thank you for your trust!
Shathervan Engineering Team',
  'transactional',
  true
) ON CONFLICT DO NOTHING;