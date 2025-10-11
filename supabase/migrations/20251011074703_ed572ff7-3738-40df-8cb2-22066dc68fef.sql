-- Allow public read access to user_top_rappers table
CREATE POLICY "Public read access to top rappers"
  ON user_top_rappers
  FOR SELECT
  USING (true);