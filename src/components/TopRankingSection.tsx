
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { useRapperImage } from "@/hooks/useImageStyle";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";
import { Star } from "lucide-react";

type Rapper = Tables<"rappers">;

interface RapperWithVotes extends Rapper {
  ranking_votes?: number;
}

interface TopRankingSectionProps {
  rappers: RapperWithVotes[];
  rankingId?: string;
}

const TopRankingSection = ({ rappers, rankingId }: TopRankingSectionProps) => {
  
  // Component to render individual ranking card with structured layout
  const RankingCard = ({ rapper, position, isTopTwo }: { rapper: RapperWithVotes; position: number; isTopTwo: boolean }) => {
    const imageSize = isTopTwo ? 'original' : 'large';
    const { data: imageUrl } = useRapperImage(rapper.id, imageSize);
    const placeholderImage = getOptimizedPlaceholder(imageSize);
    const imageToDisplay = imageUrl && imageUrl.trim() !== "" ? imageUrl : placeholderImage;
    
    const voteCount = rankingId && rapper.ranking_votes !== undefined 
      ? rapper.ranking_votes 
      : (rapper.total_votes || 0);

    // Overall card height increased to accommodate three sections
    const cardHeight = isTopTwo ? "h-96 sm:h-112" : "h-80 sm:h-96";
    const capHeight = isTopTwo ? "h-12 sm:h-14" : "h-10 sm:h-12";
    const imageHeight = isTopTwo ? "h-64 sm:h-72" : "h-52 sm:h-64";
    const textHeight = isTopTwo ? "h-20 sm:h-26" : "h-18 sm:h-20";
    
    const rankingTextSize = isTopTwo ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl";
    const nameTextSize = isTopTwo ? "text-lg sm:text-xl" : "text-base sm:text-lg";

    return (
      <div className={`${cardHeight} overflow-hidden rounded-lg border-2 border-rap-gold min-h-[256px] sm:min-h-[384px] flex flex-col`}>
        {/* Number Cap - Top Section */}
        <div className={`${capHeight} bg-gradient-to-br from-rap-gold-dark via-rap-gold to-rap-gold-light rounded-t-lg flex items-center justify-center flex-shrink-0`}>
          <span className={`${rankingTextSize} font-mogra font-bold text-rap-carbon`}>
            {position}
          </span>
        </div>

        {/* Image Section - Middle Section - Clickable */}
        <Link
          to={`/rapper/${rapper.slug || rapper.id}`}
          aria-label={`View ${rapper.name} details`}
          className={`${imageHeight} relative overflow-hidden cursor-pointer flex-shrink-0 block`}
          style={{ touchAction: 'manipulation' }}
        >
          <img 
            src={imageToDisplay}
            alt={rapper.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
        
        {/* Text Content - Bottom Section */}
        <div className={`${textHeight} p-3 sm:p-4 bg-rap-carbon flex flex-col justify-center flex-shrink-0`}>
          <Link
            to={`/rapper/${rapper.slug || rapper.id}`}
            className="block"
          >
            <h3 className={`${nameTextSize} font-mogra text-white leading-tight mb-1 hover:text-rap-gold transition-colors`}>
              {rapper.name}
            </h3>
            
            {rapper.origin && (
              <p className="text-rap-silver text-xs sm:text-sm font-kaushan mb-1 line-clamp-1">
                {rapper.origin}
              </p>
            )}
            
            <div className="flex items-center gap-1">
              {voteCount === 0 ? (
                <>
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-rap-gold/70" />
                  <span className="text-rap-gold/70 font-kaushan text-xs italic">
                    Vote to rank
                  </span>
                </>
              ) : (
                <p className="text-rap-silver text-xs sm:text-sm font-bold">
                  Votes: {voteCount.toLocaleString()}
                </p>
              )}
            </div>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 px-2 sm:px-0">
      {/* Top 2 Cards - Larger and More Prominent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-8">
        {rappers.slice(0, 2).map((rapper, index) => (
          <RankingCard 
            key={rapper.id}
            rapper={rapper}
            position={index + 1}
            isTopTwo={true}
          />
        ))}
      </div>
      
      {/* Cards 3-5 - Smaller Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-6">
        {rappers.slice(2, 5).map((rapper, index) => (
          <RankingCard 
            key={rapper.id}
            rapper={rapper}
            position={index + 3}
            isTopTwo={false}
          />
        ))}
      </div>
    </div>
  );
};

export default TopRankingSection;
