import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const ITEMS_PER_PAGE = 20;

export interface PaginatedRankingVoteHistory {
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

export interface PaginatedAttributeVoteHistory {
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

export const usePaginatedVotingHistory = (
  type: 'ranking' | 'attribute',
  page: number = 1
) => {
  const { user } = useAuth();
  const offset = (page - 1) * ITEMS_PER_PAGE;

  // Fetch paginated ranking votes
  const rankingVotesQuery = useQuery({
    queryKey: ['paginated-ranking-votes', user?.id, page],
    queryFn: async () => {
      const { data, error, count } = await supabase
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
        `, { count: 'exact' })
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) throw error;
      
      return {
        data: data as PaginatedRankingVoteHistory[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
      };
    },
    enabled: !!user && type === 'ranking',
  });

  // Fetch all attribute votes and paginate in memory (due to grouping logic)
  const attributeVotesQuery = useQuery({
    queryKey: ['paginated-attribute-votes', user?.id, page],
    queryFn: async () => {
      // Fetch all votes in batches to avoid the 1000-row default limit
      let allData: any[] = [];
      let from = 0;
      const batchSize = 1000;
      while (true) {
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
          .order('created_at', { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) throw error;
        allData = allData.concat(data || []);
        if (!data || data.length < batchSize) break;
        from += batchSize;
      }

      const data = allData;


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
      const allResults: PaginatedAttributeVoteHistory[] = Array.from(rapperVotes.entries()).map(([rapper_id, data]) => {
        const userAvgRating = data.votes.length > 0 
          ? data.votes.reduce((sum, v) => sum + (v.rating || 0), 0) / data.votes.length
          : 0;
        return {
          rapper_id,
          created_at: data.latestDate,
          user_avg_rating: isNaN(userAvgRating) ? 0 : Math.round(userAvgRating * 10) / 10,
          vote_count: data.votes.length,
          rappers: data.votes[0]?.rappers || { id: '', name: 'Unknown', slug: '', image_url: null }
        };
      });

      // Sort by most recent
      const sortedResults = allResults.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Paginate
      const totalCount = sortedResults.length;
      const paginatedResults = sortedResults.slice(offset, offset + ITEMS_PER_PAGE);

      return {
        data: paginatedResults,
        totalCount,
        totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE)
      };
    },
    enabled: !!user && type === 'attribute',
  });

  return type === 'ranking' ? rankingVotesQuery : attributeVotesQuery;
};
