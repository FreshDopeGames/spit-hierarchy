import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PublicProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  member_stats: {
    total_votes: number;
    status: string;
    consecutive_voting_days: number;
    total_comments: number;
    ranking_lists_created: number;
    top_five_created: number;
  };
}

export const usePublicProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['public-profile-full', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Use the new secure function to get full public profile data
      const { data, error } = await supabase
        .rpc('get_public_profile_full', { profile_user_id: userId })
        .single();
      
      if (error) throw error;
      
      // Transform the response to match our interface
      if (data) {
        return {
          id: data.id,
          username: data.username,
          avatar_url: data.avatar_url,
          bio: data.bio,
          created_at: data.created_at,
          member_stats: data.member_stats
        };
      }
      
      return null;
    },
    enabled: !!userId,
  });
};

export const usePublicProfiles = (userIds: string[]) => {
  return useQuery({
    queryKey: ['public-profiles-batch', userIds.sort()],
    queryFn: async () => {
      if (!userIds.length) return [];
      
      // Use the new batch function for better performance
      const { data, error } = await supabase
        .rpc('get_public_profiles_batch', { profile_user_ids: userIds });
      
      if (error) throw error;
      return data || [];
    },
    enabled: userIds.length > 0,
  });
};

// Hook for getting limited profile data for authenticated users only
export const useAuthenticatedProfiles = (userIds: string[]) => {
  return useQuery({
    queryKey: ['authenticated-profiles', userIds.sort()],
    queryFn: async () => {
      if (!userIds.length) return [];
      
      // Use the new public profiles batch function
      const { data, error } = await supabase
        .rpc('get_public_profiles_batch', { profile_user_ids: userIds });
      
      if (error) throw error;
      return data || [];
    },
    enabled: userIds.length > 0,
  });
};