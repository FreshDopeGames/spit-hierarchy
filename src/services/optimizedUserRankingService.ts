
import { supabase } from "@/integrations/supabase/client";
import { UserRanking } from "@/types/userRanking";
import { formatTimeAgo } from "@/utils/userRankingUtils";

interface RankingPreviewItem {
  item_position: number;
  item_reason: string | null;
  rapper_name: string;
}

interface PreviewData {
  ranking_id: string;
  items: RankingPreviewItem[];
}

export async function fetchUserRankingsOptimized(
  limit: number = 20,
  offset: number = 0
): Promise<UserRanking[]> {
  // First, fetch rankings with basic info and profile data
  const { data: rankings, error } = await supabase
    .from("user_rankings")
    .select(`
      id,
      title,
      description,
      user_id,
      created_at,
      slug,
      is_public,
      profiles!user_rankings_user_id_fkey(username, full_name)
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching user rankings:", error);
    throw error;
  }

  if (!rankings || rankings.length === 0) return [];

  // Get preview items for all rankings in separate calls
  const rankingIds = rankings.map(r => r.id);
  const itemPromises = rankingIds.map(async (id) => {
    const { data, error } = await supabase.rpc('get_user_ranking_preview_items', { 
      ranking_uuid: id 
    });
    
    if (error) {
      console.error(`Error fetching preview items for ranking ${id}:`, error);
      return { ranking_id: id, items: [] };
    }
    
    return { 
      ranking_id: id, 
      items: data || [] 
    };
  });

  const allPreviewResults = await Promise.all(itemPromises);

  // Transform the data to match the UserRanking interface
  const transformedRankings: UserRanking[] = rankings.map((ranking: any) => {
    const previewData = allPreviewResults.find((p: PreviewData) => p.ranking_id === ranking.id);
    const previewItems = previewData?.items || [];

    const topRappers = previewItems.map((item: RankingPreviewItem) => ({
      rank: item.item_position,
      name: item.rapper_name,
      reason: item.item_reason || "",
    }));

    return {
      id: ranking.id,
      title: ranking.title,
      description: ranking.description || "",
      author: ranking.profiles?.username || "Unknown User",
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
