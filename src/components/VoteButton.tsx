
import { ThemedButton } from "@/components/ui/themed-button";
import { ThumbsUp, Star, Check, Clock, Plus } from "lucide-react";
import { useRankingVotes } from "@/hooks/useRankingVotes";
import { useUserRankingVotes } from "@/hooks/useUserRankingVotes";
import { useAuth } from "@/hooks/useAuth";
import { useDailyVoteStatus } from "@/hooks/useDailyVoteStatus";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useState } from "react";

interface VoteButtonProps {
  onVote: () => void;
  disabled?: boolean;
  className?: string;
  rankingId?: string;
  userRankingId?: string;
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
  userRankingId,
  rapperId,
  showWeightedVoting = false,
  isPending = false,
  isTopFive = false
}: VoteButtonProps) => {
  console.log('🔵 [VoteButton] Rendered', {
    rankingId,
    userRankingId,
    rapperId: rapperId?.substring(0, 8) + '...',
    showWeightedVoting,
    isPending,
    isTopFive
  });

  const { user } = useAuth();
  const { submitRankingVote, getVoteMultiplier: getOfficialMultiplier, currentStatus } = useRankingVotes();
  const { submitUserRankingVote, getVoteMultiplier: getUserMultiplier } = useUserRankingVotes();
  
  // Debouncing state to prevent double-clicks
  const [isProcessing, setIsProcessing] = useState(false);
  
  console.log('🔐 [VoteButton] Auth state:', {
    hasUser: !!user,
    userId: user?.id?.substring(0, 8) + '...',
    userEmail: user?.email
  });
  
  const trackingRankingId = rankingId || userRankingId;
  const { hasVotedToday, addVoteToTracking } = useDailyVoteStatus(trackingRankingId);
  const isMobile = useIsMobile();

  // Strict UUID validation
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isValidRapperId = rapperId && UUID_REGEX.test(rapperId);
  const isValidRankingId = (rankingId && UUID_REGEX.test(rankingId)) || (userRankingId && UUID_REGEX.test(userRankingId));

  const hasVoted = isValidRapperId ? hasVotedToday(rapperId) : false;
  const isPendingVote = submitRankingVote.isPending || submitUserRankingVote.isPending;
  const isDisabled = disabled || isPendingVote || !user || hasVoted || !isValidRapperId || !isValidRankingId || isProcessing;
  const voteMultiplier = userRankingId ? getUserMultiplier() : getOfficialMultiplier();

  // Debug: Log button state
  console.log('🎛️ [VoteButton] Button state:', {
    rapperId: rapperId?.substring(0, 8),
    isDisabled,
    disabled,
    isPendingVote,
    hasUser: !!user,
    hasVoted,
    isValidRapperId,
    isValidRankingId,
    isProcessing
  });

  const handleClick = async () => {
    console.log('🎯 [VoteButton] handleClick CALLED - Function entry point reached!', { rapperId: rapperId?.substring(0, 8) });
    
    // Prevent double-clicks
    if (isProcessing) {
      console.log('⏸️ [VoteButton] Click ignored - already processing');
      return;
    }

    console.log('🔵 [VoteButton] Click initiated', {
      rapperId,
      rankingId,
      userRankingId,
      hasUser: !!user,
      userId: user?.id,
      hasVoted,
      isDisabled,
      isValidRapperId,
      isValidRankingId,
      voteMultiplier,
      showWeightedVoting
    });

    if (isDisabled || !rapperId) {
      console.log('⛔ [VoteButton] Vote blocked:', {
        reason: !user ? 'No user' : hasVoted ? 'Already voted' : !isValidRapperId ? 'Invalid rapper ID' : !isValidRankingId ? 'Invalid ranking ID' : 'Unknown',
        user: !!user,
        hasVoted,
        isValidRapperId,
        isValidRankingId
      });

      if (!user) {
        toast.error("Please sign in to vote for rappers.");
      } else if (hasVoted) {
        toast.error("You've already voted for this rapper today. Come back tomorrow!");
      } else if (!isValidRapperId || !isValidRankingId) {
        toast.error("Loading ranking info...");
      }
      return;
    }

    if (showWeightedVoting && user) {
      console.log('🎯 [VoteButton] Starting weighted vote submission', {
        rapperId,
        rankingId: rankingId || userRankingId,
        voteWeight: voteMultiplier,
        isUserRanking: !!userRankingId
      });

      // Security check
      if (!rapperId.match(/^[a-f0-9-]{36}$/i)) {
        console.error('❌ [VoteButton] Invalid rapper ID format:', rapperId);
        toast.error("Invalid voting parameters");
        return;
      }

      // Set processing state to prevent double-clicks
      setIsProcessing(true);

      try {
        if (userRankingId) {
          console.log('📤 [VoteButton] Submitting user ranking vote...');
          // User ranking vote
          if (!userRankingId.match(/^[a-f0-9-]{36}$/i)) {
            console.error('❌ [VoteButton] Invalid user ranking ID format:', userRankingId);
            toast.error("Invalid voting parameters");
            return;
          }
          const result = await submitUserRankingVote.mutateAsync({ userRankingId, rapperId });
          console.log('✅ [VoteButton] User ranking vote successful:', result);
          // Immediately reflect voted state
          addVoteToTracking(rapperId);
        } else if (rankingId) {
          console.log('📤 [VoteButton] Submitting official ranking vote...');
          // Official ranking vote
          if (!rankingId.match(/^[a-f0-9-]{36}$/i)) {
            console.error('❌ [VoteButton] Invalid ranking ID format:', rankingId);
            toast.error("Invalid voting parameters");
            return;
          }
          const result = await submitRankingVote.mutateAsync({ rankingId, rapperId });
          console.log('✅ [VoteButton] Official ranking vote successful:', result);
          // Immediately reflect voted state
          addVoteToTracking(rapperId);
        }
      } catch (error: any) {
        console.error('❌ [VoteButton] Vote submission failed:', {
          error,
          message: error?.message,
          code: error?.code,
          details: error?.details,
          rapperId,
          rankingId: rankingId || userRankingId
        });
        // Error is already handled by useRankingVotes/useUserRankingVotes hook
        // No need for duplicate toast here
      } finally {
        // Re-enable button after 1 second to prevent rapid double-clicks
        setTimeout(() => setIsProcessing(false), 1000);
      }
    } else {
      console.log('🔄 [VoteButton] Using callback vote handler');
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

  console.log('🔧 [VoteButton] Rendering button with:', { 
    hasOnClick: !!handleClick, 
    isDisabled,
    rapperId: rapperId?.substring(0, 8)
  });

  return (
    <ThemedButton
      onClick={(e) => {
        console.log('🖱️ [VoteButton] ThemedButton onClick fired!', { rapperId: rapperId?.substring(0, 8), event: e.type });
        handleClick();
      }}
      disabled={isDisabled}
      size="sm"
      className={`${getButtonColor()} font-bold flex-1 sm:flex-none ${getButtonSizing()} transition-all duration-200 ${className}`}
    >
      {renderButtonContent()}
    </ThemedButton>
  );
};

export default VoteButton;
