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
  rappers: {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    average_rating: number;
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
          rappers!votes_rapper_id_fkey (
            id,
            name,
            slug,
            image_url,
            average_rating
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50); // Get more to ensure we have unique rappers

      if (error) throw error;

      // Group by rapper and get most recent vote per rapper
      const uniqueRappers = new Map<string, AttributeVoteHistory>();
      (data as AttributeVoteHistory[]).forEach((vote) => {
        if (!uniqueRappers.has(vote.rapper_id)) {
          uniqueRappers.set(vote.rapper_id, vote);
        }
      });

      return Array.from(uniqueRappers.values()).slice(0, 15);
    },
    enabled: !!user,
  });

  return {
    rankingVotes: rankingVotes || [],
    attributeVotes: attributeVotes || [],
    isLoading: rankingVotesLoading || attributeVotesLoading,
  };
};
