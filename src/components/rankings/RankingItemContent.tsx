
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
  const delta = item.position_delta || 0;
  
  const getTrendingIcon = () => {
    if (delta < 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (delta > 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTextSizes = () => {
    if (isTopFive) {
      return {
        name: "text-2xl md:text-3xl lg:text-4xl",
        location: "text-lg md:text-xl",
        votes: "text-base md:text-lg"
      };
    }
    return {
      name: "text-lg md:text-xl",
      location: "text-sm md:text-base",
      votes: "text-xs md:text-sm"
    };
  };

  const textSizes = getTextSizes();

  // Use optimized placeholder system
  const placeholderImage = getOptimizedPlaceholder('large');
  
  // Use rapper image if available and not empty, otherwise use optimized placeholder
  const imageToDisplay = rapperImageUrl && rapperImageUrl.trim() !== "" ? rapperImageUrl : placeholderImage;

  return (
    <>
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={imageToDisplay}
          alt=""
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            if (target.src !== placeholderImage) {
              target.src = placeholderImage;
            }
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
      </div>

      {/* Content Overlay - Lower Third */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 md:p-6">
        <Link 
          to={`/rapper/${item.rapper?.slug || item.rapper?.id}`} 
          className="block group-hover:scale-105 transition-transform duration-300"
        >
          {/* Rapper Name */}
          <h3 className={`font-mogra font-bold text-white drop-shadow-2xl ${textSizes.name} mb-2 leading-tight`}>
            {item.rapper?.name}
          </h3>
          
          {/* Location/Origin */}
          {item.rapper?.origin && (
            <p className={`font-merienda text-white/90 drop-shadow-lg ${textSizes.location} mb-3`}>
              {item.rapper?.origin}
            </p>
          )}
          
          {/* Vote Count with Trending */}
          <div className="flex items-center gap-2">
            {getTrendingIcon()}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-rap-gold drop-shadow-lg" />
              <span className={`font-merienda font-bold text-rap-gold drop-shadow-lg ${textSizes.votes}`}>
                {item.ranking_votes} vote{item.ranking_votes !== 1 ? 's' : ''}
                {isPending && (
                  <span className="text-yellow-400 ml-1">(processing...)</span>
                )}
              </span>
            </div>
          </div>

          {/* Reason/Description for Top 5 */}
          {isTopFive && item.reason && (
            <p className="font-merienda text-white/80 text-sm md:text-base mt-2 line-clamp-2 drop-shadow-lg">
              {item.reason}
            </p>
          )}
        </Link>
      </div>
    </>
  );
};

export default RankingItemContent;
