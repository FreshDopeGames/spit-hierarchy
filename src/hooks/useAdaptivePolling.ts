
import { useRef, useEffect, useState } from 'react';
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
  const [shouldPoll, setShouldPoll] = useState(enabled);
  const { isActive } = useUserActivity({ idleThreshold: 15000 }); // 15 seconds idle threshold

  useEffect(() => {
    if (!enabled) {
      setShouldPoll(false);
      return;
    }

    if (isActive) {
      // User is active, use base interval
      intervalRef.current = baseInterval;
      setShouldPoll(true);
    } else {
      // User is idle, gradually increase interval
      const currentInterval = intervalRef.current;
      const nextInterval = Math.min(currentInterval * 2, maxInterval);
      intervalRef.current = nextInterval;
      setShouldPoll(true);
    }
  }, [isActive, baseInterval, maxInterval, enabled]);

  return {
    refetchInterval: shouldPoll ? intervalRef.current : false,
    refetchIntervalInBackground: false as const, // Never poll in background
    isActive
  };
};
