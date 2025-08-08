import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DiscographyAlbum {
  id: string;
  role: string;
  album: {
    id: string;
    title: string;
    release_date: string | null;
    release_type: string;
    cover_art_url: string | null;
    track_count: number | null;
    label: {
      id: string;
      name: string;
    } | null;
  };
}

export interface DiscographySingle {
  id: string;
  role: string;
  single: {
    id: string;
    title: string;
    release_date: string | null;
    peak_chart_position: number | null;
    chart_country: string;
    duration_ms: number | null;
  };
}

export interface DiscographyData {
  success: boolean;
  cached: boolean;
  discography: DiscographyAlbum[];
  topSingles: DiscographySingle[];
}

export const useRapperDiscography = (rapperId: string, autoFetch: boolean = true) => {
  return useQuery({
    queryKey: ["rapper-discography", rapperId],
    queryFn: async (): Promise<DiscographyData> => {
      console.log('Fetching discography for rapper:', rapperId);
      
      const { data, error } = await supabase.functions.invoke(
        "fetch-rapper-discography",
        {
          body: { rapperId }
        }
      );

      if (error) {
        console.error('Discography fetch error:', error);
        throw new Error(error.message || "Failed to fetch discography");
      }

      console.log('Discography fetch result:', data);
      return data;
    },
    enabled: !!rapperId && autoFetch,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: (failureCount, error: any) => {
      const msg = error?.message?.toLowerCase?.() || '';
      if (msg.includes('404') || msg.includes('rate limit') || msg.includes('429')) return false;
      return failureCount < 2;
    },
  });
};

export const useRefreshDiscography = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rapperId: string) => {
      const { data, error } = await supabase.functions.invoke(
        "fetch-rapper-discography",
        {
          body: { rapperId, forceRefresh: true }
        }
      );

      if (error) {
        throw new Error(error.message || "Failed to refresh discography");
      }

      return data;
    },
    onSuccess: (data, rapperId) => {
      queryClient.setQueryData(["rapper-discography", rapperId], data);
      // Ensure dependent stats refresh
      queryClient.invalidateQueries({ queryKey: ["rapper-career-stats", rapperId] });
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["rapper-career-stats", rapperId] });
      }, 400);
      toast.success("Discography refreshed successfully");
    },
    onError: (error) => {
      console.error("Error refreshing discography:", error);
      toast.error("Failed to refresh discography");
    },
  });
};

export const useRapperCareerStats = (rapperId: string) => {
  // Auto-fetch discography if not present
  const { refetch: fetchDiscography } = useRapperDiscography(rapperId, false);
  
  return useQuery({
    queryKey: ["rapper-career-stats", rapperId],
    queryFn: async () => {
      // Get basic rapper info with career years
      const { data: rapper, error: rapperError } = await supabase
        .from("rappers")
        .select("career_start_year, career_end_year, musicbrainz_id")
        .eq("id", rapperId)
        .single();

      if (rapperError) throw rapperError;

      // Get album count by type
      const { data: albums, error: albumsError } = await supabase
        .from("rapper_albums")
        .select(`
          album:albums(release_type)
        `)
        .eq("rapper_id", rapperId);

      if (albumsError) throw albumsError;

      // Get singles count
      const { data: singles, error: singlesError } = await supabase
        .from("rapper_singles")
        .select("id")
        .eq("rapper_id", rapperId);

      if (singlesError) throw singlesError;

      // Get label affiliations
      const { data: labels, error: labelsError } = await supabase
        .from("rapper_labels")
        .select(`
          start_year,
          end_year,
          is_current,
          label:record_labels(name)
        `)
        .eq("rapper_id", rapperId);

      if (labelsError) throw labelsError;

      const albumTypes = albums?.map(a => a.album?.release_type) || [];
      const totalAlbums = albumTypes.filter(type => type === 'album').length;
      const totalMixtapes = albumTypes.filter(type => type === 'mixtape').length;
      const totalSingles = singles?.length || 0;

      const careerSpan = rapper?.career_start_year && rapper?.career_end_year 
        ? rapper.career_end_year - rapper.career_start_year
        : rapper?.career_start_year 
        ? new Date().getFullYear() - rapper.career_start_year
        : 0;

      // Auto-fetch MusicBrainz data if missing and no discography exists
      if (!rapper?.musicbrainz_id && totalAlbums === 0 && totalSingles === 0) {
        fetchDiscography();
      }

      return {
        totalAlbums,
        totalMixtapes,
        totalSingles,
        careerStartYear: rapper?.career_start_year,
        careerEndYear: rapper?.career_end_year,
        careerSpan,
        labelAffiliations: labels || [],
        hasMusicBrainzId: !!rapper?.musicbrainz_id
      };
    },
    enabled: !!rapperId,
  });
};