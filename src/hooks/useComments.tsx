import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { validateContent } from "@/utils/contentModeration";

interface Comment {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  comment_text: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  comment_likes: Array<{
    id: string;
    user_id: string;
  }>;
  replies?: Comment[];
}

interface UseCommentsProps {
  contentType: "rapper" | "blog" | "ranking";
  contentId: string;
}

export const useComments = ({ contentType, contentId }: UseCommentsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  // Fetch comments with user profiles and likes
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", contentType, contentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles(username, avatar_url),
          comment_likes(id, user_id)
        `)
        .eq("content_type", contentType)
        .eq("content_id", contentId)
        .is("parent_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies, error: repliesError } = await supabase
            .from("comments")
            .select(`
              *,
              profiles(username, avatar_url),
              comment_likes(id, user_id)
            `)
            .eq("parent_id", comment.id)
            .order("created_at", { ascending: true });

          if (repliesError) throw repliesError;

          return {
            ...comment,
            replies: replies || []
          };
        })
      );

      return commentsWithReplies as Comment[];
    }
  });

  // Create comment mutation with content validation
  const createCommentMutation = useMutation({
    mutationFn: async ({ text, parentId }: { text: string; parentId?: string }) => {
      if (!user) throw new Error("Must be logged in to comment");

      // Validate content for profanity and inappropriate language
      const validation = validateContent(text);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      const { data, error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          comment_text: text,
          parent_id: parentId || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", contentType, contentId] });
      setNewComment("");
      toast.success("Your comment has been added successfully.");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Must be logged in to like comments");

      // Check if already liked
      const { data: existingLike } = await supabase
        .from("comment_likes")
        .select("id")
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .single();

      if (existingLike) {
        // Remove like
        const { error } = await supabase
          .from("comment_likes")
          .delete()
          .eq("id", existingLike.id);
        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from("comment_likes")
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", contentType, contentId] });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Must be logged in to delete comments");

      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", contentType, contentId] });
      toast.success("Comment deleted successfully.");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0);
  }, 0);

  return {
    comments,
    isLoading,
    totalComments,
    newComment,
    setNewComment,
    createComment: createCommentMutation.mutate,
    isCreatingComment: createCommentMutation.isPending,
    toggleLike: toggleLikeMutation.mutate,
    isTogglingLike: toggleLikeMutation.isPending,
    deleteComment: deleteCommentMutation.mutate,
    isDeletingComment: deleteCommentMutation.isPending,
    user
  };
};
