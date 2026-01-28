-- Fix critical security issue: Users should NOT be able to manage their own roles
-- This prevents privilege escalation attacks

-- Drop the existing dangerous policy that allows users to manage their own roles
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;

-- Create a new policy that only allows users to VIEW their own roles (not insert/update/delete)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- The existing "Admins can manage all roles" policy remains in place
-- Only admins can insert, update, or delete roles