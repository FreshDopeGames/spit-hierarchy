
import { supabase } from '@/integrations/supabase/client';
import { validateVoteInputs, checkRateLimit } from './validation';

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

  // Ensure currentStatus is a valid member_status
  const memberStatus = ['bronze', 'silver', 'gold', 'platinum', 'diamond'].includes(currentStatus) 
    ? currentStatus as MemberStatus 
    : 'bronze' as MemberStatus;

  // Call atomic vote function - handles duplicate check, both inserts, and validation
  const { data, error } = await supabase.rpc('vote_official', {
    p_ranking_id: cleanRankingId,
    p_rapper_id: cleanRapperId,
    p_member_status: memberStatus
  });

  if (error) {
    console.error('Vote submission error:', error);
    
    // Map specific error codes to user-friendly messages
    if (error.message?.includes('ALREADY_VOTED_TODAY')) {
      throw new Error('You have already voted for this rapper today. Come back tomorrow!');
    }
    if (error.message?.includes('INVALID_PARAMS')) {
      throw new Error('Invalid voting parameters. Please refresh and try again.');
    }
    if (error.message?.includes('RAPPER_NOT_FOUND')) {
      throw new Error('Rapper not found. Please refresh and try again.');
    }
    if (error.message?.includes('RANKING_NOT_FOUND')) {
      throw new Error('Ranking not found. Please refresh and try again.');
    }
    if (error.message?.includes('UNAUTHENTICATED')) {
      throw new Error('Please log in to vote.');
    }
    
    throw new Error('Failed to submit vote. Please try again.');
  }

  return data;
};
