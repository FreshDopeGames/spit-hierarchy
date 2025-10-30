
import React, { useEffect, useState } from "react";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { Badge } from "@/components/ui/badge";
import * as LucideIcons from "lucide-react";
import { X } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const rarityColors = {
  common: "from-rap-gold-dark to-rap-gold",
  rare: "from-blue-500 to-blue-600",
  epic: "from-rap-gold to-rap-gold-light",
  legendary: "from-rap-gold via-rap-gold-light to-rap-gold-dark"
};

const AchievementNotification = ({ 
  achievement, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const IconComponent = (LucideIcons as any)[achievement.icon] || LucideIcons.Star;

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto close
    if (autoClose) {
      const closeTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
      };
    }
    
    return () => clearTimeout(timer);
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <Card className="bg-[hsl(var(--theme-surface))] border-2 border-[hsl(var(--theme-primary))] shadow-2xl shadow-[hsl(var(--theme-primary))]/30 min-w-80">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-[var(--theme-primary)]">🎉 Achievement Unlocked!</h3>
            <button 
              onClick={handleClose}
              className="text-[var(--theme-textMuted)] hover:text-[var(--theme-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rarityColors[achievement.rarity]} flex items-center justify-center shadow-lg animate-pulse`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-[var(--theme-text)]">{achievement.name}</h4>
                <Badge 
                  variant="secondary" 
                  className={`bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white text-xs capitalize`}
                >
                  {achievement.rarity}
                </Badge>
              </div>
              <p className="text-[var(--theme-textMuted)] text-sm mb-1">{achievement.description}</p>
              <p className="text-[var(--theme-primary)] text-xs font-bold">+{achievement.points} points</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementNotification;
