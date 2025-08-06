-- Add MusicBrainz fields to rappers table
ALTER TABLE public.rappers 
ADD COLUMN musicbrainz_id text UNIQUE,
ADD COLUMN discography_last_updated timestamp with time zone,
ADD COLUMN career_start_year integer,
ADD COLUMN career_end_year integer;

-- Create record_labels table
CREATE TABLE public.record_labels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  musicbrainz_id text UNIQUE,
  founded_year integer,
  country text,
  website_url text,
  logo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create rapper_labels association table
CREATE TABLE public.rapper_labels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rapper_id uuid NOT NULL REFERENCES public.rappers(id) ON DELETE CASCADE,
  label_id uuid NOT NULL REFERENCES public.record_labels(id) ON DELETE CASCADE,
  start_year integer,
  end_year integer,
  is_current boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(rapper_id, label_id)
);

-- Create albums table
CREATE TABLE public.albums (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  musicbrainz_id text UNIQUE,
  release_date date,
  release_type text NOT NULL DEFAULT 'album', -- album, mixtape, compilation, ep
  cover_art_url text,
  track_count integer,
  label_id uuid REFERENCES public.record_labels(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create rapper_albums association table
CREATE TABLE public.rapper_albums (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rapper_id uuid NOT NULL REFERENCES public.rappers(id) ON DELETE CASCADE,
  album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  role text DEFAULT 'primary', -- primary, featured, collaboration
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(rapper_id, album_id)
);

-- Create singles table
CREATE TABLE public.singles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  musicbrainz_id text UNIQUE,
  release_date date,
  album_id uuid REFERENCES public.albums(id),
  peak_chart_position integer,
  chart_country text DEFAULT 'US',
  duration_ms integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create rapper_singles association table
CREATE TABLE public.rapper_singles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rapper_id uuid NOT NULL REFERENCES public.rappers(id) ON DELETE CASCADE,
  single_id uuid NOT NULL REFERENCES public.singles(id) ON DELETE CASCADE,
  role text DEFAULT 'primary', -- primary, featured, collaboration
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(rapper_id, single_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.record_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rapper_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rapper_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.singles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rapper_singles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Public read record labels" ON public.record_labels FOR SELECT USING (true);
CREATE POLICY "Public read rapper labels" ON public.rapper_labels FOR SELECT USING (true);
CREATE POLICY "Public read albums" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Public read rapper albums" ON public.rapper_albums FOR SELECT USING (true);
CREATE POLICY "Public read singles" ON public.singles FOR SELECT USING (true);
CREATE POLICY "Public read rapper singles" ON public.rapper_singles FOR SELECT USING (true);

-- Admin policies for management
CREATE POLICY "Admin manage record labels" ON public.record_labels FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage rapper labels" ON public.rapper_labels FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage albums" ON public.albums FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage rapper albums" ON public.rapper_albums FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage singles" ON public.singles FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin manage rapper singles" ON public.rapper_singles FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Create indexes for better performance
CREATE INDEX idx_rappers_musicbrainz_id ON public.rappers(musicbrainz_id);
CREATE INDEX idx_record_labels_musicbrainz_id ON public.record_labels(musicbrainz_id);
CREATE INDEX idx_albums_musicbrainz_id ON public.albums(musicbrainz_id);
CREATE INDEX idx_singles_musicbrainz_id ON public.singles(musicbrainz_id);
CREATE INDEX idx_rapper_labels_rapper_id ON public.rapper_labels(rapper_id);
CREATE INDEX idx_rapper_albums_rapper_id ON public.rapper_albums(rapper_id);
CREATE INDEX idx_rapper_singles_rapper_id ON public.rapper_singles(rapper_id);
CREATE INDEX idx_albums_release_date ON public.albums(release_date);
CREATE INDEX idx_singles_release_date ON public.singles(release_date);

-- Create function to update updated_at timestamps
CREATE TRIGGER update_record_labels_updated_at
  BEFORE UPDATE ON public.record_labels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_albums_updated_at
  BEFORE UPDATE ON public.albums
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_singles_updated_at
  BEFORE UPDATE ON public.singles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();