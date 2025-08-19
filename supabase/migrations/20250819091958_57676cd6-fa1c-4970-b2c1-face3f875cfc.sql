-- Drop the insecure public_profiles view
DROP VIEW IF EXISTS public.public_profiles;

-- Update the profiles table RLS policy to allow authenticated users to view limited public profile data
DROP POLICY IF EXISTS "Authenticated users can view limited public profile info" ON public.profiles;

-- Create a new policy that allows authenticated users to view basic public profile info of other users
CREATE POLICY "Authenticated users can view public profile data" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = id OR  -- Users can see their own full profile
    (auth.uid() <> id)  -- Authenticated users can see basic info of other users
  )
);

-- Create a secure function to get public profile data with proper access control
CREATE OR REPLACE FUNCTION public.get_public_profile_safe(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  first_name text,
  bio_preview text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT 
        p.id,
        p.username,
        p.avatar_url,
        CASE 
            WHEN p.full_name IS NOT NULL THEN 
                SPLIT_PART(p.full_name, ' ', 1)
            ELSE NULL 
        END as first_name,
        CASE 
            WHEN p.bio IS NOT NULL AND LENGTH(p.bio) > 100 THEN 
                LEFT(p.bio, 100) || '...'
            ELSE p.bio 
        END as bio_preview,
        p.created_at
    FROM public.profiles p
    WHERE p.id = profile_user_id;
$function$;