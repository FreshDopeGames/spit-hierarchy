-- Create member journal entries table for personal hip-hop listening journey blogs
CREATE TABLE public.member_journal_entries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    slug TEXT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint on slug per user
CREATE UNIQUE INDEX member_journal_entries_user_slug_idx ON public.member_journal_entries(user_id, slug);

-- Create index for public entries lookup
CREATE INDEX member_journal_entries_public_idx ON public.member_journal_entries(is_public, status) WHERE is_public = true AND status = 'published';

-- Enable Row Level Security
ALTER TABLE public.member_journal_entries ENABLE ROW LEVEL SECURITY;

-- Users can view their own entries (all statuses)
CREATE POLICY "Users can view own journal entries"
ON public.member_journal_entries
FOR SELECT
USING (auth.uid() = user_id);

-- Anyone can view public published entries
CREATE POLICY "Public can view published public entries"
ON public.member_journal_entries
FOR SELECT
USING (is_public = true AND status = 'published');

-- Users can create their own entries
CREATE POLICY "Users can create own journal entries"
ON public.member_journal_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own entries
CREATE POLICY "Users can update own journal entries"
ON public.member_journal_entries
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own entries
CREATE POLICY "Users can delete own journal entries"
ON public.member_journal_entries
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_member_journal_entries_updated_at
BEFORE UPDATE ON public.member_journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();