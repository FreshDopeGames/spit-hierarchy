import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type PageType = 'blog_visits' | 'about_visits' | 'analytics_visits' | 'vs_visits';

/**
 * Hook to track static page visits for achievement unlocking
 * Increments member_stats counter and triggers achievement check
 */
export const usePageVisitTracking = (pageType: PageType) => {
  const { user } = useAuth();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    console.log('[PageVisit] Hook initialized', { 
      pageType, 
      hasUser: !!user, 
      userId: user?.id,
      hasTracked: hasTrackedRef.current 
    });

    // Only track once per session for authenticated users
    if (!user) {
      console.log('[PageVisit] ⏸️  Skipped - user not authenticated');
      return;
    }

    if (hasTrackedRef.current) {
      console.log('[PageVisit] ⏸️  Skipped - already tracked in ref');
      return;
    }

    const trackPageVisit = async () => {
      try {
        // Check if already tracked in this session
        const sessionKey = `page_visit_${pageType}`;
        const hasTrackedInSession = sessionStorage.getItem(sessionKey);
        
        if (hasTrackedInSession) {
          console.log('[PageVisit] ⏸️  Skipped - already tracked in sessionStorage');
          return;
        }

        console.log('[PageVisit] 📡 Calling RPC: increment_page_visit_stat', { stat_field: pageType });

        // Call the database function to increment the stat
        const { error } = await supabase.rpc('increment_page_visit_stat', {
          stat_field: pageType
        });

        if (error) {
          console.error('[PageVisit] ❌ Error tracking page visit:', error);
        } else {
          hasTrackedRef.current = true;
          sessionStorage.setItem(sessionKey, 'true');
          console.log('[PageVisit] ✅ Tracked visit for:', pageType);
        }
      } catch (error) {
        console.error('[PageVisit] ❌ Exception tracking page visit:', error);
      }
    };

    // Track after a short delay to ensure user actually viewed the page
    console.log('[PageVisit] ⏱️  Waiting 1000ms before tracking...');
    const timeoutId = setTimeout(trackPageVisit, 1000);

    return () => clearTimeout(timeoutId);
  }, [user, pageType]);

  return null;
};
