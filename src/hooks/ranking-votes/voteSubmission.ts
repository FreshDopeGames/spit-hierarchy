
import { supabase } from '@/integrations/supabase/client';
import { validateVoteInputs, checkRateLimit, checkDailyVoteDuplicate } from './validation';

type MemberStatus = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export const submitVote = async (
  rankingId: string,
  rapperId: string,
  user: any,
  voteWeight: number,
  currentStatus: string
) => {
  const { cleanRankingId, cleanRapperId } = validateVoteInputs(rankingId, rapperId, user);
  
  await checkRateLimit(supabase, user.id);
  
  // Check if user already voted for this rapper today
  await checkDailyVoteDuplicate(supabase, user.id, cleanRapperId, cleanRankingId);

  // Ensure currentStatus is a valid member_status
  const memberStatus = ['bronze', 'silver', 'gold', 'platinum', 'diamond'].includes(currentStatus) 
    ? currentStatus as MemberStatus 
    : 'bronze' as MemberStatus;

  // Insert a new ranking vote (no longer using upsert for cumulative daily voting)
  const { data: voteData, error: voteError } = await supabase
    .from('ranking_votes')
    .insert({
      user_id: user.id,
      ranking_id: cleanRankingId,
      rapper_id: cleanRapperId,
      vote_weight: voteWeight,
      member_status: memberStatus,
      vote_date: new Date().toISOString().split('T')[0], // Store as date only
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (voteError) {
    console.error('Vote submission error:', voteError);
    throw new Error('Failed to submit vote. Please try again.');
  }

  // Insert into daily vote tracking (duplicate already checked)
  const { error: dailyError } = await supabase
    .from('daily_vote_tracking')
    .insert({
      user_id: user.id,
      ranking_id: cleanRankingId,
      user_ranking_id: null,
      rapper_id: cleanRapperId,
      vote_date: new Date().toISOString().split('T')[0]
    });

  if (dailyError) {
    console.error('Daily tracking error:', dailyError);
    // Don't throw here as the main vote succeeded
  }

  return voteData;
};
