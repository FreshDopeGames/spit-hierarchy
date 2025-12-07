import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DiscographyAlbum {
  id: string;
  role: string;
  album: {
    id: string;
    title: string;
    slug: string;
    release_date: string | null;
    release_type: string;
    cover_art_url: string | null;
    cached_cover_url: string | null;
    has_cover_art?: boolean | null;
    external_cover_links?: Record<string, string> | null;
    track_count: number | null;
    label: {
      id: string;
      name: string;
    } | null;
  };
}


export interface DiscographyData {
  success: boolean;
  cached: boolean;
  rate_limited?: boolean;
  message?: string;
  discography: DiscographyAlbum[];
}

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<DiscographyData>>();

export const useRapperDiscography = (rapperId: string, autoFetch: boolean = true) => {
  return useQuery({
    queryKey: ["rapper-discography", rapperId],
    queryFn: async (): Promise<DiscographyData> => {
      console.log('Fetching discography for rapper:', rapperId);
      
      // Check if there's already an ongoing request for this rapper
      if (ongoingRequests.has(rapperId)) {
        console.log('Reusing ongoing request for rapper:', rapperId);
        return await ongoingRequests.get(rapperId)!;
      }
      
      // Create the request promise
      const requestPromise = (async () => {
        try {
          const { data, error } = await supabase.functions.invoke(
            "fetch-rapper-discography",
            {
              body: { rapperId }
            }
          );

          if (error) {
            console.error('Discography fetch error:', error);
            const errorMessage = error.message || "Failed to fetch discography";
            throw new Error(errorMessage);
          }

          console.log('Discography fetch result:', data);
          return data;
        } finally {
          // Remove from ongoing requests when complete
          ongoingRequests.delete(rapperId);
        }
      })();
      
      // Store the promise to prevent duplicates
      ongoingRequests.set(rapperId, requestPromise);
      
      return await requestPromise;
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
        const is429 = error.message?.includes('429') || error.message?.includes('Rate limit');
        if (is429) {
          throw new Error('RATE_LIMIT_429');
        }
        throw new Error(error.message || "Failed to refresh discography");
      }

      return data;
    },
    onSuccess: (data, rapperId) => {
      queryClient.setQueryData(["rapper-discography", rapperId], data);
      // Ensure dependent stats refresh
      queryClient.invalidateQueries({ queryKey: ["rapper-career-stats", rapperId] });
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["rapper-career-stats", rapperId], exact: true });
      }, 1000);
      
      if (data.rate_limited) {
        toast.info('Using cached results — try again later');
      } else {
        toast.success("Discography refreshed successfully");
      }
    },
    onError: (error: Error) => {
      console.error("Error refreshing discography:", error);
      if (error.message === 'RATE_LIMIT_429') {
        toast.error('Rate limit reached. Please try again later.');
      } else {
        toast.error("Failed to refresh discography");
      }
    },
  });
};

export const useRapperCareerStats = (rapperId: string) => {
  // Auto-fetch discography if not present
  const { refetch: fetchDiscography } = useRapperDiscography(rapperId, false);
  
  return useQuery({
    queryKey: ["rapper-career-stats", rapperId],
    queryFn: async () => {
      // Get basic rapper info
      const { data: rapper, error: rapperError } = await supabase
        .from("rappers")
        .select("career_start_year, career_end_year, musicbrainz_id, death_year, death_month, death_day")
        .eq("id", rapperId)
        .single();

      if (rapperError) throw rapperError;

      // Get album count by type and release dates for career calculation
      const { data: albums, error: albumsError } = await supabase
        .from("rapper_albums")
        .select(`
          album:albums(release_type, release_date)
        `)
        .eq("rapper_id", rapperId);

      if (albumsError) throw albumsError;


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

      // Calculate career start/end years based on first and last releases
      const allReleaseDates = [
        ...(albums?.map(a => a.album?.release_date).filter(Boolean) || [])
      ];

      let careerStartYear = rapper?.career_start_year;
      let careerEndYear = rapper?.career_end_year;

      if (allReleaseDates.length > 0) {
        const years = allReleaseDates.map(date => new Date(date).getFullYear()).sort((a, b) => a - b);
        const firstReleaseYear = years[0];
        const lastReleaseYear = years[years.length - 1];
        
        // Use release-based years, with fallback to rapper table data
        careerStartYear = firstReleaseYear || rapper?.career_start_year;
        careerEndYear = rapper?.career_end_year;
      }

      // Handle death year in career calculations
      const isDeceased = !!rapper?.death_year;
      if (isDeceased && rapper?.death_year) {
        // For deceased rappers, career end should be the later of death year or last release
        if (careerEndYear) {
          careerEndYear = Math.max(careerEndYear, rapper.death_year);
        } else {
          careerEndYear = rapper.death_year;
        }
      }

      const careerSpan = careerStartYear && careerEndYear 
        ? careerEndYear - careerStartYear
        : careerStartYear 
        ? new Date().getFullYear() - careerStartYear
        : 0;

      // Auto-fetch MusicBrainz data if missing and no discography exists
      if (!rapper?.musicbrainz_id && totalAlbums === 0) {
        fetchDiscography();
      }

      return {
        totalAlbums,
        totalMixtapes,
        careerStartYear,
        careerEndYear,
        careerSpan,
        labelAffiliations: labels || [],
        hasMusicBrainzId: !!rapper?.musicbrainz_id,
        isDeceased: !!rapper?.death_year
      };
    },
    enabled: !!rapperId,
  });
};