
-- Update RLS policy for comments to allow admins to delete any comment
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.comments;

CREATE POLICY "Admins can delete any comment" 
ON public.comments 
FOR DELETE 
USING (is_admin());
