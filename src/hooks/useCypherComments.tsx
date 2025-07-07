
import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { validateCypherContent } from "@/utils/contentModeration";

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

type SortOption = 'top' | 'latest';

interface UseCypherCommentsProps {
  sortBy?: SortOption;
  limit?: number;
}

export const useCypherComments = ({ 
  sortBy = 'top', 
  limit = 20 
}: UseCypherCommentsProps = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  // Fetch comments with infinite query for pagination
  const { 
    data: commentsData, 
    isLoading, 
    hasNextPage, 
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["cypher-comments", sortBy, limit],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('Fetching cypher comments with sort:', sortBy, 'offset:', pageParam);
      
      let query = supabase
        .from("comments")
        .select(`
          *,
          profiles(username, avatar_url),
          comment_likes(id, user_id)
        `)
        .eq("content_type", "cypher")
        .eq("content_id", "community-cypher")
        .is("parent_id", null)
        .range(pageParam, pageParam + limit - 1);

      // Apply sorting
      if (sortBy === 'top') {
        // Simple top sorting by likes count - in production, you'd implement time decay
        query = query.order("created_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

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

      return {
        comments: commentsWithReplies as Comment[],
        hasMore: (data?.length || 0) === limit
      };
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length * limit : undefined;
    },
    initialPageParam: 0
  });

  const comments = commentsData?.pages.flatMap(page => page.comments) || [];
  const hasMore = hasNextPage;

  // Create comment mutation with enhanced validation
  const createCommentMutation = useMutation({
    mutationFn: async ({ text, parentId }: { text: string; parentId?: string }) => {
      if (!user) throw new Error("Must be logged in to drop bars");

      // Validate content with cypher-specific validation (2000 char limit)
      const validation = validateCypherContent(text);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      const { data, error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          content_type: "cypher",
          content_id: "community-cypher",
          comment_text: text,
          parent_id: parentId || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cypher-comments"] });
      setNewComment("");
      toast.success("Your bars have been dropped! 🔥");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Delete comment mutation (admin only)
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
      queryClient.invalidateQueries({ queryKey: ["cypher-comments"] });
      toast.success("Comment deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment");
    }
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Must be logged in to show love");

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
      queryClient.invalidateQueries({ queryKey: ["cypher-comments"] });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0);
  }, 0);

  const loadMore = () => {
    if (hasMore && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    comments,
    isLoading,
    totalComments,
    newComment,
    setNewComment,
    createComment: createCommentMutation.mutate,
    isCreatingComment: createCommentMutation.isPending,
    deleteComment: deleteCommentMutation.mutate,
    isDeletingComment: deleteCommentMutation.isPending,
    toggleLike: toggleLikeMutation.mutate,
    isTogglingLike: toggleLikeMutation.isPending,
    user,
    hasMore,
    loadMore,
    isLoadingMore: isFetchingNextPage,
    sortBy
  };
};
