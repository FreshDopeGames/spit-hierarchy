
export interface MemberStats {
  total_votes: number;
  status: string;
  consecutive_voting_days: number;
  total_comments: number;
  ranking_lists_created: number;
  top_five_created: number;
  // Public profile stats
  rappers_ranked?: number;
  rappers_rated?: number;
  bars_upvotes?: number;
  vs_match_votes?: number;
  total_achievements?: number;
}

export interface PublicProfile {
  id: string;
  username: string;
  created_at: string;
  member_stats: MemberStats;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface SimpleRanking {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  slug: string;
}

export interface SimpleRankingItem {
  position: number;
  reason: string | null;
  rapper_name: string;
}

export interface RankingWithItems extends SimpleRanking {
  items: SimpleRankingItem[];
}
