
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

// Fallback for network errors or missing RPC (last resort only)
const fallbackOfficialVote = async (
  cleanRankingId: string,
  cleanRapperId: string,
  user: any,
  voteWeight: number,
  memberStatus: MemberStatus
) => {
  console.log('🔄 Using fallback voting path (network issue or RPC missing)');
  const today = new Date().toISOString().split('T')[0];

  const alreadyVoted = await hasOfficialVoteToday(user.id, cleanRankingId, cleanRapperId);
  if (alreadyVoted) {
    throw new Error('ALREADY_VOTED_TODAY');
  }

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

// Map error to user-friendly message
const mapErrorToMessage = (error: any): string => {
  const code = error?.code;
  const details = error?.details || '';
  const message = typeof error?.message === 'string' ? error.message : '';

  // Database constraint violations
  if (code === '23505' || details.includes('unique_official_daily_vote')) {
    return 'You have already voted for this rapper today. Come back tomorrow!';
  }
  
  // Invalid UUID syntax
  if (code === '22P02' || message.includes('invalid input syntax for type uuid')) {
    return 'Invalid voting parameters. Please refresh and try again.';
  }
  
  // Authentication errors
  if (code === '42501' || message.includes('UNAUTHENTICATED')) {
    return 'Please log in to vote.';
  }
  
  // Application-level errors from RPC
  if (message.includes('ALREADY_VOTED_TODAY')) {
    return 'ALREADY_VOTED_TODAY';
  }
  if (message.includes('INVALID_PARAMS')) {
    return 'Invalid voting parameters. Please refresh and try again.';
  }
  if (message.includes('RAPPER_NOT_FOUND')) {
    return 'Rapper not found. Please refresh and try again.';
  }
  if (message.includes('RANKING_NOT_FOUND')) {
    return 'Ranking not found. Please refresh and try again.';
  }
  
  // Network/connection errors
  if (message.toLowerCase().includes('fetch') || message.toLowerCase().includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Log unexpected errors for diagnostics
  console.warn('Vote failed', { path: 'official', code, details: details?.slice?.(0, 200) });
  
  return 'Failed to submit vote. Please try again.';
};

export const submitVote = async (
  rankingId: string,
  rapperId: string,
  user: any,
  voteWeight: number,
  currentStatus: string
) => {
  console.log('🚀 [submitVote] Starting vote submission', {
    rankingId,
    rapperId,
    userId: user?.id,
    voteWeight,
    currentStatus,
    timestamp: new Date().toISOString()
  });

  const { cleanRankingId, cleanRapperId } = validateVoteInputs(rankingId, rapperId, user);
  
  console.log('✓ [submitVote] Input validation passed', { cleanRankingId, cleanRapperId });
  
  // Final guard: ensure IDs are valid UUIDs before sending to Supabase
  if (!cleanRankingId || !cleanRapperId || !UUID_REGEX.test(cleanRankingId) || !UUID_REGEX.test(cleanRapperId)) {
    console.error('❌ [submitVote] Invalid UUID detected', { cleanRankingId, cleanRapperId });
    throw new Error('Invalid voting parameters. Please refresh and try again.');
  }
  
  // Ensure currentStatus is a valid member_status
  const memberStatus = ['bronze', 'silver', 'gold', 'platinum', 'diamond'].includes(currentStatus) 
    ? currentStatus as MemberStatus 
    : 'bronze' as MemberStatus;
  
  console.log('✓ [submitVote] Member status validated', { memberStatus });

  let hasRetried = false;

  const attemptVote = async (): Promise<any> => {
    try {
      // Primary path: Call atomic vote function via RPC
      console.log('🎯 [attemptVote] Calling RPC vote_official...', { 
        p_ranking_id: cleanRankingId, 
        p_rapper_id: cleanRapperId, 
        p_member_status: memberStatus,
        timestamp: new Date().toISOString()
      });
      
      const { data, error } = await supabase.rpc('vote_official', {
        p_ranking_id: cleanRankingId,
        p_rapper_id: cleanRapperId,
        p_member_status: memberStatus
      });
      
      console.log('📡 [attemptVote] RPC response received', { 
        hasData: !!data, 
        hasError: !!error,
        data: data ? JSON.stringify(data).substring(0, 200) : null,
        errorCode: error?.code,
        errorMessage: error?.message?.substring(0, 200)
      });

      if (error) {
        console.error('❌ [attemptVote] RPC vote_official error:', { 
          path: 'official', 
          code: error.code, 
          details: error.details?.slice?.(0, 200),
          message: error.message?.slice?.(0, 200),
          hint: error.hint
        });
        
        const errorMessage = mapErrorToMessage(error);
        
        // Only use fallback when RPC function is unavailable/missing or network error
        const message = typeof error.message === 'string' ? error.message : '';
        if ((message.toLowerCase().includes('function') && message.toLowerCase().includes('not found')) ||
            message.toLowerCase().includes('fetch') || message.toLowerCase().includes('network')) {
          console.warn('⚠️ [attemptVote] Using fallback (RPC missing or network error)', error);
          return await fallbackOfficialVote(cleanRankingId, cleanRapperId, user, voteWeight, memberStatus);
        }
        
        console.error('❌ [attemptVote] Throwing error:', errorMessage);
        throw new Error(errorMessage);
      }

      // Handle JSON success payload from updated RPC
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        console.log('✓ [attemptVote] RPC returned object data', { data });
        
        const result = data as { 
          success?: boolean; 
          reason?: string; 
          message?: string; 
          ranking_id?: string;
          sqlstate?: string;
        };
        
        if (result.success === false) {
          // RPC returned a controlled error
          console.error('❌ [attemptVote] RPC returned failure:', result);
          
          if (result.reason === 'ALREADY_VOTED_TODAY') {
            console.error('❌ [attemptVote] User already voted today');
            throw new Error('ALREADY_VOTED_TODAY');
          }
          
          // Show detailed error for debugging unexpected DB errors
          if (result.reason === 'UNEXPECTED_ERROR') {
            const detailedMsg = `Database error (${result.sqlstate}): ${result.message}`;
            console.error('❌ [attemptVote] Unexpected DB error:', detailedMsg);
            throw new Error(result.message || 'Failed to submit vote');
          }
          
          console.error('❌ [attemptVote] Throwing RPC failure message:', result.message);
          throw new Error(result.message || 'Failed to submit vote');
        }
        
        // Success - return with ranking_id
        console.log('✅ [attemptVote] RPC vote successful!', result);
        return { ranking_id: result.ranking_id || cleanRankingId };
      }

      // Legacy format support
      console.log('✅ [attemptVote] RPC vote successful (legacy format)');
      return { ranking_id: cleanRankingId };
    } catch (error: any) {
      console.error('❌ [attemptVote] Caught error:', {
        error,
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hasRetried
      });
      
      // Handle "ALREADY_VOTED_TODAY" from RPC or unique constraint violation
      if (error?.message?.includes('ALREADY_VOTED_TODAY') || error?.code === '23505') {
        console.log('🔍 [attemptVote] Checking for orphan tracking...');
        
        // If we haven't retried yet, check if tracking is orphaned
        if (!hasRetried) {
          hasRetried = true;
          const actualVoteExists = await hasOfficialVoteToday(user.id, cleanRankingId, cleanRapperId);
          
          console.log('🔍 [attemptVote] Actual vote check:', { actualVoteExists });
          
          if (!actualVoteExists) {
            // Orphaned tracking record
            console.log('🧹 [attemptVote] Orphan tracking detected, cleaning up...');
            await deleteOrphanTracking(user.id, cleanRankingId, cleanRapperId);
            console.log('🔄 [attemptVote] Retrying after cleaning orphan tracking');
            return attemptVote();
          } else {
            console.log('✓ [attemptVote] Actual vote exists, genuine duplicate');
          }
        }
        console.error('❌ [attemptVote] User already voted today (verified)');
        throw new Error('You have already voted for this rapper today. Come back tomorrow!');
      }
      
      // Pass through already-friendly messages
      if (error.message?.includes('Invalid voting') ||
          error.message?.includes('Please log in') ||
          error.message?.includes('not found') ||
          error.message?.includes('Network error')) {
        console.error('❌ [attemptVote] Re-throwing friendly error');
        throw error;
      }
      
      console.error('❌ [attemptVote] Unknown error, throwing generic message');
      throw new Error('Failed to submit vote. Please try again.');
    }
  };

  console.log('🎬 [submitVote] Calling attemptVote()...');
  const result = await attemptVote();
  console.log('✅ [submitVote] Vote submission completed successfully!', result);
  return result;
};
