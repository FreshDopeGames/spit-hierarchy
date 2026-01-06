-- Create a trigger function to insert referral data from user metadata
CREATE OR REPLACE FUNCTION public.handle_user_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_referrals (
    user_id,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    referrer_url,
    landing_page
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'utm_source',
    NEW.raw_user_meta_data->>'utm_medium',
    NEW.raw_user_meta_data->>'utm_campaign',
    NEW.raw_user_meta_data->>'utm_content',
    NEW.raw_user_meta_data->>'utm_term',
    NEW.raw_user_meta_data->>'referrer_url',
    NEW.raw_user_meta_data->>'landing_page'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail user creation if referral tracking fails
    RETURN NEW;
END;
$$;

-- Create a trigger on auth.users to capture referral data
-- Note: This is safe because it only inserts to public schema, doesn't modify auth schema
CREATE OR REPLACE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_referral();