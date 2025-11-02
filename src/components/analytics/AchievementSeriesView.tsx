import React, { useState } from "react";
import { Achievement } from "@/components/analytics/types/achievementTypes";
import { groupAchievementsBySeries } from "@/utils/achievementSeriesUtils";
import AchievementSeriesCard from "@/components/achievements/AchievementSeriesCard";
import AchievementCategorySection from "@/components/achievements/AchievementCategorySection";
import { ThemedTabs, ThemedTabsContent, ThemedTabsList, ThemedTabsTrigger } from "@/components/ui/themed-tabs";
import { groupSeriesByCategory } from "@/utils/achievementCategoryConfig";
import { Flame, Trophy, MessageSquare, ListChecks, Star, Crown } from "lucide-react";

interface AchievementSeriesViewProps {
  achievements: Achievement[];
  showProgress?: boolean;
}

const AchievementSeriesView = ({ achievements, showProgress = true }: AchievementSeriesViewProps) => {
  const seriesGroups = groupAchievementsBySeries(achievements);
  const seriesNames = Object.keys(seriesGroups).filter(name => name !== 'Standalone');
  const standaloneAchievements = seriesGroups['Standalone'] || [];

  const [activeTab, setActiveTab] = useState<string>("all");

  const getSeriesIcon = (seriesName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "Vote Master": <Flame className="w-4 h-4" />,
      "Consistency King": <Trophy className="w-4 h-4" />,
      "Community Voice": <MessageSquare className="w-4 h-4" />,
      "Upvote Champion": <Star className="w-4 h-4" />,
      "Ranking Curator": <ListChecks className="w-4 h-4" />,
      "Rapper Connoisseur": <Crown className="w-4 h-4" />,
    };
    return iconMap[seriesName] || <Star className="w-4 h-4" />;
  };

  const getFilteredSeries = (filterType: string) => {
    switch (filterType) {
      case "completed":
        return seriesNames.filter(name => {
          const series = seriesGroups[name];
          return series.every(a => a.is_earned);
        });
      case "in-progress":
        return seriesNames.filter(name => {
          const series = seriesGroups[name];
          return series.some(a => a.is_earned) && !series.every(a => a.is_earned);
        });
      case "locked":
        return seriesNames.filter(name => {
          const series = seriesGroups[name];
          return series.every(a => !a.is_earned);
        });
      default:
        return seriesNames;
    }
  };

  const renderSeriesContent = (filterType: string) => {
    const filteredNames = getFilteredSeries(filterType);
    
    if (filteredNames.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>No achievement series in this category</p>
        </div>
      );
    }
    
    const groupedByCategory = groupSeriesByCategory(filteredNames);
    
    return (
      <div className="space-y-6">
        {groupedByCategory.map(({ category, seriesNames }) => (
          <AchievementCategorySection
            key={category.name}
            category={category}
            seriesNames={seriesNames}
            seriesGroups={seriesGroups}
            showProgress={showProgress}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <ThemedTabs value={activeTab} onValueChange={setActiveTab}>
        <ThemedTabsList className="grid w-full grid-cols-4">
          <ThemedTabsTrigger value="all">
            All ({seriesNames.length})
          </ThemedTabsTrigger>
          <ThemedTabsTrigger value="completed">
            Completed
          </ThemedTabsTrigger>
          <ThemedTabsTrigger value="in-progress">
            In Progress
          </ThemedTabsTrigger>
          <ThemedTabsTrigger value="locked">
            Locked
          </ThemedTabsTrigger>
        </ThemedTabsList>

        <ThemedTabsContent value="all" className="mt-6">
          {renderSeriesContent('all')}
        </ThemedTabsContent>

        <ThemedTabsContent value="completed" className="mt-6">
          {renderSeriesContent('completed')}
        </ThemedTabsContent>

        <ThemedTabsContent value="in-progress" className="mt-6">
          {renderSeriesContent('in-progress')}
        </ThemedTabsContent>

        <ThemedTabsContent value="locked" className="mt-6">
          {renderSeriesContent('locked')}
        </ThemedTabsContent>
      </ThemedTabs>

      {/* Standalone Achievements */}
      {standaloneAchievements.length > 0 && (
        <AchievementSeriesCard
          seriesName="Special Achievements"
          achievements={standaloneAchievements}
          showProgress={showProgress}
        />
      )}
    </div>
  );
};

export default AchievementSeriesView;
