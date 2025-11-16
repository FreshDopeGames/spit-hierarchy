
import { supabase } from '@/integrations/supabase/client';
import { validateVoteInputs, checkRateLimit } from './validation';

type MemberStatus = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

// Strict UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Fallback client-side vote function with duplicate gating
const fallbackOfficialVote = async (
  cleanRankingId: string,
  cleanRapperId: string,
  user: any,
  voteWeight: number,
  memberStatus: MemberStatus
) => {
  console.log('🔄 Using fallback voting path');
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD UTC

  // First gate: check/insert into daily_vote_tracking with duplicate protection
  const { error: trackingError } = await supabase
    .from('daily_vote_tracking')
    .insert({
      user_id: user.id,
      ranking_id: cleanRankingId,
      user_ranking_id: null,
      rapper_id: cleanRapperId,
      vote_date: today
    });

  // If duplicate key, user already voted
  if (trackingError) {
    if (trackingError.code === '23505') {
      console.log('❌ Fallback: duplicate vote detected');
      throw new Error('ALREADY_VOTED_TODAY');
    }
    console.error('Fallback tracking error:', trackingError);
    if (trackingError.code === '42501') {
      throw new Error('UNAUTHENTICATED');
    }
    throw new Error('Failed to submit vote. Please try again.');
  }

  // Gate passed, insert the actual vote
  const { data, error: voteError } = await supabase
    .from('ranking_votes')
    .insert({
      user_id: user.id,
      ranking_id: cleanRankingId,
      rapper_id: cleanRapperId,
      vote_weight: voteWeight,
      member_status: memberStatus,
      vote_date: today
    })
    .select('ranking_id')
    .single();

  if (voteError) {
    console.error('Fallback vote error:', voteError);
    if (voteError.code === '42501') {
      throw new Error('UNAUTHENTICATED');
    }
    if (voteError.code === '23505') {
      throw new Error('ALREADY_VOTED_TODAY');
    }
    throw new Error('Failed to submit vote. Please try again.');
  }

  console.log('✅ Fallback vote successful');
  return data;
};

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

  try {
    // Primary path: Call atomic vote function via RPC
    console.log('🎯 Submitting official vote via RPC', { cleanRankingId, cleanRapperId, memberStatus });
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
      
      // Unknown RPC error - fall back to client-side voting
      console.warn('⚠️ RPC failed with unknown error, attempting fallback', error);
      return await fallbackOfficialVote(cleanRankingId, cleanRapperId, user, voteWeight, memberStatus);
    }

    console.log('✅ RPC vote successful');
    return data;
  } catch (error: any) {
    // If it's one of our known errors, rethrow it
    if (error.message?.includes('already voted') || 
        error.message?.includes('Invalid voting') ||
        error.message?.includes('Please log in') ||
        error.message?.includes('not found')) {
      throw error;
    }

    // Unknown error - try fallback
    console.warn('⚠️ Caught error during vote, attempting fallback', error);
    try {
      return await fallbackOfficialVote(cleanRankingId, cleanRapperId, user, voteWeight, memberStatus);
    } catch (fallbackError: any) {
      // Map fallback errors to user-friendly messages
      if (fallbackError.message === 'ALREADY_VOTED_TODAY') {
        throw new Error('You have already voted for this rapper today. Come back tomorrow!');
      }
      if (fallbackError.message === 'UNAUTHENTICATED') {
        throw new Error('Please log in to vote.');
      }
      throw new Error('Failed to submit vote. Please try again.');
    }
  }
};
