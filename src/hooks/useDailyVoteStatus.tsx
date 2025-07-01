
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface DailyVoteRecord {
  user_id: string;
  rapper_id: string;
  ranking_id: string;
  vote_date: string;
}

export const useDailyVoteStatus = (rankingId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get today's date in YYYY-MM-DD format
  const getTodayKey = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Create ranking-specific storage key to prevent contamination
  const getStorageKey = (rankingId: string) => {
    return `daily_votes_${rankingId}`;
  };

  // Get stored votes from localStorage for a specific ranking
  const getStoredVotes = (rankingId: string): DailyVoteRecord[] => {
    try {
      const storageKey = getStorageKey(rankingId);
      const stored = localStorage.getItem(storageKey);
      if (!stored) return [];
      
      const data = JSON.parse(stored);
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
                           vote.user_id === user?.id; // Extra user validation
        
        if (!isValidVote) {
          console.warn(`Filtering out invalid vote:`, {
            vote,
            expectedRankingId: rankingId,
            expectedDate: today,
            expectedUserId: user?.id
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
  const storeVotes = (rankingId: string, votes: DailyVoteRecord[]) => {
    try {
      const storageKey = getStorageKey(rankingId);
      // Filter votes to ensure they're only for this ranking and today
      const today = getTodayKey();
      const filteredVotes = votes.filter(vote => {
        const isValid = vote.ranking_id === rankingId && 
                       vote.vote_date === today &&
                       vote.user_id === user?.id;
        
        if (!isValid) {
          console.warn(`Not storing invalid vote:`, {
            vote,
            expectedRankingId: rankingId,
            expectedDate: today,
            expectedUserId: user?.id
          });
        }
        
        return isValid;
      });
      
      localStorage.setItem(storageKey, JSON.stringify({
        date: today,
        ranking_id: rankingId,
        user_id: user?.id, // Store user ID for additional validation
        votes: filteredVotes
      }));
    } catch (error) {
      console.error('Failed to store votes in localStorage:', error);
    }
  };

  // Fetch today's votes from database - check both tables for today's votes
  const { data: dailyVotes = [], isLoading } = useQuery({
    queryKey: ['daily-votes', user?.id, getTodayKey(), rankingId],
    queryFn: async () => {
      if (!user || !rankingId) return [];

      const today = getTodayKey();
      console.log(`Fetching daily votes for ranking ${rankingId} on ${today}`);

      // Check ranking_votes table for today's votes (primary source)
      const { data: rankingVotes, error: rankingError } = await supabase
        .from('ranking_votes')
        .select('user_id, rapper_id, ranking_id, vote_date')
        .eq('user_id', user.id)
        .eq('ranking_id', rankingId)
        .eq('vote_date', today);

      if (rankingError) {
        console.error('Error fetching ranking votes:', rankingError);
        throw rankingError;
      }

      // Transform to match the expected format with STRICT validation
      const votesData = rankingVotes
        .filter(vote => {
          const isValid = vote.user_id === user.id &&
                         vote.ranking_id === rankingId &&
                         vote.vote_date === today;
          
          if (!isValid) {
            console.error(`Database returned invalid vote:`, {
              vote,
              expectedUserId: user.id,
              expectedRankingId: rankingId,
              expectedDate: today
            });
          }
          
          return isValid;
        })
        .map(vote => ({
          user_id: vote.user_id,
          rapper_id: vote.rapper_id,
          ranking_id: vote.ranking_id,
          vote_date: vote.vote_date
        }));
      
      console.log(`Found ${votesData.length} votes for ranking ${rankingId}`);
      
      // Store in localStorage for caching - ranking-specific
      storeVotes(rankingId, votesData);
      
      return votesData;
    },
    enabled: !!user && !!rankingId,
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for daily voting
    initialData: rankingId ? getStoredVotes(rankingId) : [],
  });

  // ENHANCED: Check if user has voted for a specific rapper TODAY in THIS ranking
  const hasVotedToday = (rapperId: string): boolean => {
    if (!user || !rankingId) return false;
    
    const today = getTodayKey();
    const hasVoted = dailyVotes.some(vote => {
      const match = vote.rapper_id === rapperId && 
                   vote.ranking_id === rankingId &&
                   vote.vote_date === today &&
                   vote.user_id === user.id; // Triple validation
      
      if (match) {
        console.log(`User ${user.id} has voted for rapper ${rapperId} in ranking ${rankingId} today`);
      }
      
      return match;
    });
    
    return hasVoted;
  };

  // ENHANCED: Add a vote to today's tracking for a SPECIFIC rapper in THIS ranking
  const addVoteToTracking = (rapperId: string) => {
    if (!user || !rankingId) return;

    const today = getTodayKey();
    console.log(`Adding vote tracking for rapper ${rapperId} in ranking ${rankingId}`);
    
    const newVote: DailyVoteRecord = {
      user_id: user.id,
      rapper_id: rapperId,
      ranking_id: rankingId,
      vote_date: today
    };

    // Update query cache optimistically - ONLY for this specific query
    queryClient.setQueryData<DailyVoteRecord[]>(
      ['daily-votes', user.id, today, rankingId],
      (oldData = []) => {
        // Only add if not already present for this rapper in this ranking
        const existingVote = oldData.find(vote => 
          vote.rapper_id === rapperId && 
          vote.ranking_id === rankingId &&
          vote.vote_date === today &&
          vote.user_id === user.id
        );
        
        if (existingVote) {
          console.log(`Vote already tracked for rapper ${rapperId} in ranking ${rankingId}`);
          return oldData;
        }
        
        console.log(`Adding new vote to cache for rapper ${rapperId} in ranking ${rankingId}`);
        return [...oldData, newVote];
      }
    );

    // Update localStorage with the new vote - ranking-specific
    const currentStored = getStoredVotes(rankingId);
    const existingVote = currentStored.find(vote => 
      vote.rapper_id === rapperId && 
      vote.ranking_id === rankingId &&
      vote.vote_date === today &&
      vote.user_id === user.id
    );
    
    if (!existingVote) {
      const updatedVotes = [...currentStored, newVote];
      storeVotes(rankingId, updatedVotes);
      console.log(`Updated localStorage for ranking ${rankingId} with new vote`);
    }
  };

  // Clean up old localStorage data on mount and migrate from old global format
  useEffect(() => {
    const today = getTodayKey();
    
    if (rankingId) {
      // Clean up ranking-specific old data
      const storageKey = getStorageKey(rankingId);
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.date !== today || data.user_id !== user?.id) {
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
  }, [rankingId, user?.id]);

  return {
    hasVotedToday,
    addVoteToTracking,
    isLoading
  };
};
