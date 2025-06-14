
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, Award } from "lucide-react";
import { AchievementStats } from "./types/achievementTypes";

interface AchievementStatsCardsProps {
  stats: AchievementStats;
}

const AchievementStatsCards = ({ stats }: AchievementStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <Card className="bg-black/40 border-2 border-rap-gold">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm sm:text-lg font-extrabold">Earned</p>
              <p className="text-white font-bold text-base sm:text-lg">{stats.earnedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 border-2 border-rap-gold">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm sm:text-lg font-extrabold">Total</p>
              <p className="text-white font-bold text-base sm:text-lg">{stats.totalCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 border-2 border-rap-gold">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm sm:text-lg font-extrabold">Points</p>
              <p className="text-white font-bold text-base sm:text-lg">{stats.totalPoints}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementStatsCards;
