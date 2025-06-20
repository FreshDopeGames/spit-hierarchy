
import { Tables } from "@/integrations/supabase/types";

export type OfficialRanking = Tables<"official_rankings">;
export type RankingItem = Tables<"ranking_items"> & {
  rapper: Tables<"rappers">;
};

export interface RankingWithItems extends OfficialRanking {
  items: RankingItem[];
}

export interface TransformedRanking {
  id: string;
  title: string;
  description: string;
  author: string;
  timeAgo: string;
  rappers: Array<{
    rank: number;
    name: string;
    reason: string;
  }>;
  likes: number;
  views: number;
  isOfficial: boolean;
  tags: string[];
  slug?: string;
  comments: number;
  authorId?: string;
  createdAt?: string;
  category?: string;
  isPublic?: boolean;
}
