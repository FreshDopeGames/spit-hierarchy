
CREATE POLICY "Admins can update quiz questions"
ON public.quiz_questions FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete quiz questions"
ON public.quiz_questions FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can insert quiz questions"
ON public.quiz_questions FOR INSERT
TO authenticated
WITH CHECK (is_admin());
