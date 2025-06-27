
import React from "react";
import { Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import VoteButton from "@/components/VoteButton";
import HotBadge from "@/components/analytics/HotBadge";
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
  
  const getPositionBackground = () => {
    if (isTopFive) {
      return "bg-gradient-to-br from-rap-gold-dark via-rap-gold to-rap-gold-light shadow-lg";
    }
    return "bg-gradient-to-br from-rap-silver/80 to-rap-platinum/80";
  };

  const getPositionTextColor = () => {
    return isTopFive ? "text-rap-carbon" : "text-rap-platinum";
  };

  const getCardStyling = () => {
    if (isTopFive) {
      return "bg-rap-carbon/40 border-rap-gold/30 shadow-lg hover:bg-rap-carbon/60 hover:shadow-xl hover:border-rap-gold/50";
    }
    return "bg-rap-carbon/20 border-rap-platinum/20 hover:bg-rap-carbon/30 hover:border-rap-platinum/30";
  };

  const getCircleSize = () => {
    return isTopFive ? "w-14 h-14" : "w-12 h-12";
  };

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 sm:p-4 rounded-lg border transition-all duration-300 relative ${getCardStyling()} ${
      isPending ? 'ring-2 ring-yellow-500/50 bg-yellow-500/10' : ''
    }`}>
      <div className={`flex-shrink-0 ${getCircleSize()} ${getPositionBackground()} rounded-full flex items-center justify-center`}>
        <span className={`${getPositionTextColor()} font-bold ${isTopFive ? 'text-xl' : 'text-lg'} font-ceviche`}>
          #{item.position}
        </span>
      </div>
      
      {rapperImageUrl && (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-rap-carbon-light/50">
          <img 
            src={rapperImageUrl} 
            alt={item.rapper?.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-semibold ${isTopFive ? 'text-xl text-rap-gold' : 'text-lg text-rap-platinum'} font-mogra truncate`}>
            {item.rapper?.name}
          </h3>
          {getTrendingIcon()}
          {isHot && (
            <HotBadge isHot={isHot} voteVelocity={voteVelocity} variant="compact" />
          )}
        </div>
        
        <p className={`font-merienda text-sm sm:text-base mb-2 ${isTopFive ? 'text-rap-platinum' : 'text-rap-smoke'}`}>
          {item.reason || `Origin: ${item.rapper?.origin || 'Unknown'}`}
        </p>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Star className={`w-4 h-4 ${isTopFive ? 'text-rap-gold' : 'text-rap-gold/70'}`} />
            <span className={`font-merienda ${isTopFive ? 'text-rap-gold font-bold' : 'text-rap-platinum'}`}>
              {item.ranking_votes} votes
              {isPending && (
                <span className="text-yellow-400 ml-1">(processing...)</span>
              )}
            </span>
          </div>
          
          {item.rapper?.total_votes && item.rapper.total_votes > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-rap-smoke">Total votes:</span>
              <span className={`font-bold ${isTopFive ? 'text-rap-gold' : 'text-rap-gold/70'}`}>
                {item.rapper.total_votes}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <VoteButton
          onVote={() => onVote(item.rapper?.name || '')}
          disabled={!userLoggedIn}
          className={`${isTopFive ? 'bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-bold' : 'bg-rap-gold/80 hover:bg-rap-gold text-rap-carbon'} text-sm sm:text-lg px-3 py-2 sm:px-6 sm:py-3 transition-all duration-200`}
          rankingId={rankingId}
          rapperId={item.rapper?.id}
          showWeightedVoting={true}
          isPending={isPending}
        />
        
        {item.rapper?.id && (
          <Link to={`/rapper/${item.rapper.id}`} className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              className={`${isTopFive ? 'text-rap-gold hover:text-rap-gold-light' : 'text-rap-silver hover:text-rap-platinum'} font-kaushan w-full sm:w-auto text-sm transition-colors duration-200`}
            >
              View Profile
            </Button>
          </Link>
        )}
      </div>
      
      {isPending && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default RankingItemCard;
