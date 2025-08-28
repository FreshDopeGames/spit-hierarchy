
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import * as LucideIcons from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  is_earned: boolean;
  progress_percentage: number;
  earned_at?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  showProgress?: boolean;
}

const rarityColors = {
  common: "bg-[var(--theme-textMuted)]",
  rare: "bg-blue-500", 
  epic: "bg-[var(--theme-primary)]",
  legendary: "bg-indigo-600"
};

const rarityBorders = {
  common: "border-[var(--theme-textMuted)]/30",
  rare: "border-blue-500/30",
  epic: "border-[var(--theme-primary)]/30", 
  legendary: "border-indigo-600/30"
};

const AchievementCard = ({ achievement, showProgress = true }: AchievementCardProps) => {
  const IconComponent = (LucideIcons as any)[achievement.icon] || LucideIcons.Star;
  
  return (
    <Card className={`bg-[var(--theme-surface)] border-2 ${rarityBorders[achievement.rarity]} ${
      achievement.is_earned ? 'opacity-100' : 'opacity-60'
    } transition-all hover:scale-105`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`w-12 h-12 rounded-xl ${rarityColors[achievement.rarity]} flex items-center justify-center shadow-lg`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-[var(--theme-primary)] truncate">{achievement.name}</h3>
              <Badge 
                variant="secondary" 
                className={`${rarityColors[achievement.rarity]} text-white text-xs capitalize`}
              >
                {achievement.rarity}
              </Badge>
            </div>
            
            <p className="text-[var(--theme-text)] text-sm mb-2">{achievement.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-[var(--theme-textMuted)] text-xs">{achievement.points} points</span>
              {achievement.is_earned && achievement.earned_at && (
                <span className="text-[var(--theme-primary)] text-xs">
                  Earned {new Date(achievement.earned_at).toLocaleDateString()}
                </span>
              )}
            </div>
            
            {showProgress && !achievement.is_earned && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-[var(--theme-textMuted)] mb-1">
                  <span>Progress</span>
                  <span>{Math.round(achievement.progress_percentage)}%</span>
                </div>
                <Progress 
                  value={achievement.progress_percentage} 
                  className="h-2 bg-[var(--theme-surface)]"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
