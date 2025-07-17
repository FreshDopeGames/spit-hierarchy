
import React from "react";
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

interface AchievementTableProps {
  achievements: Achievement[];
  showProgress?: boolean;
}

const rarityColors = {
  common: "bg-gray-500",
  rare: "bg-blue-500",
  epic: "bg-rap-gold", 
  legendary: "bg-indigo-600"
};

const AchievementTable = ({ achievements, showProgress = true }: AchievementTableProps) => {
  return (
    <div className="w-full">
      {/* Mobile/Tablet Card View */}
      <div className="block lg:hidden space-y-3">
        {achievements.map((achievement) => {
          const IconComponent = (LucideIcons as any)[achievement.icon] || LucideIcons.Star;
          
          return (
            <div 
              key={achievement.id} 
              className={`bg-gray-900 border border-rap-gold/30 rounded-lg p-4 ${
                achievement.is_earned ? 'opacity-100' : 'opacity-60'
              }`}
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className={`w-10 h-10 rounded-lg ${rarityColors[achievement.rarity]} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-rap-gold text-sm truncate pr-2">{achievement.name}</h4>
                    <Badge 
                      variant="secondary" 
                      className={`${rarityColors[achievement.rarity]} text-white text-xs capitalize flex-shrink-0`}
                    >
                      {achievement.rarity}
                    </Badge>
                  </div>
                  
                  <p className="text-rap-platinum text-xs mb-2 line-clamp-2">{achievement.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-rap-silver">{achievement.points} pts</span>
                    {achievement.is_earned ? (
                      <span className="text-rap-gold font-medium">
                        ✓ Earned
                      </span>
                    ) : (
                      showProgress && (
                        <span className="text-rap-silver">
                          {Math.round(achievement.progress_percentage)}%
                        </span>
                      )
                    )}
                  </div>
                  
                  {showProgress && !achievement.is_earned && (
                    <div className="mt-2">
                      <Progress 
                        value={achievement.progress_percentage} 
                        className="h-1.5 bg-gray-800"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-rap-gold/30">
              <th className="text-left py-3 px-4 text-rap-gold font-medium">Achievement</th>
              <th className="text-left py-3 px-4 text-rap-gold font-medium">Description</th>
              <th className="text-center py-3 px-4 text-rap-gold font-medium">Rarity</th>
              <th className="text-center py-3 px-4 text-rap-gold font-medium">Points</th>
              <th className="text-center py-3 px-4 text-rap-gold font-medium">Status</th>
              {showProgress && <th className="text-center py-3 px-4 text-rap-gold font-medium">Progress</th>}
            </tr>
          </thead>
          <tbody>
            {achievements.map((achievement) => {
              const IconComponent = (LucideIcons as any)[achievement.icon] || LucideIcons.Star;
              
              return (
                <tr 
                  key={achievement.id} 
                  className={`border-b border-rap-gold/10 ${achievement.is_earned ? 'opacity-100' : 'opacity-60'}`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded ${rarityColors[achievement.rarity]} flex items-center justify-center shadow-lg`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-rap-platinum">{achievement.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-rap-silver text-sm max-w-xs">
                    {achievement.description}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Badge 
                      variant="secondary" 
                      className={`${rarityColors[achievement.rarity]} text-white text-xs capitalize`}
                    >
                      {achievement.rarity}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-center text-rap-silver font-medium">
                    {achievement.points}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {achievement.is_earned ? (
                      <span className="text-rap-gold font-medium">✓ Earned</span>
                    ) : (
                      <span className="text-rap-silver">Not Earned</span>
                    )}
                  </td>
                  {showProgress && (
                    <td className="py-4 px-4 text-center">
                      {!achievement.is_earned ? (
                        <div className="w-full max-w-20 mx-auto">
                          <Progress 
                            value={achievement.progress_percentage} 
                            className="h-2 bg-gray-800"
                          />
                          <span className="text-xs text-rap-silver mt-1 block">
                            {Math.round(achievement.progress_percentage)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-rap-gold text-sm">100%</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AchievementTable;
