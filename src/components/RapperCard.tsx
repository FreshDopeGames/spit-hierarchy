
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
    navigateToRapper(rapper.id, currentPage);
  };
  
  return (
    <Card 
      className="bg-gradient-to-br from-black via-rap-carbon to-rap-carbon-light border-rap-gold/40 hover:border-rap-gold/70 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer relative overflow-hidden group"
      onClick={handleCardClick}
    >
      {/* Rap culture accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-rap-gold"></div>
      
      {/* Position indicator for ranked items */}
      {position && (
        <div className="absolute top-2 right-2 bg-rap-gold text-rap-carbon rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold font-mogra z-10">
          {position}
        </div>
      )}
      
      <CardContent className={compact ? "p-4" : "p-6"}>
        {/* Rapper image or placeholder - 1:1 aspect ratio */}
        <div className={`w-full aspect-square bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-charcoal rounded-lg ${compact ? "mb-3" : "mb-4"} flex items-center justify-center relative group-hover:from-rap-burgundy/20 group-hover:via-rap-forest/20 group-hover:to-rap-charcoal transition-all duration-300 overflow-hidden`}>
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
            <h3 className={`font-mogra ${compact ? "text-base" : "text-lg"} leading-tight transition-colors font-normal text-rap-gold`}>{rapper.name}</h3>
            {rapper.verified && <Verified className="w-5 h-5 text-rap-forest flex-shrink-0" />}
          </div>

          {rapper.real_name && <p className="text-rap-smoke text-sm font-medium font-kaushan">{rapper.real_name}</p>}

          {!compact && (
            <div className="flex flex-wrap gap-2 text-xs">
              {rapper.origin && (
                <div className="flex items-center gap-1 text-rap-platinum bg-rap-carbon/60 px-2 py-1 rounded-full font-kaushan">
                  <MapPin className="w-3 h-3" />
                  <span>{rapper.origin}</span>
                </div>
              )}
              {birthdate && (
                <div className="flex items-center gap-1 text-rap-platinum bg-rap-carbon/60 px-2 py-1 rounded-full font-kaushan">
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
              <div className="bg-gradient-to-r from-rap-gold-dark to-rap-gold-light px-2 py-2 rounded-lg border border-rap-silver/20 text-center">
                <div className="text-rap-carbon font-bold text-lg font-mogra leading-none">
                  {overallRating}
                </div>
                <div className="text-rap-carbon/70 text-xs font-kaushan mt-1">
                  Overall
                </div>
              </div>

              {/* Top 5 Count */}
              <div className="bg-gradient-to-r from-rap-burgundy/30 to-rap-forest/30 px-2 py-2 rounded-lg border border-rap-silver/20 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Crown className="w-4 h-4 text-rap-gold" />
                  <span className="text-rap-platinum font-bold text-lg font-mogra leading-none">
                    {stats?.top5_count || 0}
                  </span>
                </div>
                <div className="text-rap-smoke text-xs font-kaushan">
                  Top 5s
                </div>
              </div>

              {/* Ranking Votes */}
              <div className="bg-gradient-to-r from-rap-forest/30 to-rap-burgundy/30 px-2 py-2 rounded-lg border border-rap-silver/20 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Vote className="w-4 h-4 text-rap-silver" />
                  <span className="text-rap-platinum font-bold text-lg font-mogra leading-none">
                    {stats?.ranking_votes || 0}
                  </span>
                </div>
                <div className="text-rap-smoke text-xs font-kaushan">
                  Votes
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RapperCard;
