
import React from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AchievementCard from "@/components/achievements/AchievementCard";
import { Award, Trophy, Target } from "lucide-react";

const UserAchievements = () => {
  const { achievements, isLoading, getEarnedAchievements, getTotalPoints } = useAchievements();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 sm:h-32 bg-carbon-fiber/40 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 sm:h-24 bg-carbon-fiber/40 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const earnedAchievements = getEarnedAchievements();
  const recentAchievements = earnedAchievements
    .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-2xl mb-3 sm:mb-4 text-rap-gold font-extrabold">
        Your Achievements
      </h3>
      
      {/* Achievement Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-black/40 border-2 border-rap-gold">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm sm:text-lg font-extrabold">Earned</p>
                <p className="text-white font-bold text-base sm:text-lg">{earnedAchievements.length}</p>
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
                <p className="text-white font-bold text-base sm:text-lg">{achievements.length}</p>
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
                <p className="text-white font-bold text-base sm:text-lg">{getTotalPoints()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card className="bg-black/40 border-2 border-rap-gold">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {recentAchievements.map((achievement) => (
                <AchievementCard 
                  key={achievement.achievement_id} 
                  achievement={achievement} 
                  showProgress={false}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {earnedAchievements.length === 0 && (
        <Card className="bg-black/40 border-2 border-rap-gold">
          <CardContent className="p-4 sm:p-6 text-center">
            <Award className="w-12 h-12 sm:w-16 sm:h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Achievements Yet</h3>
            <p className="text-gray-400 text-sm sm:text-base px-4">
              Start voting and engaging with the community to unlock your first achievements!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserAchievements;
