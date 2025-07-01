
import { supabase } from '@/integrations/supabase/client';
import { DailyVoteRecord } from './types';
import { getTodayKey, storeVotes } from './storage';

export const fetchDailyVotes = async (
  userId: string, 
  rankingId: string
): Promise<DailyVoteRecord[]> => {
  const today = getTodayKey();
  console.log(`Fetching daily votes for ranking ${rankingId} on ${today}`);

  // Check ranking_votes table for today's votes (primary source)
  const { data: rankingVotes, error: rankingError } = await supabase
    .from('ranking_votes')
    .select('user_id, rapper_id, ranking_id, vote_date')
    .eq('user_id', userId)
    .eq('ranking_id', rankingId)
    .eq('vote_date', today);

  if (rankingError) {
    console.error('Error fetching ranking votes:', rankingError);
    throw rankingError;
  }

  // Transform to match the expected format with STRICT validation
  const votesData = rankingVotes
    .filter(vote => {
      const isValid = vote.user_id === userId &&
                     vote.ranking_id === rankingId &&
                     vote.vote_date === today;
      
      if (!isValid) {
        console.error(`Database returned invalid vote:`, {
          vote,
          expectedUserId: userId,
          expectedRankingId: rankingId,
          expectedDate: today
        });
      }
      
      return isValid;
    })
    .map(vote => ({
      user_id: vote.user_id,
      rapper_id: vote.rapper_id,
      ranking_id: vote.ranking_id,
      vote_date: vote.vote_date
    }));
  
  console.log(`Found ${votesData.length} votes for ranking ${rankingId}`);
  
  // Store in localStorage for caching - ranking-specific
  storeVotes(rankingId, votesData, userId);
  
  return votesData;
};
