-- Create VS Matches table
CREATE TABLE public.vs_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  rapper_1_id UUID NOT NULL REFERENCES public.rappers(id) ON DELETE CASCADE,
  rapper_2_id UUID NOT NULL REFERENCES public.rappers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure different rappers
  CONSTRAINT different_rappers CHECK (rapper_1_id != rapper_2_id)
);

-- Create VS Match Votes table
CREATE TABLE public.vs_match_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vs_match_id UUID NOT NULL REFERENCES public.vs_matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rapper_choice_id UUID NOT NULL,
  vote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- One vote per user per match per day
  UNIQUE(vs_match_id, user_id, vote_date),
  
  -- Ensure the chosen rapper is one of the two in the match
  CONSTRAINT valid_rapper_choice CHECK (
    rapper_choice_id IN (
      SELECT rapper_1_id FROM public.vs_matches WHERE id = vs_match_id
      UNION
      SELECT rapper_2_id FROM public.vs_matches WHERE id = vs_match_id
    )
  )
);

-- Enable RLS
ALTER TABLE public.vs_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vs_match_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for VS Matches
CREATE POLICY "Anyone can view published vs matches" 
ON public.vs_matches 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Admins can manage all vs matches" 
ON public.vs_matches 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Admins can view all vs matches" 
ON public.vs_matches 
FOR SELECT 
USING (is_admin());

-- RLS Policies for VS Match Votes
CREATE POLICY "Users can create their own vs match votes" 
ON public.vs_match_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own vs match votes" 
ON public.vs_match_votes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all vs match votes" 
ON public.vs_match_votes 
FOR SELECT 
USING (is_admin());

-- Add updated_at trigger
CREATE TRIGGER update_vs_matches_updated_at
BEFORE UPDATE ON public.vs_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_vs_matches_status ON public.vs_matches(status);
CREATE INDEX idx_vs_matches_created_at ON public.vs_matches(created_at DESC);
CREATE INDEX idx_vs_matches_slug ON public.vs_matches(slug);
CREATE INDEX idx_vs_match_votes_user_date ON public.vs_match_votes(user_id, vote_date);
CREATE INDEX idx_vs_match_votes_match_date ON public.vs_match_votes(vs_match_id, vote_date);