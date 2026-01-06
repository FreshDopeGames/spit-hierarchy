import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SESSION_KEY = 'spit_hierarchy_session_tracked';

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
        const { data: sessionCount, error } = await supabase.rpc('increment_session_count');
        
        if (error) {
          console.error('Error tracking session:', error);
          return;
        }

        // Mark session as tracked
        sessionStorage.setItem(SESSION_KEY, 'true');

        // Show welcome back toast with XP
        toast.success('Welcome back! +5 XP', {
          description: `Session #${sessionCount} - You earned 5 points for starting a new session`,
        });
      } catch (err) {
        console.error('Session tracking error:', err);
      }
    };

    trackSession();
  }, [user]);
};
