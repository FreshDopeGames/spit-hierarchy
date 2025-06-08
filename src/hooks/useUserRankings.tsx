import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Tables } from "@/integrations/supabase/types";
import { validateContent } from "@/utils/contentModeration";
import { useToast } from "@/hooks/use-toast";

export interface UserRanking {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  createdAt: string;
  timeAgo: string;
  rappers: Array<{
    rank: number;
    name: string;
    reason: string;
  }>;
  likes: number;
  comments: number;
  views: number;
  isPublic: boolean;
  isOfficial: boolean;
  tags: string[];
  slug?: string;
}

interface UserRankingFromDB extends Tables<"user_rankings"> {
  profiles?: {
    username: string;
    full_name?: string;
  } | null;
  user_ranking_items: Array<{
    position: number;
    reason: string | null;
    rapper: {
      name: string;
    } | null;
  }>;
  user_ranking_tag_assignments: Array<{
    ranking_tags: {
      name: string;
    } | null;
  }>;
}

export const useUserRankings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-rankings"],
    queryFn: async () => {
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
  });
};

export const useCreateUserRanking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (rankingData: {
      title: string;
      description: string;
      category: string;
      tags?: string[];
      isPublic?: boolean;
    }) => {
      if (!user) {
        throw new Error("User must be logged in to create rankings");
      }

      // Validate title and description for profanity
      const titleValidation = validateContent(rankingData.title);
      if (!titleValidation.isValid) {
        throw new Error(`Title contains inappropriate content: ${titleValidation.message}`);
      }

      if (rankingData.description) {
        const descValidation = validateContent(rankingData.description);
        if (!descValidation.isValid) {
          throw new Error(`Description contains inappropriate content: ${descValidation.message}`);
        }
      }

      // Generate a slug from the title
      const slug = generateSlug(rankingData.title);

      // Create the ranking
      const { data: ranking, error: rankingError } = await supabase
        .from("user_rankings")
        .insert({
          title: rankingData.title,
          description: rankingData.description,
          category: rankingData.category,
          slug: slug,
          user_id: user.id,
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-rankings"] });
      toast({
        title: "Ranking created!",
        description: "Your ranking has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating ranking",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

export const useUpdateUserRanking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Tables<"user_rankings">> 
    }) => {
      const { data, error } = await supabase
        .from("user_rankings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-rankings"] });
    }
  });
};

export const useDeleteUserRanking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_rankings")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-rankings"] });
    }
  });
};

// Helper functions
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2419200) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return date.toLocaleDateString();
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}
