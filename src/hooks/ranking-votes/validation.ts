
import { sanitizeInput } from '@/utils/securityUtils';

export const validateVoteInputs = (rankingId: string, rapperId: string, user: any) => {
  // Enhanced security validation
  if (!user) throw new Error('Authentication required');
  
  // Sanitize and validate inputs
  const cleanRankingId = sanitizeInput(rankingId);
  const cleanRapperId = sanitizeInput(rapperId);
  
  if (!cleanRankingId || !cleanRapperId) {
    throw new Error('Invalid input parameters');
  }

  // Additional UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(cleanRankingId) || !uuidRegex.test(cleanRapperId)) {
    throw new Error('Invalid ID format');
  }

  return { cleanRankingId, cleanRapperId };
};

export const checkRateLimit = async (supabase: any, userId: string) => {
  // Enhanced security: Check if user is trying to vote too frequently
  // For daily voting, we check if they've voted for the same rapper today
  const today = new Date().toISOString().split('T')[0];
  
  const { data: todayVotes, error: voteCheckError } = await supabase
    .from('ranking_votes')
    .select('created_at, rapper_id, ranking_id')
    .eq('user_id', userId)
    .eq('vote_date', today)
    .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute check for spam
    .limit(20);

  if (voteCheckError) {
    console.error('Vote check error:', voteCheckError);
  } else if (todayVotes && todayVotes.length >= 10) {
    throw new Error('Too many votes in a short time. Please slow down.');
  }
};

export const checkDailyVoteDuplicate = async (
  supabase: any, 
  userId: string, 
  rapperId: string, 
  rankingId: string
) => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: existingVote, error } = await supabase
    .from('daily_vote_tracking')
    .select('id')
    .eq('user_id', userId)
    .eq('rapper_id', rapperId)
    .eq('ranking_id', rankingId)
    .eq('vote_date', today)
    .maybeSingle();
  
  if (error) {
    console.error('Duplicate vote check error:', error);
    throw new Error('Unable to verify vote status');
  }
  
  if (existingVote) {
    throw new Error('You have already voted for this rapper today. Come back tomorrow!');
  }
};
