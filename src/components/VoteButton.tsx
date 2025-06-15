
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
  const isDisabled = disabled || submitRankingVote.isPending || !user || hasVoted;

  const handleClick = async () => {
    if (isDisabled || !rapperId || !rankingId) return;

    if (showWeightedVoting && user) {
      // Add to daily tracking optimistically
      addVoteToTracking(rapperId);
      
      // Submit the vote
      submitRankingVote.mutate({ rankingId, rapperId });
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
            ? 'bg-gray-600 hover:bg-gray-600 text-gray-300 cursor-not-allowed' 
            : 'bg-rap-gold hover:bg-rap-gold-light text-rap-carbon'
        } font-bold flex-1 sm:flex-none text-sm sm:text-lg px-3 py-2 sm:px-6 sm:py-3 ${className}`}
      >
        {hasVoted ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Voted Today
          </>
        ) : (
          <>
            <ThumbsUp className="w-4 h-4 mr-2" />
            Vote
          </>
        )}
      </Button>
      
      {showWeightedVoting && user && !hasVoted && voteMultiplier > 1 && (
        <div className="flex items-center gap-1 text-xs text-rap-gold font-bold">
          <Star className="w-3 h-3" />
          <span>{voteMultiplier}x power ({currentStatus})</span>
        </div>
      )}
      
      {hasVoted && (
        <div className="text-xs text-gray-400 font-medium">
          Vote again tomorrow
        </div>
      )}
    </div>
  );
};

export default VoteButton;
