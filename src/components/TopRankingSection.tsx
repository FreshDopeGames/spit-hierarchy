import React from "react";
import { Link } from "react-router-dom";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
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
  rankingSlug?: string;
}

const TopRankingSection = ({ rappers, rankingId, rankingSlug }: TopRankingSectionProps) => {
  // Component to render individual ranking card using RapperCard foundation
  const RankingCard = ({ rapper, position, isTopTwo }: { rapper: RapperWithVotes; position: number; isTopTwo: boolean }) => {
    const imageSize = isTopTwo ? 'original' : 'large';
    const { data: imageUrl } = useRapperImage(rapper.id, imageSize);
    const placeholderImage = getOptimizedPlaceholder(imageSize);
    const imageToDisplay = imageUrl && imageUrl.trim() !== "" ? imageUrl : placeholderImage;
    
    const voteCount = rankingId && rapper.ranking_votes !== undefined 
      ? rapper.ranking_votes 
      : (rapper.total_votes || 0);

    const linkTo = rankingSlug 
      ? `/rankings/official/${rankingSlug}`
      : `/rapper/${rapper.slug || rapper.id}`;

    return (
      <Link 
        to={linkTo}
        onClick={() => window.scrollTo(0, 0)}
        className="block"
      >
        <ThemedCard 
          className={cn(
            "bg-gradient-to-br from-[var(--theme-surface)] via-[var(--theme-background)] to-[var(--theme-surface)] border-[var(--theme-border)] relative overflow-hidden",
            isTopTwo ? "h-80" : "h-76"
          )}
        >
        {/* Position indicator - top left corner */}
        <div className="absolute top-3 left-3 bg-[var(--theme-primary)] text-[var(--theme-background)] rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold font-[var(--theme-font-heading)] z-10">
          {position}
        </div>
        
        <ThemedCardContent className="p-3 relative bg-gradient-to-br from-[var(--theme-surface)] via-[var(--theme-background)] to-[var(--theme-surface)]">
          {/* Rapper avatar image - smaller with padding */}
          <div className="flex flex-col items-center space-y-1">
            <img 
              src={imageToDisplay}
              alt={rapper.name || "Rapper"}
              className={cn(
                "object-cover rounded-lg border-2 border-[var(--theme-border)]",
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
               isTopTwo ? "h-20" : "h-12"
             )}>
               {/* Rapper name */}
               <h3 className={cn(
                 "font-[var(--theme-font-heading)] leading-tight font-normal text-[var(--theme-primary)]",
                 isTopTwo ? "text-xl" : "text-lg"
               )}>
                 {rapper.name}
               </h3>
               
               {/* Vote count */}
               <div className="flex items-center justify-center gap-2">
                 {voteCount === 0 ? (
                   <span className="text-sm text-[var(--theme-textMuted)] font-[var(--theme-font-body)]">No votes yet</span>
                 ) : (
                   <span className="text-sm text-[var(--theme-text)] font-[var(--theme-font-body)]">
                     {voteCount.toLocaleString()} votes
                   </span>
                 )}
               </div>
            </div>
          </div>
        </ThemedCardContent>
      </ThemedCard>
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