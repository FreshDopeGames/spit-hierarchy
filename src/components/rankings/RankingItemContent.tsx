
import React from "react";
import { Link } from "react-router-dom";
import { Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { RankingItemWithDelta } from "@/hooks/useRankingData";
import { useIsMobile } from "@/hooks/use-mobile";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";

interface RankingItemContentProps {
  item: RankingItemWithDelta;
  isTopFive: boolean;
  isHot: boolean;
  voteVelocity: number;
  rapperImageUrl?: string;
  isPending: boolean;
}

const RankingItemContent = ({
  item,
  isTopFive,
  isHot,
  voteVelocity,
  rapperImageUrl,
  isPending
}: RankingItemContentProps) => {
  const isMobile = useIsMobile();
  const delta = item.position_delta || 0;
  
  const getTrendingIcon = () => {
    if (delta < 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (delta > 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTextSizes = () => {
    if (isTopFive) {
      return {
        name: "text-xl sm:text-2xl text-rap-gold",
        reason: "text-base sm:text-lg text-rap-platinum",
      };
    }
    return {
      name: "text-sm text-rap-platinum leading-tight",
      reason: "text-xs text-rap-smoke leading-tight",
    };
  };

  const getImageSize = () => {
    if (isTopFive) {
      return "w-28 h-28 sm:w-32 sm:h-32";
    }
    return "w-10 h-10 sm:w-14 sm:h-14";
  };

  const getContentAlignment = () => {
    return "items-start text-left";
  };

  const getContentSpacing = () => {
    if (isTopFive) {
      return isMobile ? "gap-3 p-2" : "gap-4 pr-3 py-3";
    }
    return isMobile ? "gap-2 px-2 py-1" : "gap-2 px-3 py-2";
  };

  const textSizes = getTextSizes();

  // Use optimized placeholder system
  const placeholderImage = getOptimizedPlaceholder('medium');
  
  // Use rapper image if available and not empty, otherwise use optimized placeholder
  const imageToDisplay = rapperImageUrl && rapperImageUrl.trim() !== "" ? rapperImageUrl : placeholderImage;

  return (
    <div className={`flex-1 flex flex-row ${getContentAlignment()} ${getContentSpacing()} min-w-0`}>
      {/* Rapper Image - Always displayed with placeholder fallback */}
      <Link to={`/rapper/${item.rapper?.slug || item.rapper?.id}`} className={`${getImageSize()} rounded-lg overflow-hidden bg-rap-carbon-light/50 flex-shrink-0 hover:opacity-80 transition-opacity relative`}>
        <img 
          src={imageToDisplay}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          style={{ 
            fontSize: '0px', // Hide alt text completely
            color: 'transparent' // Make alt text invisible
          }}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            if (target.src !== placeholderImage) {
              target.src = placeholderImage;
            }
          }}
        />
        {/* Fallback content in case image completely fails */}
        <div className="absolute inset-0 bg-rap-carbon-light/80 flex items-center justify-center opacity-0 transition-opacity">
          <span className="text-rap-gold text-xs font-bold">
            {item.rapper?.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
      </Link>
      
      {/* Main Content */}
      <div className={`flex-1 min-w-0 ${isTopFive ? 'space-y-2' : isMobile ? 'space-y-1' : 'space-y-1'}`}>
        <div className={`flex items-start gap-2 flex-wrap`}>
          <Link to={`/rapper/${item.rapper?.slug || item.rapper?.id}`} className={`font-semibold ${textSizes.name} font-mogra ${isTopFive ? '' : 'leading-tight'} hover:opacity-80 transition-opacity`}>
            {item.rapper?.name}
          </Link>
          {/* Only show trending icon next to name for top 5 */}
          {isTopFive && getTrendingIcon()}
        </div>
        
        {isTopFive && (
          <>
            {(item.reason || item.rapper?.origin) && (
              <p className={`font-merienda ${textSizes.reason} text-left`}>
                {item.reason || item.rapper?.origin || 'Unknown'}
              </p>
            )}
          </>
        )}
        
        <div className={`flex items-center gap-2 text-sm justify-start`}>
          <div className="flex items-center gap-1">
            {/* For rankings 6+, show trending icon before the vote count */}
            {!isTopFive && getTrendingIcon()}
            <Star className={`w-3 h-3 ${isTopFive ? 'text-rap-gold' : 'text-rap-gold/70'}`} />
            <span className={`font-merienda ${isTopFive ? 'text-base sm:text-lg text-rap-gold font-bold' : 'text-xs text-rap-gold/70'}`}>
              {item.ranking_votes} vote{item.ranking_votes !== 1 ? 's' : ''}
              {isPending && (
                <span className="text-yellow-400 ml-1">(processing...)</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingItemContent;
