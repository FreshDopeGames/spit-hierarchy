import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { toast } from "sonner";

interface TrackVoteResult {
  success: boolean;
  vote_exists: boolean;
  vote_count: number;
  error?: string;
}

export const useTrackVoting = (rapperSlug: string, albumSlug: string) => {
  const { user } = useSecureAuth();
  const queryClient = useQueryClient();

  const toggleVote = useMutation({
    mutationFn: async (trackId: string) => {
      if (!user) {
        throw new Error("Please sign in to vote on tracks");
      }

      const { data, error } = await supabase.rpc("toggle_track_vote", {
        track_uuid: trackId,
        user_uuid: user.id,
      });

      if (error) throw error;

      if (!data || typeof data !== 'object') {
        throw new Error("Invalid response from server");
      }

      return data as unknown as TrackVoteResult;
    },
    onMutate: async (trackId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["album-detail", rapperSlug, albumSlug],
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "album-detail",
        rapperSlug,
        albumSlug,
      ]);

      // Optimistically update the cache
      queryClient.setQueryData(
        ["album-detail", rapperSlug, albumSlug],
        (old: any) => {
          if (!old) return old;

          const tracks = old.tracks.map((track: any) => {
            if (track.id === trackId) {
              const newVoteCount = track.user_has_voted
                ? track.vote_count - 1
                : track.vote_count + 1;
              return {
                ...track,
                user_has_voted: !track.user_has_voted,
                vote_count: Math.max(0, newVoteCount),
              };
            }
            return track;
          });

          return { ...old, tracks };
        }
      );

      return { previousData };
    },
    onError: (error: any, _trackId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["album-detail", rapperSlug, albumSlug],
          context.previousData
        );
      }
      
      const errorMessage = error.message || "Failed to update vote";
      toast.error(errorMessage);
    },
    onSuccess: (data) => {
      // Invalidate to ensure we have the latest data
      queryClient.invalidateQueries({
        queryKey: ["album-detail", rapperSlug, albumSlug],
      });
    },
  });

  return {
    toggleVote: toggleVote.mutateAsync,
    isSubmitting: toggleVote.isPending,
  };
};
