import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TopArtist {
  name: string;
  count: number;
}

interface AlbumStats {
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
      // Get all albums with rapper names
      const { data: albums, error } = await supabase
        .from("rapper_albums")
        .select(`
          rapper_id,
          rapper:rappers(name),
          album:albums(release_type)
        `);

      if (error) throw error;

      // Group by rapper and count albums/mixtapes
      const rapperStats: { 
        [rapperId: string]: { 
          name: string;
          albums: number; 
          mixtapes: number;
        } 
      } = {};
      
      albums?.forEach(item => {
        const rapperId = (item as any).rapper_id;
        const rapperName = (item as any).rapper?.name || 'Unknown';
        
        if (!rapperStats[rapperId]) {
          rapperStats[rapperId] = { name: rapperName, albums: 0, mixtapes: 0 };
        }
        
        if (item.album?.release_type === 'album') {
          rapperStats[rapperId].albums++;
        } else if (item.album?.release_type === 'mixtape') {
          rapperStats[rapperId].mixtapes++;
        }
      });

      // Find top artists
      let topAlbumArtist: TopArtist | null = null;
      let topMixtapeArtist: TopArtist | null = null;

      Object.values(rapperStats).forEach(rapper => {
        if (rapper.albums > 0 && (!topAlbumArtist || rapper.albums > topAlbumArtist.count)) {
          topAlbumArtist = { name: rapper.name, count: rapper.albums };
        }
        if (rapper.mixtapes > 0 && (!topMixtapeArtist || rapper.mixtapes > topMixtapeArtist.count)) {
          topMixtapeArtist = { name: rapper.name, count: rapper.mixtapes };
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
        mixtapeCount: rappersWithMixtapes.length,
        topAlbumArtist,
        topMixtapeArtist
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};