
import { useState, useEffect, useRef } from 'react';

interface UserActivityConfig {
  idleThreshold?: number; // milliseconds of inactivity before considered idle
  onActivityChange?: (isActive: boolean) => void;
}

export const useUserActivity = ({ 
  idleThreshold = 30000, // 30 seconds
  onActivityChange 
}: UserActivityConfig = {}) => {
  const [isActive, setIsActive] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout>();

  const updateActivity = () => {
    const now = Date.now();
    setLastActivity(now);
    
    if (!isActive) {
      setIsActive(true);
      onActivityChange?.(true);
    }

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      setIsActive(false);
      onActivityChange?.(false);
    }, idleThreshold);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Initialize timer
    updateActivity();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [idleThreshold]);

  return {
    isActive,
    lastActivity,
    timeSinceLastActivity: Date.now() - lastActivity
  };
};
