-- Create polls table
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'single_choice' CHECK (type IN ('single_choice', 'multiple_choice')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  placement TEXT NOT NULL DEFAULT 'homepage' CHECK (placement IN ('homepage', 'all_blogs', 'specific_blog')),
  blog_post_id UUID REFERENCES public.blog_posts(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  is_featured BOOLEAN DEFAULT false
);

-- Create poll_options table
CREATE TABLE public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll_votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id UUID,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id),
  UNIQUE(poll_id, session_id)
);

-- Enable RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for polls
CREATE POLICY "Anyone can view active polls" ON public.polls
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage polls" ON public.polls
  FOR ALL USING (is_admin());

-- RLS Policies for poll_options
CREATE POLICY "Anyone can view poll options" ON public.poll_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.polls 
      WHERE polls.id = poll_options.poll_id 
      AND polls.status = 'active'
    )
  );

CREATE POLICY "Admins can manage poll options" ON public.poll_options
  FOR ALL USING (is_admin());

-- RLS Policies for poll_votes
CREATE POLICY "Anyone can view poll votes" ON public.poll_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can vote on polls" ON public.poll_votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.polls 
      WHERE polls.id = poll_votes.poll_id 
      AND polls.status = 'active'
      AND (polls.expires_at IS NULL OR polls.expires_at > now())
    )
  );

CREATE POLICY "Users can view their own votes" ON public.poll_votes
  FOR SELECT USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Add indexes for performance
CREATE INDEX idx_polls_status ON public.polls(status);
CREATE INDEX idx_polls_placement ON public.polls(placement);
CREATE INDEX idx_polls_blog_post_id ON public.polls(blog_post_id);
CREATE INDEX idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user_id ON public.poll_votes(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON public.polls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();