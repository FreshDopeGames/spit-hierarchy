
import { Button } from "@/components/ui/button";
import { ThumbsUp, Star } from "lucide-react";
import { useRankingVotes } from "@/hooks/useRankingVotes";
import { useAuth } from "@/hooks/useAuth";

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

  const handleClick = () => {
    if (showWeightedVoting && rankingId && rapperId && user) {
      // Use weighted ranking vote
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
        disabled={disabled || submitRankingVote.isPending}
        size="sm"
        className={`bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-bold flex-1 sm:flex-none text-sm sm:text-lg px-3 py-2 sm:px-6 sm:py-3 ${className}`}
      >
        <ThumbsUp className="w-4 h-4 mr-2" />
        Vote
      </Button>
      
      {showWeightedVoting && user && voteMultiplier > 1 && (
        <div className="flex items-center gap-1 text-xs text-rap-gold font-bold">
          <Star className="w-3 h-3" />
          <span>{voteMultiplier}x power ({currentStatus})</span>
        </div>
      )}
    </div>
  );
};

export default VoteButton;
