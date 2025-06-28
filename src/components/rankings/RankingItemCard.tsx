
import React from "react";
import { Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import VoteButton from "@/components/VoteButton";
import HotBadge from "@/components/analytics/HotBadge";
import { RankingItemWithDelta } from "@/hooks/useRankingData";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
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

  // Position-based styling functions - use dynamic_position for accurate ranking
  const isTopFive = item.dynamic_position <= 5;
  
  // Helper function to get gradient classes based on position
  const getPositionGradient = (position: number) => {
    if (position <= 5) {
      return "bg-gradient-to-br from-rap-gold-dark via-rap-gold to-rap-gold-light";
    }
    return "bg-gradient-to-br from-gray-600 via-gray-400 to-gray-300";
  };

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
    return "min-h-[50px] sm:min-h-[60px]"; // Ultra-compact height for 6+ positions
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
    return "gap-2 p-2 sm:gap-3 sm:p-3"; // Ultra-compact spacing for 6+ positions
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
      name: "text-sm sm:text-base text-rap-platinum",
      reason: "text-xs sm:text-sm text-rap-smoke",
      votes: "text-xs sm:text-sm text-rap-gold/70"
    };
  };

  const textSizes = getTextSizes();

  // Position cap component that truly caps the card edges
  const PositionCap = () => {
    if (isMobile) {
      return (
        <div className={`${getPositionGradient(item.dynamic_position)} ${isTopFive ? 'h-16' : 'h-12'} flex items-center justify-center`}>
          <span className={`${isTopFive ? 'text-2xl' : 'text-lg'} font-bold text-rap-carbon font-mogra`}>
            {item.dynamic_position}
          </span>
        </div>
      );
    }

    return (
      <div className={`${getPositionGradient(item.dynamic_position)} ${isTopFive ? 'w-16' : 'w-12'} flex items-center justify-center`}>
        <span className={`${isTopFive ? 'text-2xl' : 'text-lg'} font-bold text-rap-carbon font-mogra`}>
          {item.dynamic_position}
        </span>
      </div>
    );
  };

  return (
    <div className={`flex ${getMobileLayout()} ${getContentSpacing()} ${getCardHeight()} ${isMobile ? 'rounded-b-lg' : 'rounded-r-lg'} border transition-all duration-300 relative ${getCardStyling()} ${
      isPending ? 'ring-2 ring-yellow-500/50 bg-yellow-500/10' : ''
    } overflow-hidden`}>
      {/* Position Cap - Flush with card edges */}
      <PositionCap />
      
      {/* Content Container */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
        {/* Clickable Rapper Image */}
        {rapperImageUrl && (
          <Link to={`/rapper/${item.rapper?.id}`} className={`${isTopFive ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-8 h-8 sm:w-12 sm:h-12'} rounded-lg overflow-hidden bg-rap-carbon-light/50 flex-shrink-0 ${isTopFive ? 'mx-auto sm:mx-0' : ''} hover:opacity-80 transition-opacity`}>
            <img 
              src={rapperImageUrl} 
              alt={item.rapper?.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </Link>
        )}
        
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <Link to={`/rapper/${item.rapper?.id}`} className={`font-semibold ${textSizes.name} font-mogra truncate hover:opacity-80 transition-opacity`}>
              {item.rapper?.name}
            </Link>
            {getTrendingIcon()}
            {isHot && (
              <HotBadge isHot={isHot} voteVelocity={voteVelocity} variant="compact" />
            )}
          </div>
          
          {(isTopFive || item.reason) && (
            <p className={`font-merienda ${textSizes.reason} ${isTopFive ? 'text-center sm:text-left' : ''}`}>
              {item.reason || `Origin: ${item.rapper?.origin || 'Unknown'}`}
            </p>
          )}
          
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
        
        {/* Vote Button Only */}
        <div className={`flex items-center ${isTopFive ? 'w-full sm:w-auto' : 'flex-shrink-0'}`}>
          <VoteButton
            onVote={() => onVote(item.rapper?.name || '')}
            disabled={!userLoggedIn}
            className={`${isTopFive ? 'bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-bold' : 'bg-rap-gold/80 hover:bg-rap-gold text-rap-carbon'} ${isTopFive ? 'text-lg px-6 py-3' : 'text-xs px-3 py-1'} transition-all duration-200 ${isTopFive ? 'w-full sm:w-auto' : ''}`}
            rankingId={rankingId}
            rapperId={item.rapper?.id}
            showWeightedVoting={true}
            isPending={isPending}
          />
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
