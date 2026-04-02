import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";

interface PollResult {
  optionId: string;
  optionText: string;
  voteCount: number;
  percentage: number;
}

interface UserVote {
  optionId: string;
}

export const usePollResults = (pollId: string) => {
  return useQuery({
    queryKey: ['poll-results', pollId],
    queryFn: async () => {
      // Fetch aggregated vote counts and option text in parallel
      const [resultsResponse, optionsResponse] = await Promise.all([
        supabase
          .from('poll_results')
          .select('option_id, vote_count')
          .eq('poll_id', pollId),
        supabase
          .from('poll_options')
          .select('id, option_text, option_order')
          .eq('poll_id', pollId)
          .order('option_order', { ascending: true })
      ]);

      if (resultsResponse.error) throw resultsResponse.error;
      if (optionsResponse.error) throw optionsResponse.error;

      // Build vote count lookup from the view
      const voteCountMap = new Map(
        resultsResponse.data.map(r => [r.option_id, Number(r.vote_count) || 0])
      );

      // Calculate total votes
      const totalVotes = resultsResponse.data.reduce((sum, r) => sum + (Number(r.vote_count) || 0), 0);

      // Build results from all options (sorted by option_order), showing all with their tallies
      const results: PollResult[] = optionsResponse.data.map(opt => {
        const voteCount = voteCountMap.get(opt.id) || 0;
        return {
          optionId: opt.id,
          optionText: opt.option_text,
          voteCount,
          percentage: totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
        };
      });

      return { results, totalVotes };
    },
    enabled: !!pollId
  });
};

export const useUserPollVotes = (pollId: string) => {
  const { user } = useSecureAuth();

  return useQuery({
    queryKey: ['poll-votes', pollId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('poll_votes')
        .select('option_id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      return data.map(vote => ({ optionId: vote.option_id })) as UserVote[];
    },
    enabled: !!user && !!pollId
  });
};