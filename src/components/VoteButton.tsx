import { Button } from "@/components/ui/button";
import { ThumbsUp, Star, Check, Clock } from "lucide-react";
import { useRankingVotes } from "@/hooks/useRankingVotes";
import { useAuth } from "@/hooks/useAuth";
import { useDailyVoteStatus } from "@/hooks/useDailyVoteStatus";
import { toast } from "sonner";

interface VoteButtonProps {
  onVote: () => void;
  disabled?: boolean;
  className?: string;
  rankingId?: string;
  rapperId?: string;
  showWeightedVoting?: boolean;
  isPending?: boolean;
  isTopFive?: boolean;
}

const VoteButton = ({ 
  onVote, 
  disabled = false, 
  className = "",
  rankingId,
  rapperId,
  showWeightedVoting = false,
  isPending = false,
  isTopFive = false
}: VoteButtonProps) => {
  const { user } = useAuth();
  const { submitRankingVote, getVoteMultiplier, currentStatus } = useRankingVotes();
  const { hasVotedToday, addVoteToTracking } = useDailyVoteStatus(rankingId);

  const hasVoted = rapperId ? hasVotedToday(rapperId) : false;
  const isDisabled = disabled || submitRankingVote.isPending || !user;
  const voteMultiplier = getVoteMultiplier();

  const handleClick = async () => {
    if (isDisabled || !rapperId || !rankingId) {
      if (!user) {
        toast.error("Please sign in to vote for rappers.");
      }
      return;
    }

    if (showWeightedVoting && user) {
      // Security check - validate inputs
      if (!rankingId.match(/^[a-f0-9-]{36}$/i) || !rapperId.match(/^[a-f0-9-]{36}$/i)) {
        toast.error("Invalid voting parameters");
        return;
      }

      try {
        // Add to daily tracking for new votes only
        if (!hasVoted) {
          addVoteToTracking(rapperId);
        }
        
        // Submit the vote with enhanced error handling
        await submitRankingVote.mutateAsync({ rankingId, rapperId });
      } catch (error) {
        console.error('Vote submission error:', error);
        // Error toast is handled by the mutation
      }
    } else {
      // Fallback for non-weighted voting
      onVote();
    }
  };

  const getButtonSizing = () => {
    if (isTopFive) {
      return "text-sm px-3 py-2 sm:px-5 sm:py-2 min-w-[110px]";
    }
    // For 6+ rankings on mobile: 20% shorter height for better proportions
    return "text-xs px-2 py-0.5 sm:px-3 sm:py-1 min-w-[55px] sm:min-w-[110px]";
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      size="sm"
      className={`${
        hasVoted 
          ? 'bg-gray-600 hover:bg-gray-600 text-gray-300' 
          : isPending
            ? 'bg-yellow-600 hover:bg-yellow-600 text-white'
            : 'bg-rap-gold hover:bg-rap-gold-light text-rap-carbon'
      } font-bold flex-1 sm:flex-none ${getButtonSizing()} transition-all duration-200 ${className}`}
    >
      {isPending ? (
        <>
          <Clock className="w-4 h-4 mr-1 animate-spin" />
          <span className="hidden sm:inline">Processing</span>
          <span className="sm:hidden">...</span>
        </>
      ) : hasVoted ? (
        <>
          <Check className="w-4 h-4 mr-1" />
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
  );
};

export default VoteButton;
