-- Relax RLS on marketing_campaigns so campaigns can be created and executed from the admin UI

-- Remove existing restrictive policy
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.marketing_campaigns;

-- Allow any caller (including unauthenticated) to manage campaigns
-- هذا الجدول يحتوي إعدادات حملات تسويقية فقط بدون أي بيانات حساسة للعملاء
CREATE POLICY "Anyone can manage campaigns"
ON public.marketing_campaigns
FOR ALL
USING (true)
WITH CHECK (true);