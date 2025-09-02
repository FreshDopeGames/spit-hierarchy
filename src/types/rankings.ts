
import { Tables } from "@/integrations/supabase/types";

export type OfficialRanking = Tables<"official_rankings">;
export type RankingItem = Tables<"ranking_items"> & {
  rapper: Tables<"rappers">;
};

export interface RankingWithItems extends OfficialRanking {
  items: RankingItem[];
}

// Unified ranking interface that works for both official and user rankings
export interface UnifiedRanking {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string; // Always required to ensure consistency
  timeAgo: string;
  createdAt: string; // Always required
  rappers: Array<{
    rank: number;
    name: string;
    reason: string;
    id: string;
    image_url?: string;
  }>;
  likes: number;
  views: number;
  totalVotes: number; // Add totalVotes field
  isOfficial: boolean;
  tags: string[];
  slug: string; // Always required
  comments: number;
  category: string; // Always required
  isPublic: boolean; // Always required
}

// Legacy interface for backwards compatibility - will be phased out
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
