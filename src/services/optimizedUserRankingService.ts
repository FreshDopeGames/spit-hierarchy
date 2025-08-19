
import { supabase } from "@/integrations/supabase/client";
import { UserRanking } from "@/types/userRanking";
import { formatTimeAgo } from "@/utils/userRankingUtils";

interface DatabaseRanking {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string;
  slug: string;
  is_public: boolean;
}

interface UserProfile {
  id: string;
  username: string;
  first_name?: string;
  avatar_url?: string;
}

interface PreviewItem {
  ranking_id: string;
  position: number;
  reason: string | null;
  rapper_name: string;
}

export async function fetchUserRankingsOptimized(
  limit: number = 20,
  offset: number = 0
): Promise<UserRanking[]> {
  // First, fetch rankings with basic info only
  const { data: rankings, error } = await supabase
    .from("user_rankings")
    .select(`
      id,
      title,
      description,
      user_id,
      created_at,
      slug,
      is_public
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching user rankings:", error);
    throw error;
  }

  if (!rankings || rankings.length === 0) return [];

  // Get unique user IDs and fetch profiles separately
  const userIds = [...new Set(rankings.map(r => r.user_id))];
  
  const { data: profiles, error: profilesError } = await supabase
    .rpc('get_profiles_batch', { profile_user_ids: userIds });

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
  }

  // Create a map for quick profile lookup
  const profilesMap = new Map<string, UserProfile>();
  if (profiles) {
    profiles.forEach((profile: UserProfile) => {
      profilesMap.set(profile.id, profile);
    });
  }

  // Get all preview items for all rankings in a single query
  const rankingIds = rankings.map(r => r.id);
  
  const { data: allPreviewItems, error: previewError } = await supabase
    .from("user_ranking_items")
    .select(`
      ranking_id,
      position,
      reason,
      rappers!inner(name)
    `)
    .in("ranking_id", rankingIds)
    .lte("position", 5)
    .order("position", { ascending: true });

  if (previewError) {
    console.error("Error fetching preview items:", previewError);
  }

  // Group preview items by ranking_id for efficient lookup
  const previewItemsMap = new Map<string, PreviewItem[]>();
  
  if (allPreviewItems) {
    allPreviewItems.forEach((item: any) => {
      const rankingId = item.ranking_id;
      if (!previewItemsMap.has(rankingId)) {
        previewItemsMap.set(rankingId, []);
      }
      previewItemsMap.get(rankingId)!.push({
        ranking_id: rankingId,
        position: item.position,
        reason: item.reason,
        rapper_name: item.rappers?.name || "Unknown"
      });
    });
  }

  // Transform the data to match the UserRanking interface
  const transformedRankings: UserRanking[] = rankings.map((ranking: DatabaseRanking) => {
    const previewItems = previewItemsMap.get(ranking.id) || [];
    const userProfile = profilesMap.get(ranking.user_id);

    const topRappers = previewItems.map((item: PreviewItem) => ({
      rank: item.position,
      name: item.rapper_name,
      reason: item.reason || "",
    }));

    return {
      id: ranking.id,
      title: ranking.title,
      description: ranking.description || "",
      author: userProfile?.username || "Unknown User",
      authorId: ranking.user_id,
      createdAt: ranking.created_at,
      timeAgo: formatTimeAgo(ranking.created_at),
      rappers: topRappers,
      likes: Math.floor(Math.random() * 500) + 50, // Mock data for now
      comments: Math.floor(Math.random() * 100) + 10, // Mock data for now
      views: Math.floor(Math.random() * 2000) + 500, // Mock data for now
      isPublic: ranking.is_public || false,
      isOfficial: false,
      tags: [], // Tags will be loaded separately if needed
      slug: ranking.slug,
    };
  });

  return transformedRankings;
}

export async function fetchUserRankingsCount(): Promise<number> {
  const { count, error } = await supabase
    .from("user_rankings")
    .select("*", { count: 'exact', head: true })
    .eq("is_public", true);

  if (error) {
    console.error("Error fetching user rankings count:", error);
    return 0;
  }

  return count || 0;
}
