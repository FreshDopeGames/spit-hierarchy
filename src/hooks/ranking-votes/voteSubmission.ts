
import { supabase } from '@/integrations/supabase/client';
import { validateVoteInputs, checkRateLimit } from './validation';

type MemberStatus = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

// Strict UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const submitVote = async (
  rankingId: string,
  rapperId: string,
  user: any,
  voteWeight: number,
  currentStatus: string
) => {
  const { cleanRankingId, cleanRapperId } = validateVoteInputs(rankingId, rapperId, user);
  
  // Final guard: ensure IDs are valid UUIDs before sending to Supabase
  if (!cleanRankingId || !cleanRapperId || !UUID_REGEX.test(cleanRankingId) || !UUID_REGEX.test(cleanRapperId)) {
    console.error('Invalid UUID detected', { cleanRankingId, cleanRapperId });
    throw new Error('Invalid voting parameters. Please refresh and try again.');
  }
  
  await checkRateLimit(supabase, user.id);

  // Ensure currentStatus is a valid member_status
  const memberStatus = ['bronze', 'silver', 'gold', 'platinum', 'diamond'].includes(currentStatus) 
    ? currentStatus as MemberStatus 
    : 'bronze' as MemberStatus;

  // Call atomic vote function - handles duplicate check, both inserts, and validation
  console.log('Submitting official vote via RPC', { cleanRankingId, cleanRapperId, memberStatus });
  const { data, error } = await supabase.rpc('vote_official', {
    p_ranking_id: cleanRankingId,
    p_rapper_id: cleanRapperId,
    p_member_status: memberStatus
  });
  console.log('RPC vote_official response', { data, error });

  if (error) {
    console.error('Vote submission error:', error);
    
    // Map specific error codes to user-friendly messages
    const message = (typeof error.message === 'string') ? error.message : '';
    
    // Check for invalid UUID syntax error
    if (message.toLowerCase().includes('invalid input syntax for type uuid')) {
      throw new Error('Invalid voting parameters. Please refresh and try again.');
    }
    if (message.includes('ALREADY_VOTED_TODAY')) {
      throw new Error('You have already voted for this rapper today. Come back tomorrow!');
    }
    if (message.includes('INVALID_PARAMS')) {
      throw new Error('Invalid voting parameters. Please refresh and try again.');
    }
    if (message.includes('RAPPER_NOT_FOUND')) {
      throw new Error('Rapper not found. Please refresh and try again.');
    }
    if (message.includes('RANKING_NOT_FOUND')) {
      throw new Error('Ranking not found. Please refresh and try again.');
    }
    if (message.includes('UNAUTHENTICATED')) {
      throw new Error('Please log in to vote.');
    }
    if (message.toLowerCase().includes('function') && message.toLowerCase().includes('not found')) {
      throw new Error('Voting service updating. Please refresh and try again in a moment.');
    }
    
    throw new Error('Failed to submit vote. Please try again.');
  }

  return data;
};
