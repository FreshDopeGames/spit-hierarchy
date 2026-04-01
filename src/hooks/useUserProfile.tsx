import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  username_last_changed_at?: string | null;
}

export const useUserProfile = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['own-profile', user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      const { data, error } = await supabase
        .rpc('get_own_profile')
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user && !authLoading,
    staleTime: 30_000,
  });

  return { 
    userProfile: userProfile ?? null, 
    loading: authLoading || isLoading,
    error: error?.message ?? null
  };
};
