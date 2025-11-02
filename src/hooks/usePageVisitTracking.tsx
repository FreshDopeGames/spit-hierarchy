import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type PageType = 'blog_visits' | 'about_visits';

/**
 * Hook to track static page visits for achievement unlocking
 * Increments member_stats counter and triggers achievement check
 */
export const usePageVisitTracking = (pageType: PageType) => {
  const { user } = useAuth();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    // Only track once per session for authenticated users
    if (!user || hasTrackedRef.current) {
      return;
    }

    const trackPageVisit = async () => {
      try {
        // Check if already tracked in this session
        const sessionKey = `page_visit_${pageType}`;
        const hasTrackedInSession = sessionStorage.getItem(sessionKey);
        
        if (hasTrackedInSession) {
          return;
        }

        // Call the database function to increment the stat
        const { error } = await supabase.rpc('increment_page_visit_stat', {
          stat_field: pageType
        });

        if (error) {
          console.error('[PageVisit] Error tracking page visit:', error);
        } else {
          hasTrackedRef.current = true;
          sessionStorage.setItem(sessionKey, 'true');
          console.log('[PageVisit] ✅ Tracked visit for:', pageType);
        }
      } catch (error) {
        console.error('[PageVisit] Exception tracking page visit:', error);
      }
    };

    // Track after a short delay to ensure user actually viewed the page
    const timeoutId = setTimeout(trackPageVisit, 1000);

    return () => clearTimeout(timeoutId);
  }, [user, pageType]);

  return null;
};
