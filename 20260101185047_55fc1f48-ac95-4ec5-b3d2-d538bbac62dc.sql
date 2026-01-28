-- Allow users to view their own orders based on linked customer record
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.customers c
    WHERE c.id = customer_id
      AND c.user_id = auth.uid()
  )
);