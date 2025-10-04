import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RankingVoteHistory {
  id: string;
  created_at: string;
  rapper_id: string;
  ranking_id: string;
  rappers: {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
  };
  official_rankings: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface AttributeVoteHistory {
  rapper_id: string;
  created_at: string;
  user_avg_rating: number;
  vote_count: number;
  rappers: {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
  };
}

export const useVotingHistory = () => {
  const { user } = useAuth();

  // Fetch ranking votes
  const { data: rankingVotes, isLoading: rankingVotesLoading } = useQuery({
    queryKey: ['ranking-votes-history', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ranking_votes')
        .select(`
          id,
          created_at,
          rapper_id,
          ranking_id,
          rappers!ranking_votes_rapper_id_fkey (
            id,
            name,
            slug,
            image_url
          ),
          official_rankings!ranking_votes_ranking_id_fkey (
            id,
            title,
            slug
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) throw error;
      return data as RankingVoteHistory[];
    },
    enabled: !!user,
  });

  // Fetch attribute votes (grouped by rapper, most recent per rapper)
  const { data: attributeVotes, isLoading: attributeVotesLoading } = useQuery({
    queryKey: ['attribute-votes-history', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          rapper_id,
          created_at,
          rating,
          rappers!votes_rapper_id_fkey (
            id,
            name,
            slug,
            image_url
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by rapper and calculate user's average rating
      const rapperVotes = new Map<string, { votes: any[]; latestDate: string }>();
      
      data.forEach((vote: any) => {
        if (!rapperVotes.has(vote.rapper_id)) {
          rapperVotes.set(vote.rapper_id, { votes: [], latestDate: vote.created_at });
        }
        const rapperData = rapperVotes.get(vote.rapper_id)!;
        rapperData.votes.push(vote);
        if (vote.created_at > rapperData.latestDate) {
          rapperData.latestDate = vote.created_at;
        }
      });

      // Calculate averages and format results
      const results: AttributeVoteHistory[] = Array.from(rapperVotes.entries()).map(([rapper_id, data]) => {
        const userAvgRating = data.votes.reduce((sum, v) => sum + v.rating, 0) / data.votes.length;
        return {
          rapper_id,
          created_at: data.latestDate,
          user_avg_rating: Math.round(userAvgRating * 10) / 10,
          vote_count: data.votes.length,
          rappers: data.votes[0].rappers
        };
      });

      // Sort by most recent and limit to 15
      return results
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 15);
    },
    enabled: !!user,
  });

  return {
    rankingVotes: rankingVotes || [],
    attributeVotes: attributeVotes || [],
    isLoading: rankingVotesLoading || attributeVotesLoading,
  };
};
