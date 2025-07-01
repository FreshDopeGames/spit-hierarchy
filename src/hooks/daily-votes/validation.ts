
import { DailyVoteRecord } from './types';
import { getTodayKey } from './storage';

// ENHANCED: Check if user has voted for a specific rapper TODAY in THIS ranking
export const hasVotedForRapper = (
  dailyVotes: DailyVoteRecord[],
  rapperId: string,
  rankingId: string,
  userId: string
): boolean => {
  const today = getTodayKey();
  
  console.log(`🔍 Checking if user ${userId} has voted for rapper ${rapperId} in ranking ${rankingId} today (${today})`);
  console.log(`📊 Total daily votes to check:`, dailyVotes.length);
  
  // Filter votes for debugging
  const todayVotes = dailyVotes.filter(vote => vote.vote_date === today);
  const userVotes = todayVotes.filter(vote => vote.user_id === userId);
  const rankingVotes = userVotes.filter(vote => vote.ranking_id === rankingId);
  
  console.log(`📅 Today's votes (${today}):`, todayVotes.length);
  console.log(`👤 User's votes today:`, userVotes.length);
  console.log(`🎯 User's votes in this ranking today:`, rankingVotes.length);
  
  const hasVoted = dailyVotes.some(vote => {
    const match = vote.rapper_id === rapperId && 
                 vote.ranking_id === rankingId &&
                 vote.vote_date === today &&
                 vote.user_id === userId;
    
    if (match) {
      console.log(`✅ VOTE FOUND: User ${userId} voted for rapper ${rapperId} in ranking ${rankingId} today`);
    }
    
    return match;
  });
  
  console.log(`🎪 Final result for rapper ${rapperId}:`, hasVoted ? 'VOTED' : 'NOT VOTED');
  
  return hasVoted;
};

// Create a new vote record for tracking
export const createVoteRecord = (
  userId: string,
  rapperId: string,
  rankingId: string
): DailyVoteRecord => {
  const voteRecord = {
    user_id: userId,
    rapper_id: rapperId,
    ranking_id: rankingId,
    vote_date: getTodayKey()
  };
  
  console.log(`🆕 Creating vote record:`, voteRecord);
  return voteRecord;
};

// Check if a vote already exists in the array
export const voteExists = (
  votes: DailyVoteRecord[],
  rapperId: string,
  rankingId: string,
  userId: string
): boolean => {
  const today = getTodayKey();
  
  const exists = votes.some(vote => 
    vote.rapper_id === rapperId && 
    vote.ranking_id === rankingId &&
    vote.vote_date === today &&
    vote.user_id === userId
  );
  
  console.log(`🔍 Vote exists check for rapper ${rapperId} in ranking ${rankingId}:`, exists);
  return exists;
};
