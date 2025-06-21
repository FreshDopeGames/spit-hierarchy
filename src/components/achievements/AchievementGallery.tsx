
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AchievementCard from "./AchievementCard";
import { Award, Trophy, Users, Heart, Calendar, Star } from "lucide-react";
import { sortAchievementsByRarity } from "@/utils/achievementUtils";

const AchievementGallery = () => {
  const { user } = useAuth();

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_achievement_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Sort achievements from least rare to most rare
      return sortAchievementsByRarity(data || []);
    },
    enabled: !!user
  });

  const { data: stats } = useQuery({
    queryKey: ['achievement-stats', user?.id],
    queryFn: async () => {
      if (!user || !achievements) return null;
      
      const earned = achievements.filter(a => a.is_earned);
      const totalPoints = earned.reduce((sum, a) => sum + a.points, 0);
      
      return {
        total: achievements.length,
        earned: earned.length,
        points: totalPoints
      };
    },
    enabled: !!user && !!achievements
  });

  if (!user) {
    return (
      <div className="text-center py-8">
        <Award className="w-16 h-16 text-rap-gold mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Sign In to View Achievements</h3>
        <p className="text-rap-platinum">Track your progress and unlock rewards!</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-rap-carbon/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const categorizeAchievements = () => {
    if (!achievements) return {};
    
    const categorized: Record<string, any[]> = achievements.reduce((acc, achievement) => {
      const type = achievement.type || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(achievement);
      return acc;
    }, {} as Record<string, any[]>);

    // Sort each category from least rare to most rare
    Object.keys(categorized).forEach(type => {
      categorized[type] = sortAchievementsByRarity(categorized[type]);
    });

    return categorized;
  };

  const categorized = categorizeAchievements();
  const typeIcons = {
    voting: Trophy,
    engagement: Users,
    community: Heart,
    time_based: Calendar,
    quality: Star,
    special: Award
  };

  // Transform achievement data to match AchievementCard expectations
  const transformAchievement = (achievement: any) => ({
    id: achievement.achievement_id || achievement.id,
    name: achievement.name,
    description: achievement.description,
    icon: achievement.icon,
    rarity: achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary',
    points: achievement.points,
    is_earned: achievement.is_earned,
    progress_percentage: achievement.progress_percentage,
    earned_at: achievement.earned_at || undefined
  });

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-rap-carbon/90 border border-rap-gold/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-rap-gold">{stats.earned}</div>
            <div className="text-sm text-rap-platinum">Earned</div>
          </div>
          <div className="bg-rap-carbon/90 border border-rap-gold/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-rap-silver">{stats.total}</div>
            <div className="text-sm text-rap-platinum">Total</div>
          </div>
          <div className="bg-rap-carbon/90 border border-rap-gold/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-rap-forest">{stats.points}</div>
            <div className="text-sm text-rap-platinum">Points</div>
          </div>
        </div>
      )}

      {/* Achievement Categories */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 bg-rap-carbon border border-rap-gold/30">
          <TabsTrigger value="all" className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon">
            All
          </TabsTrigger>
          {Object.entries(typeIcons).map(([type, Icon]) => (
            <TabsTrigger 
              key={type} 
              value={type}
              className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon flex items-center gap-1"
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline capitalize">{type}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements?.map((achievement) => (
              <AchievementCard 
                key={achievement.achievement_id} 
                achievement={transformAchievement(achievement)} 
              />
            ))}
          </div>
        </TabsContent>

        {Object.entries(categorized).map(([type, typeAchievements]) => (
          <TabsContent key={type} value={type} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeAchievements.map((achievement) => (
                <AchievementCard 
                  key={achievement.achievement_id} 
                  achievement={transformAchievement(achievement)} 
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AchievementGallery;
