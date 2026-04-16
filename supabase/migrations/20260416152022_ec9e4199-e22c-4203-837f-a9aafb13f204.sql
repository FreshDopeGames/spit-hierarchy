CREATE POLICY "Public read access for aggregate counts"
ON public.votes
FOR SELECT
TO public
USING (true);