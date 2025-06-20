
import { RankingWithItems, TransformedRanking } from "@/types/rankings";

export const transformOfficialRankings = (rankings: RankingWithItems[]): TransformedRanking[] => {
  return rankings.map(ranking => ({
    id: ranking.id,
    title: ranking.title,
    description: ranking.description || "",
    author: "Editorial Team",
    timeAgo: new Date(ranking.created_at || "").toLocaleDateString(),
    rappers: ranking.items.map(item => ({
      rank: item.position,
      name: item.rapper?.name || "Unknown",
      reason: item.reason || ""
    })),
    likes: Math.floor(Math.random() * 1000) + 100, // Mock data for now
    views: Math.floor(Math.random() * 5000) + 1000, // Mock data for now
    isOfficial: true,
    tags: ["Official", ranking.category],
    slug: ranking.slug,
    comments: 0
  }));
};

export const transformUserRankings = (userRankingData: any): TransformedRanking[] => {
  return (userRankingData?.rankings || []).map((ranking: any) => {
    // Type guard to safely access profiles - fixed TypeScript error
    const profileData = ranking.profiles && 
      typeof ranking.profiles === 'object' && 
      ranking.profiles !== null &&
      'username' in ranking.profiles 
      ? ranking.profiles as { username: string | null }
      : null;

    return {
      id: ranking.id,
      title: ranking.title,
      description: ranking.description || "",
      author: profileData?.username || "Unknown User",
      authorId: ranking.user_id,
      createdAt: ranking.created_at,
      timeAgo: new Date(ranking.created_at).toLocaleDateString(),
      rappers: (ranking.preview_items || []).map((item: any) => ({
        rank: item.item_position,
        name: item.rapper_name,
        reason: item.item_reason || ""
      })),
      likes: Math.floor(Math.random() * 500) + 50,
      views: Math.floor(Math.random() * 2000) + 100,
      isOfficial: false,
      tags: ["Community", ranking.category],
      category: ranking.category,
      isPublic: ranking.is_public || false,
      slug: `user-${ranking.id}`,
      comments: 0
    };
  });
};
