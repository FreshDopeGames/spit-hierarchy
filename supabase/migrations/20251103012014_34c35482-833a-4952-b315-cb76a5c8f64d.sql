-- Update log_profile_access to allow self-view tracking for achievements
CREATE OR REPLACE FUNCTION public.log_profile_access(accessed_id uuid, access_type text DEFAULT 'view'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Log ALL profile access (including self-views) for achievement tracking
    IF auth.uid() IS NOT NULL THEN
        INSERT INTO public.profile_access_logs (
            accessed_profile_id, 
            accessor_user_id, 
            access_type
        ) VALUES (
            accessed_id, 
            auth.uid(), 
            access_type
        );
    END IF;
END;
$function$;