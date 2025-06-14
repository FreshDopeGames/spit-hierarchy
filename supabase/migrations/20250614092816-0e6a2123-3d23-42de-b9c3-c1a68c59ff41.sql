
-- Create table for customizable section headers
CREATE TABLE public.section_headers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  background_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for section headers
ALTER TABLE public.section_headers ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view active headers)
CREATE POLICY "Anyone can view active section headers" 
  ON public.section_headers 
  FOR SELECT 
  USING (is_active = true);

-- Create policy for admin write access
CREATE POLICY "Admins can manage section headers" 
  ON public.section_headers 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage bucket for header background images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('header-images', 'header-images', true);

-- Create storage policy for public read access
CREATE POLICY "Public read access for header images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'header-images');

-- Create storage policy for admin upload access
CREATE POLICY "Admin upload access for header images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'header-images' AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage policy for admin update access
CREATE POLICY "Admin update access for header images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'header-images' AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage policy for admin delete access
CREATE POLICY "Admin delete access for header images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'header-images' AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default header for rankings section
INSERT INTO public.section_headers (section_name, title, subtitle) 
VALUES (
  'rankings', 
  'The Ultimate Rap Hierarchy', 
  'Discover the greatest rappers of all time, rising legends, and lyrical masters'
);

-- Add trigger for updated_at
CREATE TRIGGER set_section_headers_updated_at
  BEFORE UPDATE ON public.section_headers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
