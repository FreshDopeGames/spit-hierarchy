import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Secure hook for getting own complete profile
export const useOwnProfile = () => {
  return useQuery({
    queryKey: ['own-profile'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_own_profile').single();
      if (error) throw error;
      return data;
    },
    retry: 1,
  });
};

// Secure hook for getting minimal public profile data
export const usePublicProfileMinimal = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['public-profile-minimal', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase.rpc('get_public_profile_minimal', { 
        profile_user_id: userId 
      }).single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    retry: 1,
  });
};

// Secure hook for getting profile data for display contexts
export const useProfileForDisplay = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile-for-display', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase.rpc('get_profile_for_display', { 
        profile_user_id: userId 
      }).single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    retry: 1,
  });
};

// Secure hook for batch profile retrieval
export const useProfilesBatch = (userIds: string[]) => {
  return useQuery({
    queryKey: ['profiles-batch', userIds.sort()],
    queryFn: async () => {
      if (!userIds.length) return [];
      const { data, error } = await supabase.rpc('get_profiles_batch', { 
        profile_user_ids: userIds 
      });
      if (error) throw error;
      return data || [];
    },
    enabled: userIds.length > 0,
    retry: 1,
  });
};

// Admin-only hook for searching profiles
export const useAdminProfileSearch = (searchTerm: string = '') => {
  return useQuery({
    queryKey: ['admin-profile-search', searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_profiles_admin', { 
        search_term: searchTerm 
      });
      if (error) throw error;
      return data || [];
    },
    retry: 1,
  });
};