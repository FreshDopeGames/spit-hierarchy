
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Flame, ChevronDown } from "lucide-react";
import { RankingItemWithDelta } from "@/hooks/useRankingData";
import VoteButton from "@/components/VoteButton";

interface OfficialRankingItemsProps {
  items: RankingItemWithDelta[];
  onVote: (rapperName: string) => void;
  userLoggedIn: boolean;
  hotThreshold: number;
  displayCount: number;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  rankingId?: string;
}

const OfficialRankingItems = ({
  items,
  onVote,
  userLoggedIn,
  hotThreshold,
  displayCount,
  onLoadMore,
  hasMore,
  loading,
  rankingId
}: OfficialRankingItemsProps) => {
  const displayedItems = items.slice(0, displayCount);

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    if (delta < 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getDeltaText = (delta: number) => {
    if (delta > 0) return `+${delta}`;
    if (delta < 0) return `${delta}`;
    return "";
  };

  const isHot = (velocity: number) => velocity >= hotThreshold && velocity > 0;

  const formatVoteCount = (count: number | undefined) => {
    if (count === undefined || count === null) return "0";
    return count.toLocaleString();
  };

  return (
    <div className="space-y-4">
      {displayedItems.map((item, index) => (
        <div
          key={item.id}
          className="bg-carbon-fiber/90 border border-rap-gold/30 rounded-lg p-4 shadow-lg shadow-rap-gold/20 hover:shadow-rap-gold/40 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Dynamic Position with gold gradient circular background */}
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rap-gold via-yellow-400 to-rap-gold shadow-lg">
                <span className="text-2xl font-bold text-rap-carbon font-mogra">
                  {item.dynamic_position}
                </span>
              </div>

              {/* Rapper Info */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-rap-platinum font-kaushan">
                  {item.rapper?.name}
                </h3>
                {item.rapper?.origin && (
                  <p className="text-sm text-rap-smoke font-kaushan">
                    {item.rapper.origin}
                  </p>
                )}
                {/* Vote Count Display - now showing ranking-specific votes */}
                <p className="text-sm text-white font-bold font-kaushan">
                  Votes: {formatVoteCount(item.ranking_votes)}
                </p>
                {item.reason && (
                  <p className="text-sm text-rap-silver mt-1 font-kaushan italic">
                    "{item.reason}"
                  </p>
                )}
              </div>

              {/* Badges */}
              <div className="flex items-center space-x-2">
                {isHot(item.vote_velocity_24_hours || 0) && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none">
                    <Flame className="w-3 h-3 mr-1" />
                    Hot
                  </Badge>
                )}
                
                {item.position_delta && item.position_delta !== 0 && (
                  <Badge variant="outline" className="border-rap-gold/30 text-rap-platinum">
                    {getDeltaIcon(item.position_delta)}
                    <span className="ml-1">{getDeltaText(item.position_delta)}</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Vote Button */}
            <div className="ml-4">
              <VoteButton
                onVote={() => onVote(item.rapper?.name || "")}
                disabled={!userLoggedIn}
                showWeightedVoting={true}
                rankingId={rankingId}
                rapperId={item.rapper?.id}
              />
            </div>
          </div>

          {/* Vote Velocity Info */}
          {(item.vote_velocity_24_hours || item.vote_velocity_7_days) && (
            <div className="mt-3 pt-3 border-t border-rap-gold/20">
              <div className="flex items-center space-x-4 text-xs text-rap-smoke">
                {item.vote_velocity_24_hours && (
                  <span>24h: {item.vote_velocity_24_hours} votes</span>
                )}
                {item.vote_velocity_7_days && (
                  <span>7d: {item.vote_velocity_7_days} votes</span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-6">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            className="border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-carbon"
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            {loading ? "Loading..." : `Load More (${items.length - displayCount} remaining)`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default OfficialRankingItems;
