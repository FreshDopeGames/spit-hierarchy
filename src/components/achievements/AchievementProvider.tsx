
import React, { createContext, useContext, useState } from 'react';
import { useAchievements } from '@/hooks/useAchievements';
import AchievementNotification from './AchievementNotification';

interface AchievementContextType {
  showAchievement: (achievement: any) => void;
}

const AchievementContext = createContext<AchievementContextType>({
  showAchievement: () => {}
});

export const useAchievementNotifications = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievementNotifications must be used within AchievementProvider');
  }
  return context;
};

export const AchievementProvider = ({ children }: { children: React.ReactNode }) => {
  const { newAchievements, dismissNotification } = useAchievements();
  const [manualAchievements, setManualAchievements] = useState<any[]>([]);

  const showAchievement = (achievement: any) => {
    setManualAchievements(prev => [...prev, achievement]);
  };

  const handleDismiss = (achievementId: string, isManual: boolean = false) => {
    if (isManual) {
      setManualAchievements(prev => prev.filter(a => a.id !== achievementId));
    } else {
      dismissNotification(achievementId);
    }
  };

  const allNotifications = [...newAchievements, ...manualAchievements];

  return (
    <AchievementContext.Provider value={{ showAchievement }}>
      {children}
      {/* Render achievement notifications */}
      {allNotifications.map((achievement, index) => (
        <AchievementNotification
          key={`${achievement.id}-${index}`}
          achievement={achievement}
          onClose={() => handleDismiss(achievement.id, manualAchievements.includes(achievement))}
        />
      ))}
    </AchievementContext.Provider>
  );
};
