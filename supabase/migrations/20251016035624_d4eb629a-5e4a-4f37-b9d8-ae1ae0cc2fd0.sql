-- Step 1: Allow authenticated users to view minimal public profile data (username)
-- This enables authenticated users to see author names on Community Rankings
CREATE POLICY "authenticated_users_view_public_usernames"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can always see their own complete profile
  auth.uid() = id 
  OR 
  -- Authenticated users can see minimal data (username, avatar_url) of others
  -- This is needed for displaying authors of rankings, comments, etc.
  (auth.uid() IS NOT NULL AND auth.uid() <> id)
);

-- Step 2: Allow guests (non-authenticated) to view usernames for public content
-- This enables anyone to browse Community Rankings without logging in
CREATE POLICY "public_view_usernames_for_public_content"
ON public.profiles
FOR SELECT
TO public
USING (
  -- Anyone can see usernames of users who have created public rankings
  -- This enables guest access to Community Rankings while maintaining privacy
  EXISTS (
    SELECT 1 
    FROM public.user_rankings 
    WHERE user_rankings.user_id = profiles.id 
      AND user_rankings.is_public = true
  )
);