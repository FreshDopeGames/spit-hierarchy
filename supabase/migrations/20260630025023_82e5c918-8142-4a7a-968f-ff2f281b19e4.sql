
CREATE OR REPLACE FUNCTION public.restrict_verified_artist_rapper_edits()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  is_admin_user boolean;
  is_verified_owner boolean;
BEGIN
  is_admin_user := public.has_role(auth.uid(), 'admin');
  IF is_admin_user THEN
    RETURN NEW;
  END IF;

  is_verified_owner := public.is_verified_for_rapper(auth.uid(), NEW.id);
  IF NOT is_verified_owner THEN
    RETURN NEW;
  END IF;

  -- Allowed-to-change set: bio, instagram_handle, homepage_url, spotify_id
  -- Force everything else back to OLD
  NEW.name := OLD.name;
  NEW.real_name := OLD.real_name;
  NEW.slug := OLD.slug;
  NEW.origin := OLD.origin;
  NEW.birth_year := OLD.birth_year;
  NEW.birth_month := OLD.birth_month;
  NEW.birth_day := OLD.birth_day;
  NEW.death_year := OLD.death_year;
  NEW.death_month := OLD.death_month;
  NEW.death_day := OLD.death_day;
  NEW.aliases := OLD.aliases;
  NEW.image_url := OLD.image_url;
  NEW.career_start_year := OLD.career_start_year;
  NEW.career_end_year := OLD.career_end_year;
  NEW.verified := OLD.verified;
  NEW.publish_status := OLD.publish_status;
  NEW.musicbrainz_id := OLD.musicbrainz_id;
  NEW.total_votes := OLD.total_votes;
  NEW.average_rating := OLD.average_rating;
  NEW.top_quote := OLD.top_quote;
  NEW.top_quote_song := OLD.top_quote_song;
  RETURN NEW;
END;
$$;
