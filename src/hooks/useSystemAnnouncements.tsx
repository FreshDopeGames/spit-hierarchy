import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMemberStatus } from '@/hooks/useMemberStatus';

interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'feature_release' | 'maintenance';
  created_by: string | null;
  is_active: boolean;
  starts_at: string;
  expires_at: string | null;
  target_audience: string;
  display_priority: number;
  icon: string | null;
  action_url: string | null;
  action_text: string | null;
  created_at: string;
  updated_at: string;
}

export const useSystemAnnouncements = () => {
  const { user } = useAuth();
  const { currentStatus } = useMemberStatus();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['system-announcements', currentStatus],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('system_announcements')
        .select('*')
        .eq('is_active', true)
        .lte('starts_at', now)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .or(`target_audience.eq.all,target_audience.eq.${currentStatus}`)
        .order('display_priority', { ascending: false });
      
      if (error) throw error;
      return data as SystemAnnouncement[];
    },
    enabled: !!user,
    refetchInterval: 300000, // 5 minutes
  });

  return { announcements, isLoading };
};
