import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TopArtist {
  name: string;
  count: number;
}

interface AlbumStats {
  totalAlbums: number;
  totalMixtapes: number;
  averageAlbums: number;
  averageMixtapes: number;
  albumCount: number;
  mixtapeCount: number;
  topAlbumArtist: TopArtist | null;
  topMixtapeArtist: TopArtist | null;
}

export const useAlbumStats = () => {
  return useQuery({
    queryKey: ["album-stats"],
    queryFn: async (): Promise<AlbumStats> => {
      // Get aggregated counts per rapper using database-level aggregation
      const { data: rapperStats, error } = await supabase
        .from("rappers")
        .select(`
          id,
          name,
          rapper_albums!inner(
            album:albums!inner(release_type)
          )
        `);

      if (error) throw error;

      // Process aggregated data
      const stats: { 
        [rapperId: string]: { 
          name: string;
          albums: number; 
          mixtapes: number;
        } 
      } = {};
      
      let totalAlbums = 0;
      let totalMixtapes = 0;
      
      rapperStats?.forEach(rapper => {
        const rapperId = rapper.id;
        if (!stats[rapperId]) {
          stats[rapperId] = { name: rapper.name, albums: 0, mixtapes: 0 };
        }
        
        (rapper as any).rapper_albums?.forEach((ra: any) => {
          if (ra.album?.release_type === 'album') {
            stats[rapperId].albums++;
            totalAlbums++;
          } else if (ra.album?.release_type === 'mixtape') {
            stats[rapperId].mixtapes++;
            totalMixtapes++;
          }
        });
      });

      // Find top artists
      let topAlbumArtist: TopArtist | null = null;
      let topMixtapeArtist: TopArtist | null = null;

      Object.values(stats).forEach(rapper => {
        if (rapper.albums > 0 && (!topAlbumArtist || rapper.albums > topAlbumArtist.count)) {
          topAlbumArtist = { name: rapper.name, count: rapper.albums };
        }
        if (rapper.mixtapes > 0 && (!topMixtapeArtist || rapper.mixtapes > topMixtapeArtist.count)) {
          topMixtapeArtist = { name: rapper.name, count: rapper.mixtapes };
        }
      });

      const rapperList = Object.values(stats);
      const rappersWithAlbums = rapperList.filter(r => r.albums > 0);
      const rappersWithMixtapes = rapperList.filter(r => r.mixtapes > 0);

      const averageAlbums = rappersWithAlbums.length > 0
        ? rappersWithAlbums.reduce((sum, r) => sum + r.albums, 0) / rappersWithAlbums.length
        : 0;

      const averageMixtapes = rappersWithMixtapes.length > 0
        ? rappersWithMixtapes.reduce((sum, r) => sum + r.mixtapes, 0) / rappersWithMixtapes.length
        : 0;

      return {
        totalAlbums,
        totalMixtapes,
        averageAlbums,
        averageMixtapes,
        albumCount: rappersWithAlbums.length,
        mixtapeCount: rappersWithMixtapes.length,
        topAlbumArtist,
        topMixtapeArtist
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};