
export interface MemberStats {
  total_votes: number;
  status: string;
  consecutive_voting_days: number;
}

export interface PublicProfile {
  id: string;
  username: string;
  full_name: string | null;
  created_at: string;
  member_stats: MemberStats | null;
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
