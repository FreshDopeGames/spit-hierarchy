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
      const { data, error } = await supabase
        .from('poll_votes')
        .select(`
          option_id,
          poll_options (
            option_text
          )
        `)
        .eq('poll_id', pollId);

      if (error) throw error;

      // Group votes by option
      const voteCounts = data.reduce((acc, vote) => {
        const optionId = vote.option_id;
        const optionText = vote.poll_options?.option_text || '';
        
        if (!acc[optionId]) {
          acc[optionId] = {
            optionId,
            optionText,
            voteCount: 0
          };
        }
        acc[optionId].voteCount++;
        return acc;
      }, {} as Record<string, { optionId: string; optionText: string; voteCount: number }>);

      // Calculate total votes and percentages
      const totalVotes = data.length;
      const results: PollResult[] = Object.values(voteCounts).map(option => ({
        ...option,
        percentage: totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0
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