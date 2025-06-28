
import React from "react";
import { Link } from "react-router-dom";
import { Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { RankingItemWithDelta } from "@/hooks/useRankingData";
import { useIsMobile } from "@/hooks/use-mobile";

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
        votes: "text-base sm:text-lg text-rap-gold font-bold"
      };
    }
    return {
      name: "text-sm text-rap-platinum leading-tight", // Reduced from text-base for better mobile fit
      reason: "text-xs text-rap-smoke leading-tight", // Reduced from text-sm for better mobile fit
      votes: "text-xs text-rap-gold/70" // Reduced from text-sm for better mobile fit
    };
  };

  const getImageSize = () => {
    if (isTopFive) {
      return "w-20 h-20 sm:w-32 sm:h-32";
    }
    // Reduced image size for 6+ rankings on mobile to fit in shorter height
    return "w-10 h-10 sm:w-14 sm:h-14";
  };

  const getContentAlignment = () => {
    if (isTopFive && isMobile) {
      return "items-center text-center";
    }
    // Left-align for both top-5 and 6+ on desktop/tablet
    return "items-center text-left";
  };

  const getContentSpacing = () => {
    if (isTopFive) {
      // On mobile, keep centered padding; on desktop/tablet, use left margin to align after badge
      return isMobile ? "gap-3 p-2" : "gap-4 ml-20 pr-3 py-3";
    }
    // Reduced padding for 6+ rankings on mobile to fit in shorter height
    return isMobile ? "gap-2 px-2 py-1" : "gap-2 px-3 py-2";
  };

  const textSizes = getTextSizes();

  // Placeholder image from Supabase Storage - update this URL after uploading your logo
  const PLACEHOLDER_IMAGE = "https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images/spit-hierarchy-logo.png";
  
  // Use rapper image if available and not empty, otherwise use placeholder
  const imageToDisplay = rapperImageUrl && rapperImageUrl.trim() !== "" ? rapperImageUrl : PLACEHOLDER_IMAGE;

  return (
    <div className={`flex-1 flex ${isTopFive && isMobile ? 'flex-col' : 'flex-row'} ${getContentAlignment()} ${getContentSpacing()} min-w-0`}>
      {/* Rapper Image - Always displayed with placeholder fallback */}
      <Link to={`/rapper/${item.rapper?.id}`} className={`${getImageSize()} rounded-lg overflow-hidden bg-rap-carbon-light/50 flex-shrink-0 hover:opacity-80 transition-opacity`}>
        <img 
          src={imageToDisplay}
          alt={item.rapper?.name || "Rapper"}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            if (target.src !== PLACEHOLDER_IMAGE) {
              target.src = PLACEHOLDER_IMAGE;
            }
          }}
        />
      </Link>
      
      {/* Main Content */}
      <div className={`flex-1 min-w-0 ${isTopFive ? 'space-y-2' : isMobile ? 'space-y-1' : 'space-y-1'}`}>
        <div className={`flex ${isTopFive && isMobile ? 'flex-col items-center' : 'items-start'} gap-2 flex-wrap`}>
          <Link to={`/rapper/${item.rapper?.id}`} className={`font-semibold ${textSizes.name} font-mogra ${isTopFive ? '' : 'leading-tight'} hover:opacity-80 transition-opacity`}>
            {item.rapper?.name}
          </Link>
          {!isTopFive && getTrendingIcon()}
        </div>
        
        {isTopFive && (
          <>
            {getTrendingIcon()}
            {(item.reason || item.rapper?.origin) && (
              <p className={`font-merienda ${textSizes.reason} ${isMobile ? 'text-center' : 'text-left'}`}>
                {item.reason || `Origin: ${item.rapper?.origin || 'Unknown'}`}
              </p>
            )}
          </>
        )}
        
        <div className={`flex items-center gap-2 text-sm ${isTopFive && isMobile ? 'justify-center' : 'justify-start'}`}>
          <div className="flex items-center gap-1">
            <Star className={`w-3 h-3 ${isTopFive ? 'text-rap-gold' : 'text-rap-gold/70'}`} />
            <span className={`font-merienda ${textSizes.votes}`}>
              {item.ranking_votes} votes
              {isPending && (
                <span className="text-yellow-400 ml-1">(processing...)</span>
              )}
            </span>
          </div>
          
          {item.rapper?.total_votes && item.rapper.total_votes > 0 && isTopFive && (
            <div className="flex items-center gap-1">
              <span className="text-rap-smoke text-xs">Total:</span>
              <span className={`font-bold text-xs ${isTopFive ? 'text-rap-gold' : 'text-rap-gold/70'}`}>
                {item.rapper.total_votes}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingItemContent;
