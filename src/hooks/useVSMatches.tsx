import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "./useSecureAuth";
import { toast } from "sonner";
import { VSMatch, VSMatchWithVoteCounts, CreateVSMatchData, UpdateVSMatchData } from "@/types/vsMatches";

// Helper function to get additional rapper metadata
const getRapperMetadata = async (rapperId: string) => {
  // Get album count
  const { data: albums } = await supabase
    .from("rapper_albums")
    .select("id")
    .eq("rapper_id", rapperId);

  // Get top 5 count
  const { data: topFives } = await supabase
    .from("user_top_rappers")
    .select("id")
    .eq("rapper_id", rapperId);

  return {
    album_count: albums?.length || 0,
    top_five_count: topFives?.length || 0
  };
};

export const useVSMatches = () => {
  const { user } = useSecureAuth();

  return useQuery({
    queryKey: ["vs-matches"],
    queryFn: async (): Promise<VSMatchWithVoteCounts[]> => {
      const { data, error } = await supabase
        .from("vs_matches")
        .select(`
          *,
          rapper_1:rappers!rapper_1_id (
            id, name, slug, real_name, origin, birth_year, 
            average_rating, total_votes, verified
          ),
          rapper_2:rappers!rapper_2_id (
            id, name, slug, real_name, origin, birth_year, 
            average_rating, total_votes, verified
          )
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get vote counts and user votes for each match
      const matchesWithVotes = await Promise.all(
        data.map(async (match) => {
          // Get vote counts
          const { data: votes, error: votesError } = await supabase
            .from("vs_match_votes")
            .select("rapper_choice_id, user_id")
            .eq("vs_match_id", match.id);

          if (votesError) throw votesError;

          const rapper_1_votes = votes.filter(v => v.rapper_choice_id === match.rapper_1_id).length;
          const rapper_2_votes = votes.filter(v => v.rapper_choice_id === match.rapper_2_id).length;
          const total_votes = votes.length;

          // Check if current user has voted
          const user_vote = user ? votes.find(v => v.user_id === user.id)?.rapper_choice_id : undefined;

          // Get additional metadata for both rappers
          const [rapper1Metadata, rapper2Metadata] = await Promise.all([
            getRapperMetadata(match.rapper_1_id),
            getRapperMetadata(match.rapper_2_id)
          ]);

          return {
            ...match,
            rapper_1: { ...match.rapper_1, ...rapper1Metadata },
            rapper_2: { ...match.rapper_2, ...rapper2Metadata },
            rapper_1_votes,
            rapper_2_votes,
            total_votes,
            user_vote,
          };
        })
      );

      return matchesWithVotes;
    },
    enabled: true,
  });
};

export const useVSMatchBySlug = (slug: string) => {
  const { user } = useSecureAuth();

  return useQuery({
    queryKey: ["vs-match", slug],
    queryFn: async (): Promise<VSMatchWithVoteCounts> => {
      const { data, error } = await supabase
        .from("vs_matches")
        .select(`
          *,
          rapper_1:rappers!rapper_1_id (
            id, name, slug, real_name, origin, birth_year, 
            average_rating, total_votes, verified
          ),
          rapper_2:rappers!rapper_2_id (
            id, name, slug, real_name, origin, birth_year, 
            average_rating, total_votes, verified
          )
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) throw error;

      // Get vote counts and user vote
      const { data: votes, error: votesError } = await supabase
        .from("vs_match_votes")
        .select("rapper_choice_id, user_id")
        .eq("vs_match_id", data.id);

      if (votesError) throw votesError;

      const rapper_1_votes = votes.filter(v => v.rapper_choice_id === data.rapper_1_id).length;
      const rapper_2_votes = votes.filter(v => v.rapper_choice_id === data.rapper_2_id).length;
      const total_votes = votes.length;

      // Check if current user has voted
      const user_vote = user ? votes.find(v => v.user_id === user.id)?.rapper_choice_id : undefined;

      // Get additional metadata for both rappers
      const [rapper1Metadata, rapper2Metadata] = await Promise.all([
        getRapperMetadata(data.rapper_1_id),
        getRapperMetadata(data.rapper_2_id)
      ]);

      return {
        ...data,
        rapper_1: { ...data.rapper_1, ...rapper1Metadata },
        rapper_2: { ...data.rapper_2, ...rapper2Metadata },
        rapper_1_votes,
        rapper_2_votes,
        total_votes,
        user_vote,
      };
    },
    enabled: !!slug,
  });
};

export const useVSMatchVote = () => {
  const { user } = useSecureAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, rapperChoiceId }: { matchId: string; rapperChoiceId: string }) => {
      if (!user) throw new Error("User must be authenticated to vote");

      const { error } = await supabase
        .from("vs_match_votes")
        .insert({
          vs_match_id: matchId,
          user_id: user.id,
          rapper_choice_id: rapperChoiceId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vs-matches"] });
      queryClient.invalidateQueries({ queryKey: ["vs-match"] });
      toast.success("Your vote has been recorded!");
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate key")) {
        toast.error("You've already voted on this matchup today!");
      } else {
        toast.error("Failed to record your vote. Please try again.");
      }
    },
  });
};

// Admin hooks
export const useCreateVSMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateVSMatchData) => {
      // Generate slug from title
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const { error } = await supabase
        .from("vs_matches")
        .insert({
          ...data,
          slug,
          created_by: (await supabase.auth.getUser()).data.user?.id!,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vs-matches"] });
      queryClient.invalidateQueries({ queryKey: ["admin-vs-matches"] });
      toast.success("VS match created successfully!");
    },
    onError: () => {
      toast.error("Failed to create VS match");
    },
  });
};

export const useUpdateVSMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateVSMatchData) => {
      const { error } = await supabase
        .from("vs_matches")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vs-matches"] });
      queryClient.invalidateQueries({ queryKey: ["admin-vs-matches"] });
      toast.success("VS match updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update VS match");
    },
  });
};

export const useDeleteVSMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vs_matches")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vs-matches"] });
      queryClient.invalidateQueries({ queryKey: ["admin-vs-matches"] });
      toast.success("VS match deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete VS match");
    },
  });
};