
import React from "react";

// This component is now deprecated in favor of using Sonner toasts directly
// All achievement notifications now use the centralized Sonner toast system
// to prevent duplicate notifications and ensure consistent behavior

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface AchievementToastProps {
  achievement: Achievement;
}

// Deprecated: Use toast() from sonner directly instead
const AchievementToast = ({ achievement }: AchievementToastProps) => {
  return null; // Component disabled to prevent duplicate toasts
};

// Deprecated: Use toast() from sonner directly instead
export const showAchievementToast = (achievement: Achievement) => {
  console.warn('showAchievementToast is deprecated. Use toast() from sonner directly.');
};

export default AchievementToast;
