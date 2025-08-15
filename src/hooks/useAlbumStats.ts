import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AlbumStats {
  averageAlbums: number;
  averageMixtapes: number;
  albumCount: number;
  mixtapeCount: number;
}

export const useAlbumStats = () => {
  return useQuery({
    queryKey: ["album-stats"],
    queryFn: async (): Promise<AlbumStats> => {
      // Get all albums by type from rapper_albums
      const { data: albums, error } = await supabase
        .from("rapper_albums")
        .select(`
          album:albums(release_type)
        `);

      if (error) throw error;

      // Group by rapper and count albums/mixtapes
      const rapperStats: { [rapperId: string]: { albums: number; mixtapes: number } } = {};
      
      albums?.forEach(item => {
        const rapperId = (item as any).rapper_id;
        if (!rapperStats[rapperId]) {
          rapperStats[rapperId] = { albums: 0, mixtapes: 0 };
        }
        
        if (item.album?.release_type === 'album') {
          rapperStats[rapperId].albums++;
        } else if (item.album?.release_type === 'mixtape') {
          rapperStats[rapperId].mixtapes++;
        }
      });

      const rapperList = Object.values(rapperStats);
      const rappersWithAlbums = rapperList.filter(r => r.albums > 0);
      const rappersWithMixtapes = rapperList.filter(r => r.mixtapes > 0);

      const averageAlbums = rappersWithAlbums.length > 0
        ? rappersWithAlbums.reduce((sum, r) => sum + r.albums, 0) / rappersWithAlbums.length
        : 0;

      const averageMixtapes = rappersWithMixtapes.length > 0
        ? rappersWithMixtapes.reduce((sum, r) => sum + r.mixtapes, 0) / rappersWithMixtapes.length
        : 0;

      return {
        averageAlbums,
        averageMixtapes,
        albumCount: rappersWithAlbums.length,
        mixtapeCount: rappersWithMixtapes.length
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};