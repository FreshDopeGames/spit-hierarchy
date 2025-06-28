
import React from "react";
import VoteButton from "@/components/VoteButton";

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
  return (
    <div className={`flex items-center ${isTopFive ? 'w-full sm:w-auto' : 'flex-shrink-0'}`}>
      <VoteButton
        onVote={() => onVote(rapperName || '')}
        disabled={!userLoggedIn}
        className={`${isTopFive ? 'bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-bold' : 'bg-rap-gold/80 hover:bg-rap-gold text-rap-carbon'} ${isTopFive ? 'text-sm px-4 py-2' : 'text-xs px-2 py-1'} transition-all duration-200 ${isTopFive ? 'w-full sm:w-auto' : ''}`}
        rankingId={rankingId}
        rapperId={rapperId}
        showWeightedVoting={true}
        isPending={isPending}
      />
    </div>
  );
};

export default RankingItemVoteSection;
