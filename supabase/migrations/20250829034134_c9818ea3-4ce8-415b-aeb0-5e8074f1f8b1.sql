-- Create section_headers table for managing section headers across the site
CREATE TABLE public.section_headers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.section_headers ENABLE ROW LEVEL SECURITY;

-- Create policies for section headers
CREATE POLICY "Public can view section headers" 
ON public.section_headers 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage section headers" 
ON public.section_headers 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_section_headers_updated_at
  BEFORE UPDATE ON public.section_headers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default section headers
INSERT INTO public.section_headers (section, title, description) VALUES
  ('homepage', 'Spit Hierarchy', 'Discover and rank the greatest rappers of all time'),
  ('top-ranking', 'Top Ranking', 'The highest rated rappers by community votes'),
  ('rising-legends', 'Rising Legends', 'Emerging artists making their mark'),
  ('lyrical-masters', 'Lyrical Masters', 'Artists known for their wordplay and lyricism'),
  ('all-rappers', 'All Rappers', 'Complete directory of rap artists'),
  ('rankings', 'Rankings', 'Community-driven rapper rankings and lists'),
  ('blog', 'Blog', 'Latest news, insights, and discussions about hip-hop'),
  ('about', 'About', 'Learn more about our community and mission')
ON CONFLICT (section) DO NOTHING;