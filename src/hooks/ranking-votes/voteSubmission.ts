
import { supabase } from '@/integrations/supabase/client';
import { validateVoteInputs, checkRateLimit } from './validation';

type MemberStatus = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

// Strict UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Helper: Check if user has already voted today for this rapper in this ranking
const hasOfficialVoteToday = async (
  userId: string,
  rankingId: string,
  rapperId: string
): Promise<boolean> => {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('ranking_votes')
    .select('id')
    .eq('user_id', userId)
    .eq('ranking_id', rankingId)
    .eq('rapper_id', rapperId)
    .eq('vote_date', today)
    .maybeSingle();
  return !!data;
};

// Helper: Delete orphaned tracking record (tracking exists but no actual vote)
const deleteOrphanTracking = async (
  userId: string,
  rankingId: string,
  rapperId: string
): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  await supabase
    .from('daily_vote_tracking')
    .delete()
    .eq('user_id', userId)
    .eq('ranking_id', rankingId)
    .eq('rapper_id', rapperId)
    .eq('vote_date', today);
  console.log('🧹 Cleaned up orphan tracking record');
};

// Fallback client-side vote function (vote first, tracking second to avoid orphans)
const fallbackOfficialVote = async (
  cleanRankingId: string,
  cleanRapperId: string,
  user: any,
  voteWeight: number,
  memberStatus: MemberStatus
) => {
  console.log('🔄 Using fallback voting path');
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD UTC

  // Check if vote already exists
  const alreadyVoted = await hasOfficialVoteToday(user.id, cleanRankingId, cleanRapperId);
  if (alreadyVoted) {
    console.log('❌ Fallback: duplicate vote detected in ranking_votes');
    throw new Error('ALREADY_VOTED_TODAY');
  }

  // Insert the actual vote FIRST (to avoid orphans)
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

  // Best-effort insert into daily_vote_tracking (ignore errors)
  try {
    await supabase
      .from('daily_vote_tracking')
      .insert({
        user_id: user.id,
        ranking_id: cleanRankingId,
        user_ranking_id: null,
        rapper_id: cleanRapperId,
        vote_date: today
      });
  } catch (trackingError) {
    // Tracking is best-effort only, don't fail the vote
    console.warn('⚠️ Tracking insert failed (non-critical):', trackingError);
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

  let hasRetried = false;

  const attemptVote = async (): Promise<any> => {
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
          throw new Error('ALREADY_VOTED_TODAY');
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
        
        // Only use fallback when RPC function is unavailable/missing
        if (message.toLowerCase().includes('function') && message.toLowerCase().includes('not found')) {
          console.warn('⚠️ RPC function not found, using fallback', error);
          return await fallbackOfficialVote(cleanRankingId, cleanRapperId, user, voteWeight, memberStatus);
        }
        
        // For all other errors, don't use fallback
        throw new Error('Failed to submit vote. Please try again.');
      }

      console.log('✅ RPC vote successful');
      return data;
    } catch (error: any) {
      // Self-heal: If "already voted" but no actual vote exists, clean up and retry once
      if (error.message === 'ALREADY_VOTED_TODAY' && !hasRetried) {
        const actuallyVoted = await hasOfficialVoteToday(user.id, cleanRankingId, cleanRapperId);
        if (!actuallyVoted) {
          console.log('🔧 Detected orphan tracking, cleaning up and retrying');
          await deleteOrphanTracking(user.id, cleanRankingId, cleanRapperId);
          hasRetried = true;
          return await attemptVote();
        }
        throw new Error('You have already voted for this rapper today. Come back tomorrow!');
      }

      // Map other known errors
      if (error.message === 'ALREADY_VOTED_TODAY') {
        throw new Error('You have already voted for this rapper today. Come back tomorrow!');
      }
      if (error.message === 'UNAUTHENTICATED') {
        throw new Error('Please log in to vote.');
      }
      if (error.message?.includes('Invalid voting') ||
          error.message?.includes('Please log in') ||
          error.message?.includes('not found')) {
        throw error;
      }

      throw new Error('Failed to submit vote. Please try again.');
    }
  };

  return await attemptVote();
};
