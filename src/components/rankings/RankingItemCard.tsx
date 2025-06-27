
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

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 sm:p-4 bg-rap-carbon/30 rounded-lg hover:bg-rap-carbon/50 transition-all duration-200 relative ${
      isPending ? 'ring-2 ring-yellow-500/50 bg-yellow-500/10' : ''
    }`}>
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-rap-burgundy to-rap-forest rounded-full flex items-center justify-center">
        <span className="text-rap-platinum font-bold text-lg font-ceviche">#{item.position}</span>
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
          <h3 className="text-rap-platinum font-semibold text-lg font-mogra truncate">
            {item.rapper?.name}
          </h3>
          {getTrendingIcon()}
          {isHot && (
            <HotBadge isHot={isHot} voteVelocity={voteVelocity} variant="compact" />
          )}
        </div>
        
        <p className="text-rap-smoke font-merienda text-sm sm:text-base mb-2">
          {item.reason || `Origin: ${item.rapper?.origin || 'Unknown'}`}
        </p>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-rap-gold" />
            <span className="text-rap-platinum font-merienda">
              {item.ranking_votes} votes
              {isPending && (
                <span className="text-yellow-400 ml-1">(processing...)</span>
              )}
            </span>
          </div>
          
          {item.rapper?.average_rating && (
            <div className="flex items-center gap-1">
              <span className="text-rap-smoke">Rating:</span>
              <span className="text-rap-gold font-bold">
                {parseFloat(item.rapper.average_rating.toString()).toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <VoteButton
          onVote={() => onVote(item.rapper?.name || '')}
          disabled={!userLoggedIn}
          className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-bold text-sm sm:text-lg px-3 py-2 sm:px-6 sm:py-3"
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
              className="text-rap-silver hover:text-rap-platinum font-kaushan w-full sm:w-auto text-sm"
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
