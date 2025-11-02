import { Target, MessageSquare, Users, Compass, Trophy } from "lucide-react";
import { Achievement } from "@/components/analytics/types/achievementTypes";

export interface SeriesCategory {
  name: string;
  icon: typeof Target;
  description: string;
  order: number;
}

export const SERIES_CATEGORIES: Record<string, SeriesCategory> = {
  "milestones": {
    name: "Milestones",
    icon: Trophy,
    description: "Major account and platform milestones",
    order: 1
  },
  "discovery": {
    name: "Discovery & Exploration",
    icon: Compass,
    description: "Explore and discover new rappers and pages",
    order: 2
  },
  "engagement": {
    name: "Engagement & Activity",
    icon: Target,
    description: "Track your voting patterns and activity",
    order: 3
  }
};

export const SERIES_TO_CATEGORY_MAP: Record<string, string> = {
  "Account Milestone": "milestones",
  "Discovery": "discovery",
  "Exploration": "discovery",
  "Vote Master": "engagement",
  "Consistency King": "engagement",
  "Upvote Champion": "engagement",
  "Top Five": "engagement",
  "Community Voice": "engagement",
  "Rapper Connoisseur": "engagement",
  "Ranking Curator": "engagement"
};

export const getCategoryForSeries = (seriesName: string): string => {
  return SERIES_TO_CATEGORY_MAP[seriesName] || "other";
};

export interface GroupedSeriesData {
  category: SeriesCategory;
  seriesNames: string[];
}

export const groupSeriesByCategory = (
  seriesNames: string[]
): GroupedSeriesData[] => {
  const grouped = new Map<string, string[]>();

  seriesNames.forEach(seriesName => {
    const categoryKey = getCategoryForSeries(seriesName);
    if (!grouped.has(categoryKey)) {
      grouped.set(categoryKey, []);
    }
    grouped.get(categoryKey)!.push(seriesName);
  });

  const result: GroupedSeriesData[] = [];
  grouped.forEach((names, categoryKey) => {
    const category = SERIES_CATEGORIES[categoryKey];
    if (category) {
      result.push({ category, seriesNames: names });
    }
  });

  return result.sort((a, b) => a.category.order - b.category.order);
};
