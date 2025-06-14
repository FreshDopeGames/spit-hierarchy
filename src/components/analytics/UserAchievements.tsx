
import React from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AchievementCard from "@/components/achievements/AchievementCard";
import { Award, Trophy, Target, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserAchievements = () => {
  const { achievements, isLoading, getEarnedAchievements, getUnlockedAchievements, getTotalPoints } = useAchievements();

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
  const unlockedAchievements = getUnlockedAchievements();
  const recentAchievements = earnedAchievements
    .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
    .slice(0, 6);

  // Categorize achievements by type
  const categorizeAchievements = (achievementsList: any[]) => {
    return achievementsList.reduce((acc, achievement) => {
      const type = achievement.type || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(achievement);
      return acc;
    }, {} as Record<string, any[]>);
  };

  const earnedByCategory = categorizeAchievements(earnedAchievements);
  const unlockedByCategory = categorizeAchievements(unlockedAchievements);

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

      {/* Achievement Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-carbon-fiber border border-rap-gold/30">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum text-xs sm:text-sm"
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="earned" 
            className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum text-xs sm:text-sm"
          >
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Earned
          </TabsTrigger>
          <TabsTrigger 
            value="progress" 
            className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum text-xs sm:text-sm"
          >
            <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            In Progress
          </TabsTrigger>
          <TabsTrigger 
            value="locked" 
            className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon text-rap-platinum text-xs sm:text-sm"
          >
            <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Locked
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 sm:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {achievements.map((achievement) => (
              <AchievementCard 
                key={achievement.achievement_id} 
                achievement={achievement} 
                showProgress={true}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="earned" className="mt-4 sm:mt-6">
          {earnedAchievements.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {earnedAchievements.map((achievement) => (
                <AchievementCard 
                  key={achievement.achievement_id} 
                  achievement={achievement} 
                  showProgress={false}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-black/40 border-2 border-rap-gold">
              <CardContent className="p-4 sm:p-6 text-center">
                <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-rap-gold/50 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Achievements Yet</h3>
                <p className="text-gray-400 text-sm sm:text-base px-4">
                  Start voting and engaging with the community to unlock your first achievements!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="mt-4 sm:mt-6">
          {unlockedAchievements.filter(a => a.progress_percentage > 0).length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {unlockedAchievements
                .filter(a => a.progress_percentage > 0)
                .sort((a, b) => b.progress_percentage - a.progress_percentage)
                .map((achievement) => (
                  <AchievementCard 
                    key={achievement.achievement_id} 
                    achievement={achievement} 
                    showProgress={true}
                  />
                ))}
            </div>
          ) : (
            <Card className="bg-black/40 border-2 border-rap-gold">
              <CardContent className="p-4 sm:p-6 text-center">
                <Target className="w-12 h-12 sm:w-16 sm:h-16 text-rap-gold/50 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Progress Yet</h3>
                <p className="text-gray-400 text-sm sm:text-base px-4">
                  Start engaging with the platform to make progress toward achievements!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="locked" className="mt-4 sm:mt-6">
          {unlockedAchievements.filter(a => a.progress_percentage === 0).length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {unlockedAchievements
                .filter(a => a.progress_percentage === 0)
                .sort((a, b) => a.threshold_value - b.threshold_value)
                .map((achievement) => (
                  <AchievementCard 
                    key={achievement.achievement_id} 
                    achievement={achievement} 
                    showProgress={true}
                  />
                ))}
            </div>
          ) : (
            <Card className="bg-black/40 border-2 border-rap-gold">
              <CardContent className="p-4 sm:p-6 text-center">
                <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-rap-gold/50 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">All Achievements Started!</h3>
                <p className="text-gray-400 text-sm sm:text-base px-4">
                  You've made progress on all available achievements. Keep going!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserAchievements;
