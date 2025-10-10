-- Add username_last_changed_at column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username_last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

COMMENT ON COLUMN public.profiles.username_last_changed_at IS 
'Timestamp of when the username was last changed. Used to enforce 60-day cooldown period.';

-- Create helper function to check if username change is allowed
CREATE OR REPLACE FUNCTION public.can_change_username(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  last_changed TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Only the user can check their own status
  IF auth.uid() != user_id_param THEN
    RETURN FALSE;
  END IF;

  SELECT username_last_changed_at INTO last_changed
  FROM public.profiles
  WHERE id = user_id_param;

  -- If never changed, allow change
  IF last_changed IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Check if 60 days have passed (60 days = 5,184,000 seconds)
  RETURN (EXTRACT(EPOCH FROM (NOW() - last_changed)) >= 5184000);
END;
$$;

-- Create secure function to update username
CREATE OR REPLACE FUNCTION public.update_own_username(new_username TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_uuid UUID;
  can_change BOOLEAN;
  days_remaining INTEGER;
  last_changed TIMESTAMP WITH TIME ZONE;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;

  -- Validate username format
  IF new_username IS NULL OR LENGTH(TRIM(new_username)) < 3 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Username must be at least 3 characters long'
    );
  END IF;

  IF LENGTH(new_username) > 30 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Username must be 30 characters or less'
    );
  END IF;

  -- Check for valid characters (alphanumeric, underscore, hyphen only)
  IF new_username !~ '^[a-zA-Z0-9_-]+$' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Username can only contain letters, numbers, underscores, and hyphens'
    );
  END IF;

  -- Check if username is already taken by another user
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE username = new_username AND id != user_uuid
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Username is already taken'
    );
  END IF;

  -- Check cooldown period
  can_change := public.can_change_username(user_uuid);
  
  IF NOT can_change THEN
    SELECT username_last_changed_at INTO last_changed
    FROM public.profiles
    WHERE id = user_uuid;
    
    days_remaining := CEIL(60 - (EXTRACT(EPOCH FROM (NOW() - last_changed)) / 86400))::INTEGER;
    
    RETURN jsonb_build_object(
      'success', false,
      'error', format('You can change your username again in %s days', days_remaining),
      'days_remaining', days_remaining
    );
  END IF;

  -- Update username
  UPDATE public.profiles
  SET 
    username = new_username,
    username_last_changed_at = NOW(),
    updated_at = NOW()
  WHERE id = user_uuid;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Username updated successfully'
  );
END;
$$;

-- Drop and recreate get_own_profile to include username_last_changed_at
DROP FUNCTION IF EXISTS public.get_own_profile();

CREATE FUNCTION public.get_own_profile()
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  birthdate date,
  social_links jsonb,
  preferred_image_style image_style,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  username_last_changed_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.location,
    p.birthdate,
    p.social_links,
    p.preferred_image_style,
    p.created_at,
    p.updated_at,
    p.username_last_changed_at
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;