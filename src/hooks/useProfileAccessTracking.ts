import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UseProfileAccessTrackingOptions {
  accessedProfileId: string;
  isSelf: boolean;
  dedupeKeyPrefix?: string;
}

/**
 * Hook to track profile access for achievement unlocking
 * Logs profile views once per session and triggers achievement evaluation
 */
export const useProfileAccessTracking = ({
  accessedProfileId,
  isSelf,
  dedupeKeyPrefix = 'profile_access'
}: UseProfileAccessTrackingOptions) => {
  const { user } = useAuth();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    console.log('[ProfileAccess] Hook initialized', { 
      accessedProfileId,
      isSelf,
      hasUser: !!user,
      userId: user?.id,
      hasTracked: hasTrackedRef.current 
    });

    // Only track for authenticated users
    if (!user) {
      console.log('[ProfileAccess] ⏸️  Skipped - user not authenticated');
      return;
    }

    // For self-views, skip the ref check - we want to track on every mount
    // For other profiles, use ref to prevent duplicate tracking in same session
    if (!isSelf && hasTrackedRef.current) {
      console.log('[ProfileAccess] ⏸️  Skipped - already tracked in ref');
      return;
    }

    const trackProfileAccess = async () => {
      try {
        const sessionKey = `${dedupeKeyPrefix}_${isSelf ? 'self' : accessedProfileId}`;
        const hasTrackedInSession = sessionStorage.getItem(sessionKey);
        
        // For other profiles, respect sessionStorage to avoid duplicate tracking
        if (!isSelf && hasTrackedInSession) {
          console.log('[ProfileAccess] ⏸️  Skipped - already tracked in sessionStorage');
          return;
        }

        const accessType = isSelf ? 'self_view' : 'view';
        console.log('[ProfileAccess] 📡 Calling RPC: log_profile_access', { 
          accessed_id: accessedProfileId, 
          access_type: accessType 
        });

        // Log the profile access
        const { error: logError } = await supabase.rpc('log_profile_access', {
          accessed_id: accessedProfileId,
          access_type: accessType
        });

        if (logError) {
          console.error('[ProfileAccess] ❌ Error logging profile access:', logError);
          return;
        }

        hasTrackedRef.current = true;
        sessionStorage.setItem(sessionKey, 'true');
        console.log('[ProfileAccess] ✅ Logged profile access:', accessType);

        // Trigger achievement check
        console.log('[ProfileAccess] 🏆 Triggering achievement check...');
        const { error: achievementError } = await supabase.rpc('check_and_award_achievements', {
          target_user_id: user.id
        });

        if (achievementError) {
          console.error('[ProfileAccess] ❌ Error checking achievements:', achievementError);
        } else {
          console.log('[ProfileAccess] ✅ Achievement check completed');
        }
      } catch (error) {
        console.error('[ProfileAccess] ❌ Exception tracking profile access:', error);
      }
    };

    // Track after a short delay to ensure user actually viewed the page
    console.log('[ProfileAccess] ⏱️  Waiting 1000ms before tracking...');
    const timeoutId = setTimeout(trackProfileAccess, 1000);

    return () => clearTimeout(timeoutId);
  }, [user, accessedProfileId, isSelf, dedupeKeyPrefix]);

  return null;
};
