
import { supabase } from '@/integrations/supabase/client';
import { DailyVoteRecord } from './types';
import { getTodayKey, storeVotes } from './storage';

export const fetchDailyVotes = async (
  userId: string, 
  rankingId: string
): Promise<DailyVoteRecord[]> => {
  const today = getTodayKey();
  console.log(`Fetching daily votes for ranking ${rankingId} on ${today}`);

  // Check if this is a user ranking
  const { data: userRanking } = await supabase
    .from('user_rankings')
    .select('id')
    .eq('id', rankingId)
    .maybeSingle();

  if (userRanking) {
    // Query user ranking votes from daily_vote_tracking
    console.log(`Fetching user ranking votes for ${rankingId}`);
    const { data: dailyVotes, error: dailyError } = await supabase
      .from('daily_vote_tracking')
      .select('user_id, rapper_id, user_ranking_id, vote_date')
      .eq('user_id', userId)
      .eq('user_ranking_id', rankingId)
      .eq('vote_date', today);

    if (dailyError) {
      console.error('Error fetching user ranking daily votes:', dailyError);
      throw dailyError;
    }

    const votesData = (dailyVotes || []).map(vote => ({
      user_id: vote.user_id,
      rapper_id: vote.rapper_id,
      ranking_id: vote.user_ranking_id || rankingId,
      vote_date: vote.vote_date
    }));

    console.log(`Found ${votesData.length} user ranking votes for ${rankingId}`);
    storeVotes(rankingId, votesData, userId);
    return votesData;
  }

  // Query official ranking votes from ranking_votes table
  console.log(`Fetching official ranking votes for ${rankingId}`);
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
  storeVotes(rankingId, votesData, userId);
  return votesData;
};
