
import { RankingWithItems, UnifiedRanking } from "@/types/rankings";

// Helper function to generate deterministic values based on a string ID
const generateDeterministicValue = (id: string, multiplier: number, base: number): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash % multiplier) + base;
};

export const transformOfficialRankings = (rankings: RankingWithItems[]): UnifiedRanking[] => {
  return rankings.map(ranking => ({
    id: ranking.id,
    title: ranking.title || "Untitled Ranking",
    description: ranking.description || "",
    author: "Editorial Team",
    authorId: "editorial-team", // Default ID for official rankings
    timeAgo: new Date(ranking.created_at || "").toLocaleDateString(),
    createdAt: ranking.created_at || new Date().toISOString(),
    rappers: (ranking.items || []).map(item => ({
      rank: item.position || 0,
      name: item.rapper?.name || "Unknown",
      reason: item.reason || ""
    })),
    likes: generateDeterministicValue(ranking.id, 900, 150), // Range: 150-1049
    views: generateDeterministicValue(ranking.id, 4000, 1200), // Range: 1200-5199
    isOfficial: true,
    tags: ["Official", ranking.category || "General"].filter(Boolean),
    slug: ranking.slug || `official-${ranking.id}`,
    comments: 0,
    category: ranking.category || "General",
    isPublic: true // Official rankings are always public
  }));
};

export const transformUserRankings = (userRankingData: any): UnifiedRanking[] => {
  if (!userRankingData?.rankings) {
    return [];
  }

  return userRankingData.rankings.map((ranking: any) => {
    // Type guard to safely access profiles
    const profileData = ranking.profiles && 
      typeof ranking.profiles === 'object' && 
      ranking.profiles !== null &&
      'username' in ranking.profiles 
      ? ranking.profiles as { username: string | null }
      : null;

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
        reason: item.item_reason || ""
      })),
      likes: generateDeterministicValue(ranking.id || "unknown", 450, 50), // Range: 50-499
      views: generateDeterministicValue(ranking.id || "unknown", 1900, 100), // Range: 100-1999
      isOfficial: false,
      tags: ["Community", ranking.category || "General"].filter(Boolean),
      category: ranking.category || "General",
      isPublic: ranking.is_public ?? true,
      slug: ranking.slug || `user-${ranking.id}`,
      comments: 0
    };
  });
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
