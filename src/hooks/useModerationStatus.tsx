
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ModerationFlag {
  id: string;
  content_type: 'comment' | 'ranking' | 'avatar';
  content_id: string;
  user_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  moderator_id?: string;
  moderator_notes?: string;
}

export const useModerationStatus = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const flagContentMutation = useMutation({
    mutationFn: async ({
      contentType,
      contentId,
      reason
    }: {
      contentType: 'comment' | 'ranking' | 'avatar';
      contentId: string;
      reason: string;
    }) => {
      if (!user) throw new Error("Must be logged in to flag content");

      const { data, error } = await supabase
        .from("content_moderation_flags")
        .insert({
          content_type: contentType,
          content_id: contentId,
          user_id: user.id,
          reason: reason,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation-flags"] });
    }
  });

  return {
    flagContent: flagContentMutation.mutate,
    isFlagging: flagContentMutation.isPending
  };
};
