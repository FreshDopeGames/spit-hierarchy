
import { ThemedButton } from "@/components/ui/themed-button";
import { ThumbsUp, Star, Check, Clock, Plus } from "lucide-react";
import { useRankingVotes } from "@/hooks/useRankingVotes";
import { useAuth } from "@/hooks/useAuth";
import { useDailyVoteStatus } from "@/hooks/useDailyVoteStatus";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();

  // Only check if this specific rapper has been voted for today
  const hasVoted = rapperId ? hasVotedToday(rapperId) : false;
  const isDisabled = disabled || submitRankingVote.isPending || !user || hasVoted;
  const voteMultiplier = getVoteMultiplier();

  // Enhanced debug logging removed for production

  const handleClick = async () => {
    if (isDisabled || !rapperId || !rankingId) {
      if (!user) {
        toast.error("Please sign in to vote for rappers.");
      } else if (hasVoted) {
        toast.error("You've already voted for this rapper today. Come back tomorrow!");
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
        // Vote submission started
        
        // Add to daily tracking for optimistic updates - only for this specific rapper
        addVoteToTracking(rapperId);
        
        // Submit the vote with enhanced error handling
        await submitRankingVote.mutateAsync({ rankingId, rapperId });
        
        // Vote submission completed
      } catch (error) {
        console.error(`❌ Vote submission error for rapper ${rapperId}:`, error);
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

  const getButtonColor = () => {
    if (hasVoted) {
      return 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-[var(--theme-textLight)] border border-green-500/50 shadow-lg'; // Green gradient when voted today
    }
    if (isPending) {
      return 'bg-yellow-600 hover:bg-yellow-600 text-[var(--theme-textLight)]';
    }
    return 'bg-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primaryLight))] text-[hsl(var(--theme-textInverted))]';
  };

  const renderButtonContent = () => {
    if (isPending) {
      return (
        <>
          <Clock className="w-4 h-4 mr-1 animate-spin" />
          <span className="hidden sm:inline">Processing</span>
          <span className="sm:hidden">...</span>
        </>
      );
    }
    
    if (hasVoted) {
      if (isMobile) {
        return (
          <>
            <Check className="w-4 h-4 mr-1" />
            <span className="text-xs">Today</span>
          </>
        );
      }
      return (
        <>
          <Check className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Voted Today</span>
          <span className="sm:hidden">✓</span>
        </>
      );
    }
    
    // Not voted state
    if (isMobile) {
      return (
        <>
          <ThumbsUp className="w-4 h-4 mr-1" />
          <Plus className="w-3 h-3" />
        </>
      );
    }
    return (
      <>
        <ThumbsUp className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">Vote</span>
        <span className="sm:hidden">+</span>
      </>
    );
  };

  return (
    <ThemedButton
      onClick={handleClick}
      disabled={isDisabled}
      size="sm"
      className={`${getButtonColor()} font-bold flex-1 sm:flex-none ${getButtonSizing()} transition-all duration-200 ${className}`}
    >
      {renderButtonContent()}
    </ThemedButton>
  );
};

export default VoteButton;
