-- Fix user_roles RLS so users can manage their own roles and seed initial admin

-- 1) Replace existing policies on user_roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;

-- Allow each user to fully manage their own roles row(s)
CREATE POLICY "Users can manage their own roles"
ON public.user_roles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage all roles via has_role helper
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2) Ensure the main admin user has an admin role row
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'abdo12uk@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;