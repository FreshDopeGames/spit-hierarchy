
import React from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AchievementCard from "@/components/achievements/AchievementCard";
import { Award, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ProfileAchievements = () => {
  const { getEarnedAchievements, getTotalPoints, isLoading } = useAchievements();

  if (isLoading) {
    return (
      <Card className="bg-carbon-fiber/90 border border-rap-gold/30 rounded-lg shadow-lg shadow-rap-gold/20">
        <CardHeader>
          <CardTitle className="text-rap-gold font-merienda flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-rap-carbon/50 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-rap-carbon/50 rounded" />
              <div className="h-20 bg-rap-carbon/50 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const earnedAchievements = getEarnedAchievements();
  const recentAchievements = earnedAchievements.slice(0, 4);

  return (
    <Card className="bg-carbon-fiber/90 border border-rap-gold/30 rounded-lg shadow-lg shadow-rap-gold/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-rap-gold font-merienda flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-rap-silver text-sm">Total Points</div>
              <div className="text-rap-gold font-bold">{getTotalPoints()}</div>
            </div>
            <Link to="/analytics">
              <Button 
                variant="outline" 
                size="sm"
                className="border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-carbon"
              >
                View All
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {recentAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentAchievements.map((achievement) => (
              <AchievementCard 
                key={achievement.achievement_id} 
                achievement={achievement} 
                showProgress={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-rap-gold/50 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-rap-silver mb-2">No Achievements Yet</h3>
            <p className="text-rap-platinum text-sm">
              Start voting and engaging to earn your first achievements!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileAchievements;
