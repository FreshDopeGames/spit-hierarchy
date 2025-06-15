import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { UserRanking, UserRankingFromDB, CreateUserRankingData } from "@/types/userRanking";
import { formatTimeAgo } from "@/utils/userRankingUtils";

export async function fetchUserRankings(): Promise<UserRanking[]> {
  const { data, error } = await supabase
    .from("user_rankings")
    .select(`
      *,
      profiles!user_rankings_user_id_fkey(username, full_name),
      user_ranking_items!inner(
        position,
        reason,
        rapper:rappers(name)
      ),
      user_ranking_tag_assignments(
        ranking_tags(name)
      )
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user rankings:", error);
    throw error;
  }

  if (!data) return [];

  // Transform the data to match the UserRanking interface
  const transformedRankings: UserRanking[] = data.map((ranking: any) => {
    const topRappers = (ranking.user_ranking_items || [])
      .filter((item: any) => item.position <= 5) // Show only top 5 for preview
      .sort((a: any, b: any) => a.position - b.position)
      .map((item: any) => ({
        rank: item.position,
        name: item.rapper?.name || "Unknown",
        reason: item.reason || "",
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
      tags: (ranking.user_ranking_tag_assignments || [])
        .map((assignment: any) => assignment.ranking_tags?.name || "")
        .filter(Boolean),
      slug: ranking.slug,
    };
  });

  return transformedRankings;
}

export async function createUserRanking(
  rankingData: CreateUserRankingData,
  userId: string,
  slug: string
): Promise<Tables<"user_rankings">> {
  // Create the ranking
  const { data: ranking, error: rankingError } = await supabase
    .from("user_rankings")
    .insert({
      title: rankingData.title,
      description: rankingData.description,
      category: rankingData.category,
      slug: slug,
      user_id: userId,
      is_public: rankingData.isPublic ?? true,
    })
    .select()
    .single();

  if (rankingError) throw rankingError;

  // Populate the ranking with all rappers
  const { error: populateError } = await supabase.rpc(
    "populate_user_ranking_with_all_rappers",
    { ranking_uuid: ranking.id }
  );

  if (populateError) {
    console.error("Error populating ranking with rappers:", populateError);
  }

  return ranking;
}

export async function updateUserRanking(
  id: string,
  updates: Partial<Tables<"user_rankings">>
): Promise<Tables<"user_rankings">> {
  const { data, error } = await supabase
    .from("user_rankings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUserRanking(id: string): Promise<void> {
  const { error } = await supabase
    .from("user_rankings")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
