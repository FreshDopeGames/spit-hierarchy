
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock, Target } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  threshold_value: number;
  progress_value: number;
  progress_percentage: number;
  is_earned: boolean;
  earned_at: string | null;
  rarity: string;
}

interface AchievementTableProps {
  achievements: Achievement[];
  showProgress?: boolean;
}

const AchievementTable = ({ achievements, showProgress = true }: AchievementTableProps) => {
  const getStatusBadge = (achievement: Achievement) => {
    if (achievement.is_earned) {
      return (
        <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
          <Trophy className="w-3 h-3 mr-1" />
          Earned
        </Badge>
      );
    }
    
    if (achievement.progress_percentage > 0) {
      return (
        <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
          <Target className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/30">
        <Lock className="w-3 h-3 mr-1" />
        Locked
      </Badge>
    );
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-yellow-400';
      case 'epic':
        return 'text-purple-400';
      case 'rare':
        return 'text-blue-400';
      case 'uncommon':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="border border-rap-gold/30 rounded-lg overflow-hidden bg-carbon-fiber/90">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-rap-gold/30 hover:bg-rap-carbon/50">
            <TableHead className="text-rap-gold font-bold w-12"></TableHead>
            <TableHead className="text-rap-gold font-bold">Achievement</TableHead>
            <TableHead className="text-rap-gold font-bold">Description</TableHead>
            {showProgress && <TableHead className="text-rap-gold font-bold">Progress</TableHead>}
            <TableHead className="text-rap-gold font-bold text-center">Points</TableHead>
            <TableHead className="text-rap-gold font-bold text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {achievements.map((achievement) => (
            <TableRow 
              key={achievement.id} 
              className="border-b border-rap-gold/20 hover:bg-rap-carbon/30 transition-colors"
            >
              <TableCell>
                <div className="text-2xl">{achievement.icon}</div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-semibold text-white">{achievement.name}</div>
                  <div className={`text-xs font-medium capitalize ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-gray-300 text-sm max-w-xs">
                  {achievement.description}
                </div>
              </TableCell>
              {showProgress && (
                <TableCell>
                  <div className="space-y-2 min-w-32">
                    <Progress 
                      value={achievement.progress_percentage} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-400">
                      {achievement.progress_value} / {achievement.threshold_value || 0}
                    </div>
                  </div>
                </TableCell>
              )}
              <TableCell className="text-center">
                <Badge variant="outline" className="text-rap-gold border-rap-gold/30">
                  {achievement.points}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(achievement)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AchievementTable;
