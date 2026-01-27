
import { RankingWithItems, UnifiedRanking } from "@/types/rankings";
import { supabase } from "@/integrations/supabase/client";

// Helper function to get actual vote count for a ranking
const getRankingVoteCount = async (rankingId: string, isOfficial: boolean): Promise<number> => {
  try {
    if (isOfficial) {
      // For official rankings, count votes from ranking_votes table
      const { count, error } = await supabase
        .from("ranking_votes")
        .select("*", { count: 'exact', head: true })
        .in("ranking_id", [rankingId]);
      
      if (error) {
        console.error("Error fetching official ranking votes:", error);
        return 0;
      }
      return count || 0;
    } else {
      // For user rankings, we don't have vote tracking yet
      return 0;
    }
  } catch (error) {
    console.error("Error fetching ranking vote count:", error);
    return 0;
  }
};

export const transformOfficialRankings = (rankings: (RankingWithItems & { totalVotes?: number })[]): Promise<UnifiedRanking[]> => {
  return Promise.all(rankings.map(async (ranking) => {
    // Use totalVotes if provided, otherwise fetch it
    const totalVotes = ranking.totalVotes ?? await getRankingVoteCount(ranking.id, true);
    
    return {
      id: ranking.id,
      title: ranking.title || "Untitled Ranking",
      description: ranking.description || "",
      author: "Editorial Team",
      authorId: "editorial-team", // Default ID for official rankings
      timeAgo: new Date(ranking.created_at || "").toLocaleDateString(),
      createdAt: ranking.created_at || new Date().toISOString(),
      // Use array index to preserve RPC's vote-based order
      rappers: (ranking.items || []).map((item, index) => ({
        rank: index + 1,
        name: item.rapper?.name || "Unknown",
        reason: item.reason || "",
        id: item.rapper?.id || "",
        image_url: item.rapper?.image_url || undefined
      })),
      likes: 0, // Remove fake likes
      views: 0, // Set to 0 until we implement view tracking
      totalVotes,
      isOfficial: true,
      tags: ["Official", ranking.category || "General"].filter(Boolean),
      slug: ranking.slug || `official-${ranking.id}`,
      comments: 0,
      category: ranking.category || "General",
      isPublic: true // Official rankings are always public
    };
  }));
};

export const transformUserRankings = async (userRankingData: any): Promise<UnifiedRanking[]> => {
  if (!userRankingData?.rankings) {
    return [];
  }

  return Promise.all(userRankingData.rankings.map(async (ranking: any) => {
    // Type guard to safely access profiles
    const profileData = ranking.profiles && 
      typeof ranking.profiles === 'object' && 
      ranking.profiles !== null &&
      'username' in ranking.profiles 
      ? ranking.profiles as { username: string | null }
      : null;

    // Use totalVotes if provided, otherwise fetch it
    const totalVotes = ranking.totalVotes ?? await getRankingVoteCount(ranking.id || "", false);

    return {
      id: ranking.id || "",
      title: ranking.title || "Untitled Ranking",
      description: ranking.description || "",
      author: profileData?.username || "Unknown User",
      authorId: ranking.user_id || "unknown",
      createdAt: ranking.created_at || new Date().toISOString(),
      timeAgo: new Date(ranking.created_at || "").toLocaleDateString(),
      rappers: (ranking.preview_items || []).map((item: any) => ({
        rank: item.item_position || 0,
        name: item.rapper_name || "Unknown",
        reason: item.reason || "",
        id: item.rapper_id || "",
        image_url: item.rapper_image_url || undefined
      })),
      likes: 0, // Remove fake likes
      views: 0, // Set to 0 until we implement view tracking
      totalVotes,
      isOfficial: false,
      tags: ["Community", ranking.category || "General"].filter(Boolean),
      category: ranking.category || "General",
      isPublic: ranking.is_public ?? true,
      slug: ranking.slug || `user-${ranking.id}`,
      comments: 0
    };
  }));
};

// Legacy transformer for backwards compatibility
export const transformToLegacyFormat = (rankings: UnifiedRanking[]): any[] => {
  return rankings.map(ranking => ({
    ...ranking,
    slug: ranking.slug,
    authorId: ranking.authorId,
    createdAt: ranking.createdAt,
    category: ranking.category,
    isPublic: ranking.isPublic
  }));
};
