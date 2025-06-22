
import { Button } from "@/components/ui/button";
import { ThumbsUp, Star, Check } from "lucide-react";
import { useRankingVotes } from "@/hooks/useRankingVotes";
import { useAuth } from "@/hooks/useAuth";
import { useDailyVoteStatus } from "@/hooks/useDailyVoteStatus";

interface VoteButtonProps {
  onVote: () => void;
  disabled?: boolean;
  className?: string;
  rankingId?: string;
  rapperId?: string;
  showWeightedVoting?: boolean;
}

const VoteButton = ({ 
  onVote, 
  disabled = false, 
  className = "",
  rankingId,
  rapperId,
  showWeightedVoting = false
}: VoteButtonProps) => {
  const { user } = useAuth();
  const { submitRankingVote, getVoteMultiplier, currentStatus } = useRankingVotes();
  const { hasVotedToday, addVoteToTracking } = useDailyVoteStatus(rankingId);

  const hasVoted = rapperId ? hasVotedToday(rapperId) : false;
  const isDisabled = disabled || submitRankingVote.isPending || !user;

  const handleClick = async () => {
    if (isDisabled || !rapperId || !rankingId) return;

    if (showWeightedVoting && user) {
      // Check if user has already voted today
      if (hasVoted) {
        // Still allow the vote (it will update the existing vote)
        submitRankingVote.mutate({ rankingId, rapperId });
      } else {
        // Add to daily tracking optimistically for new votes only
        addVoteToTracking(rapperId);
        
        // Submit the vote
        submitRankingVote.mutate({ rankingId, rapperId });
      }
    } else {
      // Use regular vote handler
      onVote();
    }
  };

  const voteMultiplier = getVoteMultiplier();

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        onClick={handleClick}
        disabled={isDisabled}
        size="sm"
        className={`${
          hasVoted 
            ? 'bg-gray-600 hover:bg-gray-600 text-gray-300' 
            : 'bg-rap-gold hover:bg-rap-gold-light text-rap-carbon'
        } font-bold flex-1 sm:flex-none text-sm px-3 py-2 sm:px-5 sm:py-2 min-w-[110px] ${className}`}
      >
        {hasVoted ? (
          <>
            <ThumbsUp className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Voted</span>
            <span className="sm:hidden">✓</span>
          </>
        ) : (
          <>
            <ThumbsUp className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Vote</span>
            <span className="sm:hidden">+</span>
          </>
        )}
      </Button>
      
      {showWeightedVoting && user && voteMultiplier > 1 && (
        <div className="flex items-center gap-1 text-xs text-rap-gold font-bold">
          <Star className="w-3 h-3" />
          <span>{voteMultiplier}x power ({currentStatus})</span>
        </div>
      )}
      
      {hasVoted && (
        <div className="text-xs text-gray-400 font-medium">
          {hasVoted ? 'Click to update vote' : 'Vote again tomorrow'}
        </div>
      )}
    </div>
  );
};

export default VoteButton;
