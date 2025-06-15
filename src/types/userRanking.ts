
export interface UserRanking {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  createdAt: string;
  timeAgo: string;
  rappers: Array<{
    rank: number;
    name: string;
    reason: string;
  }>;
  likes: number;
  comments: number;
  views: number;
  isPublic: boolean;
  isOfficial: boolean;
  tags: string[];
  slug?: string;
}

export interface UserRankingFromDB {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string;
  is_public: boolean;
  slug: string | null;
  profiles?: {
    username: string;
    full_name?: string;
  } | null;
  user_ranking_items: Array<{
    position: number;
    reason: string | null;
    rapper: {
      name: string;
    } | null;
  }>;
  user_ranking_tag_assignments: Array<{
    ranking_tags: {
      name: string;
    } | null;
  }>;
}

export interface CreateUserRankingData {
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  isPublic?: boolean;
}
