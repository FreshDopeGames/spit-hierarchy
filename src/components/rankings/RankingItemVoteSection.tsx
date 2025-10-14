
import React from "react";
import VoteButton from "@/components/VoteButton";
import { useIsMobile } from "@/hooks/use-mobile";

interface RankingItemVoteSectionProps {
  onVote: (rapperName: string) => void;
  userLoggedIn: boolean;
  isTopFive: boolean;
  rankingId?: string;
  userRankingId?: string;
  rapperId?: string;
  rapperName?: string;
  isPending: boolean;
}

const RankingItemVoteSection = ({
  onVote,
  userLoggedIn,
  isTopFive,
  rankingId,
  userRankingId,
  rapperId,
  rapperName,
  isPending
}: RankingItemVoteSectionProps) => {
  const isMobile = useIsMobile();

  const getVoteButtonSizing = () => {
    if (isTopFive) {
      return "px-6 py-3 text-base font-bold";
    }
    return "px-3 py-1 text-xs";
  };

  const getVoteButtonWidth = () => {
    if (isTopFive && isMobile) {
      return "w-full";
    }
    return "w-auto";
  };

  const getContainerAlignment = () => {
    if (isTopFive && isMobile) {
      return "w-full flex justify-center";
    }
    return "flex items-center flex-shrink-0";
  };

  const getContainerPadding = () => {
    if (isTopFive) {
      return "p-2";
    }
    return "pr-2";
  };

  return (
    <div className={`${getContainerAlignment()} ${getContainerPadding()}`}>
      <VoteButton
        onVote={() => onVote(rapperName || '')}
        disabled={!userLoggedIn}
        className={`${getVoteButtonSizing()} ${getVoteButtonWidth()} transition-all duration-200`}
        rankingId={rankingId}
        userRankingId={userRankingId}
        rapperId={rapperId}
        showWeightedVoting={true}
        isPending={isPending}
        isTopFive={isTopFive}
      />
    </div>
  );
};

export default RankingItemVoteSection;
