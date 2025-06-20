
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdaptivePolling } from "./useAdaptivePolling";

interface UseOptimizedUserRankingsOptions {
  page?: number;
  limit?: number;
  userId?: string;
  isPublic?: boolean;
  enablePolling?: boolean;
}

export const useOptimizedUserRankings = ({
  page = 1,
  limit = 12,
  userId,
  isPublic = true,
  enablePolling = false
}: UseOptimizedUserRankingsOptions = {}) => {
  
  const { refetchInterval, refetchIntervalInBackground } = useAdaptivePolling({
    baseInterval: 30000, // 30 seconds
    maxInterval: 300000, // 5 minutes
    enabled: enablePolling
  });

  return useQuery({
    queryKey: ["optimized-user-rankings", page, limit, userId, isPublic],
    queryFn: async () => {
      const offset = (page - 1) * limit;

      let query = supabase
        .from("user_rankings")
        .select(`
          id,
          title,
          description,
          category,
          created_at,
          updated_at,
          is_public,
          user_id,
          profiles!user_rankings_user_id_fkey(username)
        `)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (userId) {
        query = query.eq("user_id", userId);
      } else if (isPublic) {
        query = query.eq("is_public", true);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Get preview items for each ranking
      const rankingsWithItems = await Promise.all(
        (data || []).map(async (ranking) => {
          const { data: items } = await supabase.rpc(
            'get_user_ranking_preview_items',
            { ranking_uuid: ranking.id, item_limit: 5 }
          );

          return {
            ...ranking,
            preview_items: items || []
          };
        })
      );

      return {
        rankings: rankingsWithItems,
        totalCount: count || 0,
        hasMore: (count || 0) > offset + limit
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: enablePolling ? refetchInterval : false,
    refetchIntervalInBackground,
  });
};
