import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SESSION_KEY = 'spit_hierarchy_session_tracked';

interface SessionResponse {
  session_count: number;
  xp_awarded: boolean;
  daily_sessions_remaining: number;
}

export const useSessionTracking = () => {
  const { user } = useAuth();
  const hasTracked = useRef(false);

  useEffect(() => {
    const trackSession = async () => {
      // Only track once per hook instance and only for authenticated users
      if (!user || hasTracked.current) return;
      
      // Check if session already tracked in this browser session
      const alreadyTracked = sessionStorage.getItem(SESSION_KEY);
      if (alreadyTracked) return;

      hasTracked.current = true;

      try {
        const { data, error } = await supabase.rpc('increment_session_count');
        
        if (error) {
          console.error('Error tracking session:', error);
          return;
        }

        // Mark session as tracked
        sessionStorage.setItem(SESSION_KEY, 'true');

        const response = data as unknown as SessionResponse;

        // Show appropriate toast based on whether XP was awarded
        if (response?.xp_awarded) {
          toast.success('Welcome back! +10 XP', {
            description: `Session #${response.session_count} - You earned 10 points for starting a new session`,
          });
        } else {
          toast.info('Welcome back!', {
            description: `Session #${response.session_count} - Daily XP limit reached (2/2)`,
          });
        }
      } catch (err) {
        console.error('Session tracking error:', err);
      }
    };

    trackSession();
  }, [user]);
};
