-- Fix the SECURITY DEFINER view issue by removing the view and using the function instead

-- Drop the problematic view
DROP VIEW IF EXISTS public.public_profiles;

-- Update the get_public_profile function to be more secure
CREATE OR REPLACE FUNCTION public.get_public_profile(user_uuid uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.created_at
  FROM public.profiles p
  WHERE p.id = COALESCE(user_uuid, p.id);  -- If no UUID provided, return all (for authenticated users only)
$$;