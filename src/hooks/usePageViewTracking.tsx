import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UsePageViewTrackingOptions {
  contentType: 'rapper' | 'blog' | 'ranking' | 'vs_match';
  contentId: string | undefined;
  debounceMs?: number;
}

/**
 * Hook to track page views for content items
 * Automatically records view after debounce period if user stays on page
 * Prevents duplicate tracking within 1 minute for same content
 */
export const usePageViewTracking = ({ 
  contentType, 
  contentId,
  debounceMs = 1000 // Reduced from 3000ms for faster tracking
}: UsePageViewTrackingOptions) => {
  const { user } = useAuth();
  const hasTrackedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Don't track if no content ID or already tracked
    if (!contentId || hasTrackedRef.current) {
      console.log('[PageView] Skipped - no contentId or already tracked', { contentId, hasTracked: hasTrackedRef.current });
      return;
    }

    // Only track rapper pages for now (can be extended to other content types)
    if (contentType !== 'rapper') {
      console.log('[PageView] Skipped - not a rapper page', { contentType });
      return;
    }

    console.log('[PageView] Setting up tracking for rapper:', contentId);

    const trackView = async () => {
      console.log('[PageView] Attempting to track view...');
      try {
        // Get or create session ID for anonymous users
        let sessionId = sessionStorage.getItem('page_view_session');
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('page_view_session', sessionId);
        }

        // Check if we've recently tracked this view (within 1 minute)
        const recentViewKey = `recent_view_${contentType}_${contentId}`;
        const lastViewTime = sessionStorage.getItem(recentViewKey);
        
        if (lastViewTime) {
          const timeSinceLastView = Date.now() - parseInt(lastViewTime);
          const oneMinute = 1 * 60 * 1000; // Reduced from 5 minutes
          
          if (timeSinceLastView < oneMinute) {
            console.log('[PageView] Skipping duplicate - tracked', Math.round(timeSinceLastView / 1000), 'seconds ago');
            return;
          }
        }

        console.log('[PageView] Inserting page view record...');

        // Record the page view
        const { error } = await supabase
          .from('rapper_page_views')
          .insert({
            rapper_id: contentId,
            user_id: user?.id || null,
            session_id: user?.id ? null : sessionId, // Only use session_id for anonymous users
            viewed_at: new Date().toISOString()
          });

        if (error) {
          console.error('[PageView] ❌ Error tracking page view:', error);
        } else {
          // Mark this view as tracked and store timestamp
          hasTrackedRef.current = true;
          sessionStorage.setItem(recentViewKey, Date.now().toString());
          console.log('[PageView] ✅ Successfully tracked view for rapper:', contentId);
        }
      } catch (error) {
        console.error('[PageView] ❌ Exception in page view tracking:', error);
      }
    };

    // Debounce the tracking - only track if user stays on page
    console.log('[PageView] ⏱️  Waiting', debounceMs, 'ms before tracking...');
    timeoutRef.current = setTimeout(trackView, debounceMs);

    // Cleanup timeout on unmount or content change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [contentId, contentType, user?.id, debounceMs]);

  // Return nothing - this is a side-effect only hook
  return null;
};
