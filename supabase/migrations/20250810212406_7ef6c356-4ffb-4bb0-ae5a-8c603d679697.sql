-- Create rapper tags table
CREATE TABLE public.rapper_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rapper tag assignments junction table
CREATE TABLE public.rapper_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rapper_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(rapper_id, tag_id)
);

-- Add foreign key constraints
ALTER TABLE public.rapper_tag_assignments 
ADD CONSTRAINT fk_rapper_tag_assignments_rapper 
FOREIGN KEY (rapper_id) REFERENCES public.rappers(id) ON DELETE CASCADE;

ALTER TABLE public.rapper_tag_assignments 
ADD CONSTRAINT fk_rapper_tag_assignments_tag 
FOREIGN KEY (tag_id) REFERENCES public.rapper_tags(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.rapper_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rapper_tag_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rapper_tags
CREATE POLICY "Admin full access on rapper_tags" 
ON public.rapper_tags 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Public read access on rapper_tags" 
ON public.rapper_tags 
FOR SELECT 
USING (true);

-- RLS Policies for rapper_tag_assignments
CREATE POLICY "Admin full access on rapper_tag_assignments" 
ON public.rapper_tag_assignments 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Public read access on rapper_tag_assignments" 
ON public.rapper_tag_assignments 
FOR SELECT 
USING (true);

-- Add trigger for updating updated_at timestamp
CREATE TRIGGER update_rapper_tags_updated_at
BEFORE UPDATE ON public.rapper_tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();