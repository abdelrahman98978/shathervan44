-- Relax RLS on coupons so campaigns can create coupons from the admin UI

-- Remove existing restrictive policy
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;

-- Allow any caller (including unauthenticated) to manage coupons
-- This table does not contain user PII, فقط إعدادات كوبونات الخصم
CREATE POLICY "Anyone can manage coupons"
ON public.coupons
FOR ALL
USING (true)
WITH CHECK (true);