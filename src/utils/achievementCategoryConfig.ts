import { Target, MessageSquare, Users, Compass, Trophy } from "lucide-react";
import { Achievement } from "@/components/analytics/types/achievementTypes";

export interface SeriesCategory {
  name: string;
  icon: typeof Target;
  description: string;
  order: number;
}

export const SERIES_CATEGORIES: Record<string, SeriesCategory> = {
  "engagement": {
    name: "Engagement & Activity",
    icon: Target,
    description: "Track your voting patterns and activity",
    order: 1
  },
  "content": {
    name: "Content Creation",
    icon: MessageSquare,
    description: "Achievements for creating content",
    order: 2
  },
  "community": {
    name: "Community Building",
    icon: Users,
    description: "Build connections and help others",
    order: 3
  },
  "discovery": {
    name: "Discovery & Exploration",
    icon: Compass,
    description: "Explore and discover new rappers",
    order: 4
  },
  "milestones": {
    name: "Milestones",
    icon: Trophy,
    description: "Major account and platform milestones",
    order: 5
  }
};

export const SERIES_TO_CATEGORY_MAP: Record<string, string> = {
  "Vote Master": "engagement",
  "Consistency King": "engagement",
  "Upvote Champion": "engagement",
  "Community Voice": "content",
  "Ranking Curator": "content",
  "Rapper Connoisseur": "content",
  "Top Five": "content",
  "Community Builder": "community",
  "Detailed Critic": "community",
  "Discovery": "discovery",
  "Account Milestone": "milestones"
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
