
import { supabase } from '@/integrations/supabase/client';
import { validateVoteInputs, checkRateLimit } from './validation';

export const submitVote = async (
  rankingId: string,
  rapperId: string,
  user: any,
  voteWeight: number,
  currentStatus: string
) => {
  const { cleanRankingId, cleanRapperId } = validateVoteInputs(rankingId, rapperId, user);
  
  await checkRateLimit(supabase, user.id);

  // Insert the ranking vote with proper error handling
  const { data: voteData, error: voteError } = await supabase
    .from('ranking_votes')
    .upsert({
      user_id: user.id,
      ranking_id: cleanRankingId,
      rapper_id: cleanRapperId,
      vote_weight: voteWeight,
      member_status: currentStatus,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,ranking_id,rapper_id'
    })
    .select()
    .single();

  if (voteError) {
    console.error('Vote submission error:', voteError);
    throw new Error('Failed to submit vote. Please try again.');
  }

  // Also insert into daily vote tracking with error handling
  const { error: dailyError } = await supabase
    .from('daily_vote_tracking')
    .upsert({
      user_id: user.id,
      ranking_id: cleanRankingId,
      rapper_id: cleanRapperId,
      vote_date: new Date().toISOString().split('T')[0]
    }, {
      onConflict: 'user_id,rapper_id,ranking_id,vote_date'
    });

  if (dailyError) {
    console.error('Daily tracking error:', dailyError);
    // Don't throw here as the main vote succeeded
  }

  return voteData;
};
