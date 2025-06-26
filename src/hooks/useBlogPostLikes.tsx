
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const useBlogPostLikes = (postId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get like count and user's like status
  const { data: likeData } = useQuery({
    queryKey: ['blog-post-likes', postId],
    queryFn: async () => {
      const [likesResult, userLikeResult] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('likes_count')
          .eq('id', postId)
          .single(),
        user ? supabase
          .from('blog_post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle() : Promise.resolve({ data: null, error: null })
      ]);

      if (likesResult.error) throw likesResult.error;

      return {
        likesCount: likesResult.data?.likes_count || 0,
        isLiked: !!userLikeResult.data
      };
    },
    enabled: !!postId
  });

  // Toggle like mutation
  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast({
          title: "Login required",
          description: "Please login to like this post.",
          variant: "destructive",
        });
        return;
      }

      if (likeData?.isLiked) {
        // Unlike
        const { error } = await supabase
          .from('blog_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('blog_post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-post-likes', postId] });
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    likesCount: likeData?.likesCount || 0,
    isLiked: likeData?.isLiked || false,
    toggleLike: toggleLike.mutate,
    isLoading: toggleLike.isPending
  };
};
