import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUsernameCheck = () => {
  const { user, isAuthenticated } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['username-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 5 * 1000,
  });

  const needsUsername = isAuthenticated && !isLoading && (
    !profile ||
    !profile.username ||
    profile.username.trim() === '' ||
    profile.username.includes('@')
  );

  return { needsUsername, isLoading, currentUsername: profile?.username ?? null };
};
