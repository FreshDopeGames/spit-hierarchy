
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
          slug,
          title,
          description,
          category,
          created_at,
          updated_at,
          is_public,
          user_id,
          views_count
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

      if (!data || data.length === 0) {
        return {
          rankings: [],
          totalCount: count || 0,
          hasMore: false
        };
      }

      // Get unique user IDs and fetch profiles separately
      const userIds = [...new Set(data.map(r => r.user_id))];
      
      const { data: profiles, error: profilesError } = await supabase
        .rpc('get_profiles_for_analytics', { profile_user_ids: userIds });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      // Create a map for quick profile lookup
      const profilesMap = new Map();
      if (profiles) {
        profiles.forEach((profile) => {
          profilesMap.set(profile.id, profile);
        });
      }

      // Get preview items for each ranking using the RPC function
      const rankingsWithItems = await Promise.all(
        data.map(async (ranking) => {
          // Fetch preview items, vote count, and total rapper count in parallel
          const [itemsResult, voteCountResult, totalRappersResult] = await Promise.all([
            supabase.rpc('get_user_ranking_preview_items', { ranking_uuid: ranking.id, item_limit: 5 }),
            supabase.rpc('get_user_ranking_vote_count', { ranking_uuid: ranking.id }),
            supabase.from("user_ranking_items").select("*", { count: "exact", head: true }).eq("ranking_id", ranking.id)
          ]);

          const userProfile = profilesMap.get(ranking.user_id);

          return {
            ...ranking,
            preview_items: itemsResult.data || [],
            totalVotes: voteCountResult.data || 0,
            totalRappers: totalRappersResult.count || 0,
            profiles: userProfile ? { username: userProfile.username } : null
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
