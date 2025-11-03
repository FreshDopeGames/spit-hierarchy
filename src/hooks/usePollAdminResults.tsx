import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PollOption {
  id: string;
  option_text: string;
  votes?: number;
  percentage?: number;
}

interface PollAdminResults {
  pollDetails: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    status: string;
    created_at: string;
    expires_at?: string;
    is_featured: boolean;
    allow_write_in: boolean;
  };
  results: PollOption[];
  totalVotes: number;
  uniqueVoters: number;
  topOption?: PollOption;
  writeInResponses?: Array<{ text: string; count: number }>;
}

export const usePollAdminResults = (pollId: string | null) => {
  return useQuery({
    queryKey: ['pollAdminResults', pollId],
    queryFn: async (): Promise<PollAdminResults | null> => {
      if (!pollId) return null;

      // Fetch poll details
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;

      // Fetch poll options
      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollId)
        .order('option_text');

      if (optionsError) throw optionsError;

      // Fetch votes
      const { data: votesData, error: votesError } = await supabase
        .from('poll_votes')
        .select('option_id, user_id')
        .eq('poll_id', pollId);

      if (votesError) throw votesError;

      // Calculate vote counts and percentages
      const voteCounts = votesData.reduce((acc, vote) => {
        acc[vote.option_id] = (acc[vote.option_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalVotes = votesData.length;
      const uniqueVoters = new Set(votesData.map(v => v.user_id)).size;

      const results = optionsData.map(option => ({
        id: option.id,
        option_text: option.option_text,
        votes: voteCounts[option.id] || 0,
        percentage: totalVotes > 0 ? ((voteCounts[option.id] || 0) / totalVotes) * 100 : 0
      }));

      // Sort by votes descending to find top option
      const sortedResults = [...results].sort((a, b) => (b.votes || 0) - (a.votes || 0));
      const topOption = sortedResults[0];

      // Fetch write-in responses if allowed
      let writeInResponses: Array<{ text: string; count: number }> = [];
      if (pollData.allow_write_in) {
        // Write-in options are stored as regular options with is_write_in flag
        const writeInOptions = optionsData.filter((opt: any) => opt.is_write_in);
        const writeInVotes = writeInOptions.map(opt => ({
          text: opt.option_text,
          count: voteCounts[opt.id] || 0
        })).filter(item => item.count > 0);
        
        if (writeInVotes.length > 0) {
          writeInResponses = writeInVotes.sort((a, b) => b.count - a.count);
        }
      }

      return {
        pollDetails: {
          id: pollData.id,
          title: pollData.title,
          description: pollData.description,
          type: pollData.type,
          status: pollData.status,
          created_at: pollData.created_at,
          expires_at: pollData.expires_at,
          is_featured: pollData.is_featured,
          allow_write_in: pollData.allow_write_in
        },
        results,
        totalVotes,
        uniqueVoters,
        topOption,
        writeInResponses: writeInResponses.length > 0 ? writeInResponses : undefined
      };
    },
    enabled: !!pollId
  });
};
