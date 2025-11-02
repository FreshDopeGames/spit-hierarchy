import React from "react";
import { Achievement } from "@/components/analytics/types/achievementTypes";
import { SeriesCategory } from "@/utils/achievementCategoryConfig";
import AchievementSeriesCard from "./AchievementSeriesCard";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";

interface AchievementCategorySectionProps {
  category: SeriesCategory;
  seriesNames: string[];
  seriesGroups: Record<string, Achievement[]>;
  showProgress: boolean;
}

const AchievementCategorySection = ({
  category,
  seriesNames,
  seriesGroups,
  showProgress
}: AchievementCategorySectionProps) => {
  const Icon = category.icon;

  return (
    <div className="space-y-4">
      <ThemedCard>
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            <span>{category.name}</span>
            <span className="text-sm font-normal text-muted-foreground ml-auto">
              {seriesNames.length} {seriesNames.length === 1 ? 'series' : 'series'}
            </span>
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
          <div className="space-y-4">
            {seriesNames.map((seriesName) => (
              <AchievementSeriesCard
                key={seriesName}
                seriesName={seriesName}
                achievements={seriesGroups[seriesName]}
                showProgress={showProgress}
              />
            ))}
          </div>
        </ThemedCardContent>
      </ThemedCard>
    </div>
  );
};

export default AchievementCategorySection;
