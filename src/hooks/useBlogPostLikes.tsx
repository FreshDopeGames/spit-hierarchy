import { useState, useEffect } from "react";
import { useOptimizedQuery } from "./useOptimizedQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { toast } from "sonner";
import { useSecureRateLimiting } from "@/hooks/useSecureRateLimiting";

export const useBlogPostLikes = (postId: string) => {
  const { user, isAuthenticated } = useSecureAuth();
  const queryClient = useQueryClient();
  
  // Rate limiting for likes
  const { checkRateLimit } = useSecureRateLimiting({
    actionType: 'blog_like',
    maxRequests: 10,
    windowMinutes: 5,
    userSpecific: true
  });

  // Get like count and user's like status with optimized query
  const { data: likeData } = useOptimizedQuery({
    queryKey: ['blog-post-likes', postId],
    queryFn: async () => {
      const [likesResult, userLikeResult] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('likes_count')
          .eq('id', postId)
          .single(),
        isAuthenticated ? supabase
          .from('blog_post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user!.id)
          .maybeSingle() : Promise.resolve({ data: null, error: null })
      ]);

      if (likesResult.error) throw likesResult.error;

      return {
        likesCount: likesResult.data?.likes_count || 0,
        isLiked: !!userLikeResult.data
      };
    },
    enabled: !!postId,
    priority: 'normal',
  });

  // Toggle like mutation with rate limiting
  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        toast.error("Please login to like this post.");
        return;
      }

      // Check rate limit
      await checkRateLimit();

      if (likeData?.isLiked) {
        // Unlike
        const { error } = await supabase
          .from('blog_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user!.id);
        
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('blog_post_likes')
          .insert({
            post_id: postId,
            user_id: user!.id
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-post-likes', postId] });
    },
    onError: (error: any) => {
      if (!error.message?.includes('Rate limit')) {
        toast.error("Failed to update like status. Please try again.");
      }
    }
  });

  return {
    likesCount: likeData?.likesCount || 0,
    isLiked: likeData?.isLiked || false,
    toggleLike: toggleLike.mutate,
    isLoading: toggleLike.isPending
  };
};
