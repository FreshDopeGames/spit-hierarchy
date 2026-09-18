
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useHotRappers = () => {
  return useQuery({
    queryKey: ["hot-rappers"],
    queryFn: async () => {
      // Get aggregated vote counts for the last 7 days (no voter identities exposed)
      const { data: recentVotes, error } = await supabase
        .rpc("get_hot_rapper_vote_counts", { p_days: 7 });

      if (error) throw error;

      const votesByRapper = (recentVotes || []).reduce((acc, row: any) => {
        acc[row.rapper_id] = Number(row.vote_count);
        return acc;
      }, {} as Record<string, number>);

      // Get all vote counts and calculate 85th percentile
      const voteCounts = Object.values(votesByRapper);
      if (voteCounts.length === 0) return [];
      
      voteCounts.sort((a, b) => b - a);
      const percentile85Index = Math.floor(voteCounts.length * 0.15); // Top 15% (85th percentile)
      const threshold = voteCounts[percentile85Index] || 1;

      // Return rapper IDs that meet the threshold
      return Object.entries(votesByRapper)
        .filter(([_, count]) => count >= threshold)
        .map(([rapperId, count]) => ({ rapperId, voteVelocity: count }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useIsHotRapper = (rapperId: string) => {
  const { data: hotRappers } = useHotRappers();
  
  const hotRapper = hotRappers?.find(hot => hot.rapperId === rapperId);
  return {
    isHot: !!hotRapper,
    voteVelocity: hotRapper?.voteVelocity || 0
  };
};
