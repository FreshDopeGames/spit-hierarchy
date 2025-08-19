import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PublicProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio_preview: string | null;
  created_at: string;
}

export const usePublicProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['public-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Use the secure function to get public profile data
      const { data, error } = await supabase
        .rpc('get_profile_for_display', { profile_user_id: userId });
      
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!userId,
  });
};

export const usePublicProfiles = (userIds: string[]) => {
  return useQuery({
    queryKey: ['public-profiles', userIds.sort()],
    queryFn: async () => {
      if (!userIds.length) return [];
      
      // Get public profiles for multiple users
      const profiles = await Promise.all(
        userIds.map(async (id) => {
          const { data, error } = await supabase
            .rpc('get_profile_for_display', { profile_user_id: id });
          
          if (error) {
            console.error(`Error fetching profile for ${id}:`, error);
            return null;
          }
          return data?.[0] || null;
        })
      );
      
      return profiles.filter(Boolean) as PublicProfile[];
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
      
      // Use secure batch function for multiple profiles
      const { data, error } = await supabase
        .rpc('get_profiles_batch', { profile_user_ids: userIds });
      
      if (error) throw error;
      return data || [];
    },
    enabled: userIds.length > 0,
  });
};