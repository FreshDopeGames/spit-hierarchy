
import React from "react";
import VoteButton from "@/components/VoteButton";
import { useIsMobile } from "@/hooks/use-mobile";

interface RankingItemVoteSectionProps {
  onVote: (rapperName: string) => void;
  userLoggedIn: boolean;
  isTopFive: boolean;
  rankingId?: string;
  rapperId?: string;
  rapperName?: string;
  isPending: boolean;
}

const RankingItemVoteSection = ({
  onVote,
  userLoggedIn,
  isTopFive,
  rankingId,
  rapperId,
  rapperName,
  isPending
}: RankingItemVoteSectionProps) => {
  const getVoteButtonSizing = () => {
    if (isTopFive) {
      return "px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-bold";
    }
    return "px-4 py-2 text-sm md:text-base font-semibold";
  };

  const getPositioning = () => {
    if (isTopFive) {
      return "absolute bottom-4 right-4 z-20";
    }
    return "absolute top-3 right-3 z-20";
  };

  return (
    <div className={getPositioning()}>
      <VoteButton
        onVote={() => onVote(rapperName || '')}
        disabled={!userLoggedIn}
        className={`bg-rap-gold hover:bg-rap-gold-light text-rap-carbon shadow-2xl border-2 border-white/20 hover:border-white/40 rounded-xl transition-all duration-300 hover:scale-105 ${getVoteButtonSizing()}`}
        rankingId={rankingId}
        rapperId={rapperId}
        showWeightedVoting={true}
        isPending={isPending}
        isTopFive={isTopFive}
      />
    </div>
  );
};

export default RankingItemVoteSection;
