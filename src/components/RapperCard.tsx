
import React from "react";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { Verified, MapPin, Calendar, Crown, Vote } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { formatBirthdate } from "@/utils/zodiacUtils";
import { useNavigationState } from "@/hooks/useNavigationState";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";

type Rapper = Tables<"rappers">;

interface RapperCardProps {
  rapper: Rapper;
  imageUrl?: string | null;
  stats?: { top5_count: number; ranking_votes: number };
  currentPage?: number;
  position?: number;
  compact?: boolean;
}

const RapperCard = ({
  rapper,
  imageUrl,
  stats,
  currentPage = 1,
  position,
  compact = false
}: RapperCardProps) => {
  const { navigateToRapper } = useNavigationState();
  const birthdate = formatBirthdate(rapper.birth_year, rapper.birth_month, rapper.birth_day);
  
  // Convert average_rating from 1-10 scale to 0-100 scale to match detail page
  const overallRating = rapper.average_rating 
    ? Math.round((Number(rapper.average_rating) / 10) * 100) 
    : 0;

  // Use optimized placeholder based on compact mode
  const placeholderSize = compact ? 'medium' : 'large';
  const placeholderImage = getOptimizedPlaceholder(placeholderSize);
  
  // Use rapper image if available and not empty, otherwise use optimized placeholder
  const imageToDisplay = imageUrl && imageUrl.trim() !== "" ? imageUrl : placeholderImage;
  
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateToRapper(rapper.slug || rapper.id, currentPage);
  };
  
  return (
    <ThemedCard 
      className="bg-gradient-to-br from-[#0D0D0D] to-[#1A1A1A] border-4 border-[hsl(var(--theme-primary))]/40 hover:border-[hsl(var(--theme-primary))]/70 transition-all duration-300 hover:transform hover:scale-105 focus:transform focus:scale-100 active:transform active:scale-100 cursor-pointer relative overflow-hidden group"
      onClick={handleCardClick}
    >
      {/* Theme accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[var(--theme-primary)]"></div>
      
      {/* Position indicator for ranked items */}
      {position && (
        <div className="absolute top-2 right-2 bg-[var(--theme-primary)] text-[var(--theme-background)] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold font-[var(--theme-fontPrimary)] z-10">
          {position}
        </div>
      )}
      
      <ThemedCardContent className={compact ? "p-4" : "p-6"}>
        {/* Rapper image or placeholder - 1:1 aspect ratio */}
        <div className={`w-full aspect-square bg-gradient-to-br from-[var(--theme-surface)] via-[var(--theme-backgroundLight)] to-[var(--theme-background)] rounded-lg ${compact ? "mb-3" : "mb-4"} flex items-center justify-center relative group-hover:from-[var(--theme-accent)]/20 group-hover:via-[var(--theme-secondary)]/20 group-hover:to-[var(--theme-background)] transition-all duration-300 overflow-hidden`}>
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
        </div>

        {/* Rapper Info */}
        <div className={compact ? "space-y-2" : "space-y-3"}>
          <div className="flex items-start justify-between">
            <h3 className={`font-[var(--theme-fontPrimary)] ${compact ? "text-base" : "text-lg"} leading-tight transition-colors font-normal text-[var(--theme-primary)]`}>{rapper.name}</h3>
            {rapper.verified && <Verified className="w-5 h-5 text-[var(--theme-secondary)] flex-shrink-0" />}
          </div>

          

          {!compact && (
            <div className="flex flex-wrap gap-2 text-xs">
              {rapper.origin && (
                <div className="flex items-center gap-1 text-[var(--theme-text)] bg-[var(--theme-surface)]/60 px-2 py-1 rounded-full font-[var(--theme-fontSecondary)]">
                  <MapPin className="w-3 h-3" />
                  <span>{rapper.origin}</span>
                </div>
              )}
              {birthdate && (
                <div className="flex items-center gap-1 text-[var(--theme-text)] bg-[var(--theme-surface)]/60 px-2 py-1 rounded-full font-[var(--theme-fontSecondary)]">
                  <Calendar className="w-3 h-3" />
                  <span>{birthdate}</span>
                </div>
              )}
            </div>
          )}

          {/* Three Equal-Height Stat Indicators */}
          {!compact && (
            <div className="grid grid-cols-3 gap-2">
              {/* Overall Rating */}
              <div className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary)]/80 px-2 py-2 rounded-lg border border-[var(--theme-border)] text-center">
                <div className="text-[var(--theme-textLight)] font-bold text-lg font-[var(--theme-fontPrimary)] leading-none">
                  {overallRating}
                </div>
                <div className="text-[var(--theme-textLight)]/70 text-xs font-[var(--theme-fontSecondary)] mt-1">
                  Overall
                </div>
              </div>

              {/* Top 5 Count */}
              <div className="bg-gradient-to-r from-[var(--theme-accent)]/30 to-[var(--theme-secondary)]/30 px-2 py-2 rounded-lg border border-[var(--theme-border)] text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Crown className="w-4 h-4 text-[var(--theme-primary)]" />
                  <span className="text-[var(--theme-text)] font-bold text-lg font-[var(--theme-fontPrimary)] leading-none">
                    {stats?.top5_count || 0}
                  </span>
                </div>
                <div className="text-[var(--theme-textMuted)] text-xs font-[var(--theme-fontSecondary)]">
                  Top 5s
                </div>
              </div>

              {/* Ranking Votes */}
              <div className="bg-gradient-to-r from-[var(--theme-secondary)]/30 to-[var(--theme-accent)]/30 px-2 py-2 rounded-lg border border-[var(--theme-border)] text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Vote className="w-4 h-4 text-[var(--theme-secondary)]" />
                  <span className="text-[var(--theme-text)] font-bold text-lg font-[var(--theme-fontPrimary)] leading-none">
                    {stats?.ranking_votes || 0}
                  </span>
                </div>
                <div className="text-[var(--theme-textMuted)] text-xs font-[var(--theme-fontSecondary)]">
                  Votes
                </div>
              </div>
            </div>
          )}
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default RapperCard;
