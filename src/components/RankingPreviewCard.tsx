import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Users, Award } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";

type Rapper = Tables<"rappers">;
type OfficialRanking = Tables<"official_rankings">;

interface RankingItem {
  rapper: Rapper;
  position: number;
  votes?: number;
}

interface RankingPreviewCardProps {
  ranking: OfficialRanking;
  items: RankingItem[];
  totalVotes?: number;
}

const RankingPreviewCard = ({ ranking, items, totalVotes = 0 }: RankingPreviewCardProps) => {
  // Get the top rapper's image for the background, fallback to placeholder
  const backgroundImage = items[0]?.rapper.image_url || getOptimizedPlaceholder('original');
  
  // Create a collage effect by showing multiple rapper images if available
  const topRappers = items.slice(0, 3);
  
  return (
    <Link 
      to={`/rankings/official/${ranking.slug}`}
      className="block group"
      onClick={() => window.scrollTo(0, 0)}
    >
      <div className="relative h-[300px] sm:h-[350px] md:h-[400px] rounded-xl overflow-hidden border border-rap-gold/30 group-hover:border-rap-gold/60 transition-all duration-300 group-hover:scale-[1.02] shadow-lg group-hover:shadow-xl shadow-black/20 group-hover:shadow-rap-gold/20">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={backgroundImage}
            alt={ranking.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes(getOptimizedPlaceholder('original'))) {
                target.src = getOptimizedPlaceholder('original');
              }
            }}
          />
        </div>
        
        {/* Gradient Overlay - darker than BlogCarousel for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
        
        {/* Top Rappers Mini Gallery */}
        {topRappers.length > 1 && (
          <div className="absolute top-4 right-4 flex -space-x-2">
            {topRappers.slice(1).map((item, index) => (
              <div 
                key={item.rapper.id}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/30 overflow-hidden bg-rap-carbon"
                style={{ zIndex: topRappers.length - index }}
              >
                <img 
                  src={item.rapper.image_url || getOptimizedPlaceholder('thumb')}
                  alt={item.rapper.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getOptimizedPlaceholder('thumb');
                  }}
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          {/* Category Badge */}
          <div className="mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-mogra bg-rap-gold/20 text-rap-gold border border-rap-gold/30 backdrop-blur-sm">
              {ranking.category}
            </span>
          </div>
          
          {/* Title */}
          <h3 className="text-xl sm:text-2xl md:text-3xl font-ceviche text-white mb-2 sm:mb-3 leading-tight drop-shadow-[2px_2px_8px_rgba(0,0,0,0.8)] group-hover:text-rap-gold transition-colors duration-300">
            {ranking.title}
          </h3>
          
          {/* Description */}
          {ranking.description && (
            <p className="text-rap-silver text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2 drop-shadow-[1px_1px_4px_rgba(0,0,0,0.8)]">
              {ranking.description}
            </p>
          )}
          
          {/* Stats Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 text-rap-smoke">
                <Users className="w-4 h-4" />
                <span>{items.length} Rappers</span>
              </div>
              {totalVotes > 0 && (
                <div className="flex items-center gap-1 text-rap-smoke">
                  <TrendingUp className="w-4 h-4" />
                  <span>{totalVotes.toLocaleString()} Votes</span>
                </div>
              )}
            </div>
            
            {/* View Ranking CTA */}
            <div className="flex items-center gap-1 text-rap-gold group-hover:text-rap-gold-light transition-colors duration-300 text-xs sm:text-sm font-kaushan">
              <Award className="w-4 h-4" />
              <span>View Ranking</span>
            </div>
          </div>
        </div>
        
        {/* Hover State Overlay */}
        <div className="absolute inset-0 bg-rap-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Link>
  );
};

export default RankingPreviewCard;