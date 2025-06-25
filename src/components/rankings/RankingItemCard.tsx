
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
  const isLowRanking = item.dynamic_position > 5;
  const useCompactMobile = isMobile && isLowRanking;

  const getDeltaIcon = (delta: number | null | undefined) => {
    if (delta === null || delta === undefined || delta === 0) {
      return <Minus className="w-3 h-3 text-rap-gold" />;
    }
    if (delta > 0) return <TrendingDown className="w-3 h-3 text-red-400" />;
    if (delta < 0) return <TrendingUp className="w-3 h-3 text-green-400" />;
    return <Minus className="w-3 h-3 text-rap-gold" />;
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
          <Star className={`${useCompactMobile ? 'w-3 h-3' : 'w-4 h-4'} text-rap-gold/50`} />
          <span className={`text-rap-smoke/70 font-kaushan ${useCompactMobile ? 'text-xs' : 'text-sm'} italic`}>
            Be first to vote!
          </span>
        </div>
      );
    }
    return (
      <p className={`text-white font-bold font-kaushan ${useCompactMobile ? 'text-xs' : 'text-sm'}`}>
        Votes: {formattedCount}
      </p>
    );
  };

  // Compact mobile layout for positions 6+
  if (useCompactMobile) {
    return (
      <div className="bg-carbon-fiber/90 border border-rap-gold/20 rounded-lg shadow-md shadow-rap-gold/10 hover:shadow-rap-gold/30 transition-all duration-300 relative overflow-hidden">
        <div className="flex items-center p-3 gap-3">
          {/* Position Badge with Delta - More compact */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-rap-silver via-rap-platinum to-rap-smoke shadow-sm">
              <span className="text-rap-carbon font-mogra text-xs font-bold">
                {item.dynamic_position}
              </span>
            </div>
            {/* Delta icon directly under position */}
            <div className="flex items-center mt-1">
              {getDeltaIcon(item.position_delta)}
              {getDeltaText(item.position_delta) && (
                <span className="text-xs text-rap-platinum ml-1">{getDeltaText(item.position_delta)}</span>
              )}
            </div>
          </div>

          {/* Avatar - Smaller */}
          {item.rapper && (
            <div className="flex-shrink-0">
              <RapperAvatar 
                rapper={item.rapper as any} 
                size="sm"
                imageUrl={rapperImageUrl}
              />
            </div>
          )}

          {/* Content - More space for name */}
          <div className="flex-1 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-base font-bold text-rap-platinum font-kaushan">
                {item.rapper?.name}
              </h3>
              {/* Hot Badge - Smaller */}
              {isHot(item.vote_velocity_24_hours || 0) && (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none text-xs px-1 py-0 flex-shrink-0">
                  <Flame className="w-2 h-2 mr-1" />
                  Hot
                </Badge>
              )}
            </div>
            
            {/* Hometown - Smaller */}
            {item.rapper?.origin && (
              <div className="flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-rap-smoke flex-shrink-0" />
                <p className="text-xs text-rap-smoke font-kaushan">
                  {item.rapper.origin}
                </p>
              </div>
            )}
            
            {/* Vote Count - Smaller */}
            {getVoteDisplay(item.ranking_votes)}
          </div>

          {/* Vote Button - Much more compact */}
          <div className="flex-shrink-0">
            <VoteButton
              onVote={() => onVote(item.rapper?.name || "")}
              disabled={!userLoggedIn}
              showWeightedVoting={true}
              rankingId={rankingId}
              rapperId={item.rapper?.id}
              className="text-xs px-2 py-1 min-w-[60px]"
            />
          </div>
        </div>
      </div>
    );
  }

  // Original layout for positions 1-5 and desktop
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
              <div className={`${isMobile ? "flex-1 min-w-0 text-center" : "flex-1 min-w-0"}`}>
                <div className={`flex items-center gap-2 mb-1 flex-wrap ${isMobile ? "justify-center" : ""}`}>
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
                  <div className={`flex items-center gap-1 mb-1 ${isMobile ? "justify-center" : ""}`}>
                    <MapPin className="w-4 h-4 text-rap-smoke flex-shrink-0" />
                    <p className="text-sm text-rap-smoke font-kaushan">
                      {item.rapper.origin}
                    </p>
                  </div>
                )}
                
                {/* Primary: Vote Count - Enhanced display */}
                <div className={isMobile ? "flex justify-center" : ""}>
                  {getVoteDisplay(item.ranking_votes)}
                </div>
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
