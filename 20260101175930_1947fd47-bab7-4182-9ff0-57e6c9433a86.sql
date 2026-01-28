-- Tighten RLS for coupons: admins only
DROP POLICY IF EXISTS "Anyone can manage coupons" ON public.coupons;

CREATE POLICY "Admins can manage coupons"
ON public.coupons
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Tighten RLS for marketing_campaigns: admins only
DROP POLICY IF EXISTS "Anyone can manage campaigns" ON public.marketing_campaigns;

CREATE POLICY "Admins can manage campaigns"
ON public.marketing_campaigns
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Restrict cart_items to logged-in user carts only
DROP POLICY IF EXISTS "Anyone can view their cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Anyone can insert cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Anyone can update their cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Anyone can delete their cart items" ON public.cart_items;

CREATE POLICY "Users can manage their own cart"
ON public.cart_items
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);