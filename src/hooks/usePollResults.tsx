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
      // Fetch aggregated vote counts from the poll_results view (no RLS restriction)
      const [resultsResponse, optionsResponse] = await Promise.all([
        supabase
          .from('poll_results')
          .select('option_id, vote_count')
          .eq('poll_id', pollId),
        supabase
          .from('poll_options')
          .select('id, option_text')
          .eq('poll_id', pollId)
      ]);

      if (resultsResponse.error) throw resultsResponse.error;
      if (optionsResponse.error) throw optionsResponse.error;

      // Build option text lookup
      const optionTextMap = new Map(
        optionsResponse.data.map(opt => [opt.id, opt.option_text])
      );

      // Calculate total votes
      const totalVotes = resultsResponse.data.reduce((sum, r) => sum + (Number(r.vote_count) || 0), 0);

      const results: PollResult[] = resultsResponse.data.map(r => ({
        optionId: r.option_id!,
        optionText: optionTextMap.get(r.option_id!) || '',
        voteCount: Number(r.vote_count) || 0,
        percentage: totalVotes > 0 ? Math.round(((Number(r.vote_count) || 0) / totalVotes) * 100) : 0
      }));

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