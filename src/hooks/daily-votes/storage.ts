
import { DailyVoteRecord, StoredVoteData } from './types';

// Get today's date in YYYY-MM-DD format
export const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Create ranking-specific storage key to prevent contamination
export const getStorageKey = (rankingId: string): string => {
  return `daily_votes_${rankingId}`;
};

// Get stored votes from localStorage for a specific ranking
export const getStoredVotes = (rankingId: string, userId?: string): DailyVoteRecord[] => {
  try {
    const storageKey = getStorageKey(rankingId);
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    
    const data: StoredVoteData = JSON.parse(stored);
    const today = getTodayKey();
    
    // Clear old data if it's from a different day
    if (data.date !== today) {
      localStorage.removeItem(storageKey);
      return [];
    }
    
    // ENHANCED VALIDATION: Triple-check that votes are for the correct ranking
    const validVotes = (data.votes || []).filter((vote: DailyVoteRecord) => {
      const isValidVote = vote.ranking_id === rankingId && 
                         vote.vote_date === today &&
                         vote.user_id === userId; // Extra user validation
      
      if (!isValidVote) {
        console.warn(`Filtering out invalid vote:`, {
          vote,
          expectedRankingId: rankingId,
          expectedDate: today,
          expectedUserId: userId
        });
      }
      
      return isValidVote;
    });
    
    return validVotes;
  } catch {
    return [];
  }
};

// Store votes in localStorage for a specific ranking
export const storeVotes = (rankingId: string, votes: DailyVoteRecord[], userId?: string): void => {
  try {
    const storageKey = getStorageKey(rankingId);
    // Filter votes to ensure they're only for this ranking and today
    const today = getTodayKey();
    const filteredVotes = votes.filter(vote => {
      const isValid = vote.ranking_id === rankingId && 
                     vote.vote_date === today &&
                     vote.user_id === userId;
      
      if (!isValid) {
        console.warn(`Not storing invalid vote:`, {
          vote,
          expectedRankingId: rankingId,
          expectedDate: today,
          expectedUserId: userId
        });
      }
      
      return isValid;
    });
    
    const storeData: StoredVoteData = {
      date: today,
      ranking_id: rankingId,
      user_id: userId || '',
      votes: filteredVotes
    };
    
    localStorage.setItem(storageKey, JSON.stringify(storeData));
  } catch (error) {
    console.error('Failed to store votes in localStorage:', error);
  }
};

// Clean up old localStorage data
export const cleanupOldStorage = (rankingId: string, userId?: string): void => {
  const today = getTodayKey();
  
  if (rankingId) {
    // Clean up ranking-specific old data
    const storageKey = getStorageKey(rankingId);
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.date !== today || data.user_id !== userId) {
          console.log(`Cleaning up old vote data for ranking ${rankingId}`);
          localStorage.removeItem(storageKey);
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
  }

  // Clean up old global storage key that was causing contamination
  const oldGlobalKey = 'daily_votes';
  const oldGlobalData = localStorage.getItem(oldGlobalKey);
  if (oldGlobalData) {
    console.log('Cleaning up old global vote storage that was causing contamination');
    localStorage.removeItem(oldGlobalKey);
  }
};
