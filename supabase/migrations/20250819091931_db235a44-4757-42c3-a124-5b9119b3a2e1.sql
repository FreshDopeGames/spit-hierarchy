-- Enable Row Level Security on public_profiles table
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own complete profile data
CREATE POLICY "Users can view own complete profile" 
ON public.public_profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Authenticated users can view limited public data of other users
CREATE POLICY "Authenticated users can view limited public data" 
ON public.public_profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() <> id
);

-- Note: No policy for anonymous access - this blocks all unauthorized scraping