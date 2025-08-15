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
            isTopTwo ? "h-80" : "h-72"
          )}
        >
        {/* Position indicator - top left corner */}
        <div className="absolute top-3 left-3 bg-rap-gold text-rap-carbon rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold font-mogra z-10">
          {position}
        </div>
        
        <CardContent className="p-3 relative bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-charcoal group-hover:from-rap-burgundy/20 group-hover:via-rap-forest/20 group-hover:to-rap-charcoal transition-all duration-300">
          {/* Rapper avatar image - smaller with padding */}
          <div className="flex flex-col items-center space-y-1">
            <img 
              src={imageToDisplay}
              alt={rapper.name || "Rapper"}
              className={cn(
                "object-cover rounded-lg border-2 border-rap-gold/30",
                isTopTwo ? "w-64 h-64" : "w-48 h-48"
              )}
              loading="lazy"
              onError={(e) => {
                // Fallback to optimized placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                if (!target.src.includes(placeholderImage)) {
                  target.src = placeholderImage;
                }
              }}
            />
            
            {/* Rapper info - positioned below image */}
            <div className={cn(
              "text-center space-y-1 flex flex-col justify-start",
              isTopTwo ? "h-16" : "h-12"
            )}>
              {/* Rapper name */}
              <h3 className={cn(
                "font-mogra leading-tight font-normal text-rap-gold",
                isTopTwo ? "text-xl" : "text-lg"
              )}>
                {rapper.name}
              </h3>
              
              {/* Vote count */}
              <div className="flex items-center justify-center gap-2">
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