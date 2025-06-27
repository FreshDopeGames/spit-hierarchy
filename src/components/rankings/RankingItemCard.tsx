
import React from "react";
import { Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import VoteButton from "@/components/VoteButton";
import HotBadge from "@/components/analytics/HotBadge";
import RankingPositionCap from "./RankingPositionCap";
import { RankingItemWithDelta } from "@/hooks/useRankingData";

interface RankingItemCardProps {
  item: RankingItemWithDelta;
  onVote: (rapperName: string) => void;
  userLoggedIn: boolean;
  hotThreshold: number;
  rankingId?: string;
  rapperImageUrl?: string;
}

const RankingItemCard = ({
  item,
  onVote,
  userLoggedIn,
  hotThreshold,
  rankingId,
  rapperImageUrl
}: RankingItemCardProps) => {
  const isHot = item.ranking_votes >= hotThreshold;
  const voteVelocity = isHot ? Math.floor(Math.random() * 15) + 5 : 0;
  
  // Get position delta for trending indicator
  const delta = item.position_delta || 0;
  const getTrendingIcon = () => {
    if (delta < 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (delta > 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  // Check if item is in pending state (for optimistic updates)
  const isPending = (item as any).isPending || false;

  // Position-based styling functions
  const isTopFive = item.position <= 5;
  
  const getCardStyling = () => {
    if (isTopFive) {
      return "bg-rap-carbon/40 border-rap-gold/30 shadow-lg hover:bg-rap-carbon/60 hover:shadow-xl hover:border-rap-gold/50";
    }
    return "bg-rap-carbon/20 border-rap-platinum/20 hover:bg-rap-carbon/30 hover:border-rap-platinum/30";
  };

  const getCardHeight = () => {
    if (isTopFive) {
      return "min-h-[120px] sm:min-h-[140px]"; // Prominent height for top 5
    }
    return "min-h-[80px] sm:min-h-[100px]"; // Compact height for 6+ positions
  };

  const getMobileLayout = () => {
    if (isTopFive) {
      return "flex-col items-center text-center sm:flex-row sm:items-start sm:text-left"; // Centered on mobile, left-aligned on desktop
    }
    return "flex-row items-center"; // Always horizontal for 6+ positions
  };

  const getContentSpacing = () => {
    if (isTopFive) {
      return "gap-4 p-4 sm:gap-6 sm:p-6"; // More generous spacing for top 5
    }
    return "gap-3 p-3 sm:gap-4 sm:p-4"; // Compact spacing for 6+ positions
  };

  const getTextSizes = () => {
    if (isTopFive) {
      return {
        name: "text-xl sm:text-2xl text-rap-gold",
        reason: "text-base sm:text-lg text-rap-platinum",
        votes: "text-base sm:text-lg text-rap-gold font-bold"
      };
    }
    return {
      name: "text-lg sm:text-xl text-rap-platinum",
      reason: "text-sm sm:text-base text-rap-smoke",
      votes: "text-sm sm:text-base text-rap-gold/70"
    };
  };

  const textSizes = getTextSizes();

  return (
    <div className={`flex ${getMobileLayout()} ${getContentSpacing()} ${getCardHeight()} rounded-lg border transition-all duration-300 relative ${getCardStyling()} ${
      isPending ? 'ring-2 ring-yellow-500/50 bg-yellow-500/10' : ''
    }`}>
      {/* Position Cap - Top on mobile, Left on desktop */}
      <RankingPositionCap position={item.position} />
      
      {/* Content Container */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
        {/* Rapper Image */}
        {rapperImageUrl && (
          <div className={`${isTopFive ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-12 h-12 sm:w-16 sm:h-16'} rounded-lg overflow-hidden bg-rap-carbon-light/50 flex-shrink-0 ${isTopFive ? 'mx-auto sm:mx-0' : ''}`}>
            <img 
              src={rapperImageUrl} 
              alt={item.rapper?.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h3 className={`font-semibold ${textSizes.name} font-mogra truncate`}>
              {item.rapper?.name}
            </h3>
            {getTrendingIcon()}
            {isHot && (
              <HotBadge isHot={isHot} voteVelocity={voteVelocity} variant="compact" />
            )}
          </div>
          
          <p className={`font-merienda ${textSizes.reason} ${isTopFive ? 'text-center sm:text-left' : ''}`}>
            {item.reason || `Origin: ${item.rapper?.origin || 'Unknown'}`}
          </p>
          
          <div className={`flex items-center gap-4 text-sm ${isTopFive ? 'justify-center sm:justify-start' : 'justify-start'}`}>
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 ${isTopFive ? 'text-rap-gold' : 'text-rap-gold/70'}`} />
              <span className={`font-merienda ${textSizes.votes}`}>
                {item.ranking_votes} votes
                {isPending && (
                  <span className="text-yellow-400 ml-1">(processing...)</span>
                )}
              </span>
            </div>
            
            {item.rapper?.total_votes && item.rapper.total_votes > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-rap-smoke">Total:</span>
                <span className={`font-bold ${isTopFive ? 'text-rap-gold' : 'text-rap-gold/70'}`}>
                  {item.rapper.total_votes}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className={`flex ${isTopFive ? 'flex-col sm:flex-row items-center' : 'flex-row items-center'} gap-2 sm:gap-3 ${isTopFive ? 'w-full sm:w-auto' : 'flex-shrink-0'}`}>
          <VoteButton
            onVote={() => onVote(item.rapper?.name || '')}
            disabled={!userLoggedIn}
            className={`${isTopFive ? 'bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-bold' : 'bg-rap-gold/80 hover:bg-rap-gold text-rap-carbon'} ${isTopFive ? 'text-lg px-6 py-3' : 'text-sm px-4 py-2'} transition-all duration-200 ${isTopFive ? 'w-full sm:w-auto' : ''}`}
            rankingId={rankingId}
            rapperId={item.rapper?.id}
            showWeightedVoting={true}
            isPending={isPending}
          />
          
          {item.rapper?.id && (
            <Link to={`/rapper/${item.rapper.id}`} className={isTopFive ? "w-full sm:w-auto" : ""}>
              <Button
                variant="ghost"
                size="sm"
                className={`${isTopFive ? 'text-rap-gold hover:text-rap-gold-light' : 'text-rap-silver hover:text-rap-platinum'} font-kaushan transition-colors duration-200 ${isTopFive ? 'w-full sm:w-auto' : ''}`}
              >
                View Profile
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Pending Indicator */}
      {isPending && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default RankingItemCard;
