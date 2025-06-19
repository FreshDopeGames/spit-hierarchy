
import { useRef, useEffect } from 'react';
import { useUserActivity } from './useUserActivity';

interface AdaptivePollingConfig {
  baseInterval: number; // Base polling interval in milliseconds
  maxInterval: number; // Maximum polling interval
  enabled: boolean;
}

export const useAdaptivePolling = ({
  baseInterval = 5000,
  maxInterval = 60000,
  enabled = true
}: AdaptivePollingConfig) => {
  const intervalRef = useRef<number>(baseInterval);
  const { isActive } = useUserActivity({ idleThreshold: 15000 }); // 15 seconds idle threshold

  useEffect(() => {
    if (!enabled) {
      intervalRef.current = false as any;
      return;
    }

    if (isActive) {
      // User is active, use base interval
      intervalRef.current = baseInterval;
    } else {
      // User is idle, gradually increase interval
      const currentInterval = intervalRef.current;
      const nextInterval = Math.min(currentInterval * 2, maxInterval);
      intervalRef.current = nextInterval;
    }
  }, [isActive, baseInterval, maxInterval, enabled]);

  // Return false to disable polling completely when tab is not visible
  const shouldPoll = enabled && (typeof intervalRef.current === 'number');
  
  return {
    refetchInterval: shouldPoll ? intervalRef.current : false,
    refetchIntervalInBackground: false, // Never poll in background
    isActive
  };
};
