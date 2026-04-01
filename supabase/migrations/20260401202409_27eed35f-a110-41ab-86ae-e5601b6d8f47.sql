-- Drop the broken ALL policy that has no WITH CHECK (blocks INSERT)
DROP POLICY IF EXISTS "Users can manage own top rappers" ON public.user_top_rappers;

-- Also drop the duplicate SELECT-only policy since the remaining ALL policy covers it
DROP POLICY IF EXISTS "Users view own top rappers only" ON public.user_top_rappers;