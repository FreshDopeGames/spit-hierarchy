import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { useRapperImage } from "@/hooks/useImageStyle";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";
import { cn } from "@/lib/utils";

type Rapper = Tables<"rappers">;

interface RapperWithVotes extends Rapper {
  ranking_votes?: number;
}

interface TopRankingSectionProps {
  rappers: RapperWithVotes[];
  rankingId?: string;
}

const TopRankingSection = ({ rappers, rankingId }: TopRankingSectionProps) => {
  // Component to render individual ranking card using RapperCard foundation
  const RankingCard = ({ rapper, position, isTopTwo }: { rapper: RapperWithVotes; position: number; isTopTwo: boolean }) => {
    const imageSize = isTopTwo ? 'original' : 'large';
    const { data: imageUrl } = useRapperImage(rapper.id, imageSize);
    const placeholderImage = getOptimizedPlaceholder(imageSize);
    const imageToDisplay = imageUrl && imageUrl.trim() !== "" ? imageUrl : placeholderImage;
    
    const voteCount = rankingId && rapper.ranking_votes !== undefined 
      ? rapper.ranking_votes 
      : (rapper.total_votes || 0);

    return (
      <Link 
        to={`/rapper/${rapper.slug || rapper.id}`}
        onClick={() => window.scrollTo(0, 0)}
        className="block"
      >
        <Card 
          className={cn(
            "bg-gradient-to-br from-black via-rap-carbon to-rap-carbon-light border-rap-gold/40 hover:border-rap-gold/70 transition-all duration-300 hover:transform hover:scale-105 focus:transform focus:scale-100 active:transform active:scale-100 relative overflow-hidden group",
            isTopTwo ? "h-80" : "h-64"
          )}
        >
        {/* Rap culture accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-rap-gold"></div>
        
        {/* Position indicator - top right corner */}
        <div className="absolute top-3 right-3 bg-rap-gold text-rap-carbon rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold font-mogra z-10">
          {position}
        </div>
        
        <CardContent className="p-0 h-full relative">
          {/* Rapper avatar image - full card background */}
          <div className="w-full h-full bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-charcoal rounded-lg flex items-center justify-center relative group-hover:from-rap-burgundy/20 group-hover:via-rap-forest/20 group-hover:to-rap-charcoal transition-all duration-300 overflow-hidden">
            <img 
              src={imageToDisplay}
              alt={rapper.name || "Rapper"}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback to optimized placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                if (!target.src.includes(placeholderImage)) {
                  target.src = placeholderImage;
                }
              }}
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </div>

          {/* Rapper info - positioned at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="space-y-2">
              {/* Rapper name */}
              <h3 className={cn(
                "font-mogra leading-tight font-normal text-rap-gold truncate",
                isTopTwo ? "text-xl" : "text-lg"
              )}>
                {rapper.name}
              </h3>
              
              {/* Vote count */}
              <div className="flex items-center gap-2">
                {voteCount === 0 ? (
                  <span className="text-sm text-rap-smoke font-kaushan">No votes yet</span>
                ) : (
                  <span className="text-sm text-rap-platinum font-kaushan">
                    {voteCount.toLocaleString()} votes
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </Link>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 px-2 sm:px-0">
      {/* Top 2 Cards - Larger and More Prominent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-8 pb-4 sm:pb-6">
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