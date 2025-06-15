
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";

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

const rarityColors = {
  common: "from-gray-500 to-gray-600",
  rare: "from-blue-500 to-blue-600", 
  epic: "from-purple-500 to-purple-600",
  legendary: "from-yellow-500 to-yellow-600"
};

const AchievementToast = ({ achievement }: AchievementToastProps) => {
  const IconComponent = (LucideIcons as any)[achievement.icon] || LucideIcons.Star;

  return (
    <div className="flex items-center space-x-3 p-4 bg-carbon-fiber border-2 border-rap-gold rounded-lg shadow-xl">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rarityColors[achievement.rarity]} flex items-center justify-center shadow-lg animate-pulse`}>
        <IconComponent className="w-6 h-6 text-white" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-bold text-rap-gold">🎉 Achievement Unlocked!</h4>
        </div>
        <h5 className="font-bold text-white">{achievement.name}</h5>
        <p className="text-rap-platinum text-sm">{achievement.description}</p>
        <p className="text-rap-gold text-xs font-bold">+{achievement.points} points</p>
      </div>
    </div>
  );
};

export const showAchievementToast = (achievement: Achievement) => {
  toast.custom((t) => <AchievementToast achievement={achievement} />, {
    duration: 5000,
    position: "bottom-center",
  });
};

export default AchievementToast;
