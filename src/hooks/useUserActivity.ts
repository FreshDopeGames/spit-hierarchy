import { useState, useEffect, useRef } from 'react';

interface UserActivityConfig {
  idleThreshold?: number; // milliseconds of inactivity before considered idle
  onActivityChange?: (isActive: boolean) => void;
}

// Discrete events only; high-frequency events (mousemove/scroll) are throttled.
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'mousemove'] as const;
const THROTTLE_MS = 1000;

/**
 * Tracks whether the user is active. Listeners are passive and throttled, and React
 * state only changes on active/idle transitions, so taps and scrolls never trigger
 * re-renders (keeps Interaction to Next Paint low).
 */
export const useUserActivity = ({
  idleThreshold = 30000,
  onActivityChange
}: UserActivityConfig = {}) => {
  const [isActive, setIsActive] = useState(true);
  const isActiveRef = useRef(true);
  const lastActivityRef = useRef(Date.now());
  const lastHandledRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const callbackRef = useRef(onActivityChange);
  callbackRef.current = onActivityChange;

  useEffect(() => {
    const scheduleIdle = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        isActiveRef.current = false;
        setIsActive(false);
        callbackRef.current?.(false);
      }, idleThreshold);
    };

    const handleActivity = () => {
      const now = Date.now();
      lastActivityRef.current = now;
      if (isActiveRef.current && now - lastHandledRef.current < THROTTLE_MS) return;
      lastHandledRef.current = now;

      if (!isActiveRef.current) {
        isActiveRef.current = true;
        setIsActive(true);
        callbackRef.current?.(true);
      }
      scheduleIdle();
    };

    const options: AddEventListenerOptions = { passive: true, capture: true };
    ACTIVITY_EVENTS.forEach(event => document.addEventListener(event, handleActivity, options));
    scheduleIdle();

    return () => {
      ACTIVITY_EVENTS.forEach(event => document.removeEventListener(event, handleActivity, options));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [idleThreshold]);

  return {
    isActive,
    lastActivity: lastActivityRef.current,
    timeSinceLastActivity: Date.now() - lastActivityRef.current
  };
};
