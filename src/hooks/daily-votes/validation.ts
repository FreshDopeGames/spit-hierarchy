
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
  const hasVoted = dailyVotes.some(vote => {
    const match = vote.rapper_id === rapperId && 
                 vote.ranking_id === rankingId &&
                 vote.vote_date === today &&
                 vote.user_id === userId; // Triple validation
    
    if (match) {
      console.log(`User ${userId} has voted for rapper ${rapperId} in ranking ${rankingId} today`);
    }
    
    return match;
  });
  
  return hasVoted;
};

// Create a new vote record for tracking
export const createVoteRecord = (
  userId: string,
  rapperId: string,
  rankingId: string
): DailyVoteRecord => {
  return {
    user_id: userId,
    rapper_id: rapperId,
    ranking_id: rankingId,
    vote_date: getTodayKey()
  };
};

// Check if a vote already exists in the array
export const voteExists = (
  votes: DailyVoteRecord[],
  rapperId: string,
  rankingId: string,
  userId: string
): boolean => {
  const today = getTodayKey();
  
  return votes.some(vote => 
    vote.rapper_id === rapperId && 
    vote.ranking_id === rankingId &&
    vote.vote_date === today &&
    vote.user_id === userId
  );
};
