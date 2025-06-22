
import React from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Flame, Star, MapPin } from "lucide-react";
import { RankingItemWithDelta } from "@/hooks/useRankingData";
import VoteButton from "@/components/VoteButton";
import RapperAvatar from "@/components/RapperAvatar";
import { useIsMobile } from "@/hooks/use-mobile";
import RankingPositionCap from "./RankingPositionCap";

interface RankingItemCardProps {
  item: RankingItemWithDelta;
  onVote: (rapperName: string) => void;
  userLoggedIn: boolean;
  hotThreshold: number;
  rankingId?: string;
  rapperImageUrl?: string | null;
}

const RankingItemCard = ({
  item,
  onVote,
  userLoggedIn,
  hotThreshold,
  rankingId,
  rapperImageUrl
}: RankingItemCardProps) => {
  const isMobile = useIsMobile();

  const getDeltaIcon = (delta: number | null | undefined) => {
    if (delta === null || delta === undefined || delta === 0) {
      return <Minus className="w-4 h-4 text-rap-gold" />;
    }
    if (delta > 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    if (delta < 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    return <Minus className="w-4 h-4 text-rap-gold" />;
  };

  const getDeltaText = (delta: number | null | undefined) => {
    if (delta === null || delta === undefined || delta === 0) return "";
    if (delta > 0) return `+${delta}`;
    if (delta < 0) return `${delta}`;
    return "";
  };

  const isHot = (velocity: number) => velocity >= hotThreshold && velocity > 0;

  const formatVoteCount = (count: number | undefined) => {
    if (count === undefined || count === null || count === 0) return null;
    return count.toLocaleString();
  };

  const getVoteDisplay = (voteCount: number | undefined) => {
    const formattedCount = formatVoteCount(voteCount);
    if (!formattedCount) {
      return (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-rap-gold/50" />
          <span className="text-rap-smoke/70 font-kaushan text-sm italic">
            Be first to vote!
          </span>
        </div>
      );
    }
    return (
      <p className="text-sm text-white font-bold font-kaushan">
        Votes: {formattedCount}
      </p>
    );
  };

  return (
    <div className="bg-carbon-fiber/90 border border-rap-gold/30 rounded-lg shadow-lg shadow-rap-gold/20 hover:shadow-rap-gold/40 transition-all duration-300 relative overflow-hidden">
      {/* Mobile: Top Cap */}
      {isMobile && <RankingPositionCap position={item.dynamic_position} />}

      <div className={`${isMobile ? "p-4" : "flex"}`}>
        {/* Desktop/Tablet: Left Cap */}
        {!isMobile && <RankingPositionCap position={item.dynamic_position} />}

        {/* Avatar Section */}
        {item.rapper && (
          <div className={`flex-shrink-0 ${isMobile ? "flex justify-center mb-3" : "flex items-center p-3"}`}>
            <RapperAvatar 
              rapper={item.rapper as any} 
              size={isMobile ? "md" : "lg"}
              imageUrl={rapperImageUrl}
            />
          </div>
        )}

        <div className={`flex-1 ${isMobile ? "" : "p-4"}`}>
          <div className={isMobile ? "flex flex-col space-y-3" : "flex items-center justify-between"}>
            <div className={`flex items-center space-x-4 ${isMobile ? "w-full" : "flex-1"}`}>
              {/* Primary: Rapper Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-xl font-bold text-rap-platinum font-kaushan">
                    {item.rapper?.name}
                  </h3>
                  {/* Contextual: Hot Badge - smaller and positioned as secondary info */}
                  {isHot(item.vote_velocity_24_hours || 0) && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none text-xs px-2 py-1 flex-shrink-0">
                      <Flame className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                  {/* Position Delta Badge - on mobile, show inline with name */}
                  {isMobile && (
                    <Badge variant="outline" className="border-rap-gold/30 text-rap-platinum text-xs flex-shrink-0">
                      {getDeltaIcon(item.position_delta)}
                      <span className="ml-1">{getDeltaText(item.position_delta)}</span>
                    </Badge>
                  )}
                </div>
                
                {/* Primary: Hometown with enhanced styling */}
                {item.rapper?.origin && (
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-4 h-4 text-rap-smoke flex-shrink-0" />
                    <p className="text-sm text-rap-smoke font-kaushan">
                      {item.rapper.origin}
                    </p>
                  </div>
                )}
                
                {/* Primary: Vote Count - Enhanced display */}
                {getVoteDisplay(item.ranking_votes)}
              </div>

              {/* Secondary: Position Delta Badge - Desktop only */}
              {!isMobile && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-rap-gold/30 text-rap-platinum">
                    {getDeltaIcon(item.position_delta)}
                    <span className="ml-1">{getDeltaText(item.position_delta)}</span>
                  </Badge>
                </div>
              )}
            </div>

            {/* Primary: Vote Button */}
            <div className={isMobile ? "flex justify-center" : "ml-4"}>
              <VoteButton
                onVote={() => onVote(item.rapper?.name || "")}
                disabled={!userLoggedIn}
                showWeightedVoting={true}
                rankingId={rankingId}
                rapperId={item.rapper?.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingItemCard;
