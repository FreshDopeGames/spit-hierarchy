import { Link } from "react-router-dom";
import { TrendingUp, Users, Award, User } from "lucide-react";
import { UnifiedRanking } from "@/types/rankings";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";
import EnhancedImage from "@/components/ui/EnhancedImage";

interface RankingCardProps {
  ranking: UnifiedRanking;
  isUserRanking?: boolean;
}

const RankingCard = ({
  ranking,
  isUserRanking = false
}: RankingCardProps) => {
  // Get the top 5 rappers for the mosaic
  const topFiveRappers = ranking.rappers?.slice(0, 5) || [];
  
  // Split into top row (2 images) and bottom row (3 images)
  const topRowRappers = topFiveRappers.slice(0, 2);
  const bottomRowRappers = topFiveRappers.slice(2, 5);
  
  // Construct the proper link based on ranking type
  const rankingLink = isUserRanking && !ranking.isOfficial ? `/rankings/community-rankings/${ranking.slug}` : `/rankings/official/${ranking.slug}`;
  
  return (
    <Link 
      to={rankingLink} 
      className="block group"
      onClick={() => window.scrollTo(0, 0)}
    >
      <div 
        className="relative h-[380px] sm:h-[430px] md:h-[480px] overflow-hidden transition-all duration-300 group-hover:scale-[1.02]"
        style={{
          borderRadius: 'var(--theme-element-ranking_card-border-radius, 12px)',
          border: `var(--theme-element-ranking_card-border-width, 4px) var(--theme-element-ranking_card-border-style, solid) hsl(var(--theme-primary))`,
          backgroundColor: 'var(--theme-element-ranking_card-bg, #1A1A1A)',
          boxShadow: 'var(--theme-element-ranking_card-shadow, 0 4px 6px rgba(0, 0, 0, 0.2))'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = 'var(--theme-element-ranking_card-hover-shadow, 0 10px 25px rgba(212, 175, 55, 0.2))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'var(--theme-element-ranking_card-shadow, 0 4px 6px rgba(0, 0, 0, 0.2))';
        }}
      >
        {/* Rapper Mosaic Background - Top portion of card */}
        <div className="absolute inset-0 h-[43%] grid grid-rows-2 gap-0 group-hover:scale-105 transition-transform duration-500">
          {/* Top Row - 2 Images */}
          <div className="grid grid-cols-2">
            {topRowRappers.map((rapper) => (
              <div 
                key={rapper.id} 
                className="relative aspect-[3/2] overflow-hidden"
                style={{
                  border: `var(--theme-element-ranking_card_avatar_border-border-width, 3px) var(--theme-element-ranking_card_avatar_border-border-style, solid) var(--theme-element-ranking_card_avatar_border-border-color, #000000)`
                }}
              >
                <EnhancedImage 
                  src={rapper.image_url || getOptimizedPlaceholder('thumb')}
                  alt={rapper.name}
                  size="thumb"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getOptimizedPlaceholder('thumb');
                  }}
                />
              </div>
            ))}
            {/* Fill empty spots if less than 2 rappers */}
            {Array.from({ length: 2 - topRowRappers.length }).map((_, index) => (
              <div 
                key={`top-placeholder-${index}`} 
                className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40"
                style={{
                  border: `var(--theme-element-ranking_card_avatar_border-border-width, 3px) var(--theme-element-ranking_card_avatar_border-border-style, solid) var(--theme-element-ranking_card_avatar_border-border-color, #000000)`
                }}
              >
                <EnhancedImage 
                  src={getOptimizedPlaceholder('thumb')}
                  alt="Placeholder"
                  className="opacity-30"
                  size="thumb"
                />
              </div>
            ))}
          </div>
          
          {/* Bottom Row - 3 Images */}
          <div className="grid grid-cols-3">
            {bottomRowRappers.map((rapper) => (
              <div 
                key={rapper.id} 
                className="relative aspect-[3/2] overflow-hidden"
                style={{
                  border: `var(--theme-element-ranking_card_avatar_border-border-width, 3px) var(--theme-element-ranking_card_avatar_border-border-style, solid) var(--theme-element-ranking_card_avatar_border-border-color, #000000)`
                }}
              >
                <EnhancedImage 
                  src={rapper.image_url || getOptimizedPlaceholder('thumb')}
                  alt={rapper.name}
                  size="thumb"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getOptimizedPlaceholder('thumb');
                  }}
                />
              </div>
            ))}
            {/* Fill empty spots if less than 3 rappers in bottom row */}
            {Array.from({ length: 3 - bottomRowRappers.length }).map((_, index) => (
              <div 
                key={`bottom-placeholder-${index}`} 
                className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40"
                style={{
                  border: `var(--theme-element-ranking_card_avatar_border-border-width, 3px) var(--theme-element-ranking_card_avatar_border-border-style, solid) var(--theme-element-ranking_card_avatar_border-border-color, #000000)`
                }}
              >
                <EnhancedImage 
                  src={getOptimizedPlaceholder('thumb')}
                  alt="Placeholder"
                  className="opacity-30"
                  size="thumb"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Gradient Overlay - Bottom area for text */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[57%]"
          style={{
            background: 'var(--theme-element-ranking_card-overlay, linear-gradient(to top, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.8), transparent))'
          }}
        />
        
        {/* Content - Positioned in bottom area */}
        <div className="absolute bottom-0 left-0 right-0 h-[57%] flex flex-col justify-center p-4 sm:p-6">
          {/* Category Badge */}
          <div className="mb-1">
            <span 
              className="inline-flex items-center backdrop-blur-sm"
              style={{
                backgroundColor: 'var(--theme-element-ranking_card_category_badge-bg, rgba(212, 175, 55, 0.2))',
                color: 'var(--theme-element-ranking_card_category_badge-color, #D4AF37)',
                border: `var(--theme-element-ranking_card_category_badge-border-width, 1px) var(--theme-element-ranking_card_category_badge-border-style, solid) var(--theme-element-ranking_card_category_badge-border-color, rgba(212, 175, 55, 0.3))`,
                borderRadius: 'var(--theme-element-ranking_card_category_badge-border-radius, 999px)',
                padding: 'var(--theme-element-ranking_card_category_badge-padding, 0.5rem 0.75rem)',
                fontSize: 'var(--theme-element-ranking_card_category_badge-font-size, 0.75rem)',
                fontWeight: 'var(--theme-element-ranking_card_category_badge-font-weight, 600)',
                lineHeight: 'var(--theme-element-ranking_card_category_badge-line-height, 1)'
              }}
            >
              {ranking.isOfficial ? ranking.category : 'Community'}
            </span>
          </div>
          
          {/* Title */}
          <h3 
            className="text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-3 leading-tight transition-colors duration-300 group-hover:[color:var(--theme-element-ranking_card_title-hover-color,var(--theme-primary))]"
            style={{
              fontFamily: 'var(--theme-font-heading)',
              color: 'var(--theme-element-ranking_card_title-color, #FFFFFF)',
              fontSize: 'var(--theme-element-ranking_card_title-font-size, 1.875rem)',
              fontWeight: 'var(--theme-element-ranking_card_title-font-weight, 700)',
              lineHeight: 'var(--theme-element-ranking_card_title-line-height, 1.2)',
              textShadow: 'var(--theme-element-ranking_card_title-shadow, 2px 2px 8px rgba(0, 0, 0, 0.8))'
            }}
          >
            {ranking.title}
          </h3>
          
          {/* Description */}
          {ranking.description && (
            <p 
              className="text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2"
              style={{
                color: 'var(--theme-element-ranking_card_description-color, #BFBFBF)',
                fontSize: 'var(--theme-element-ranking_card_description-font-size, 0.875rem)',
                fontWeight: 'var(--theme-element-ranking_card_description-font-weight, 400)',
                lineHeight: 'var(--theme-element-ranking_card_description-line-height, 1.5)',
                textShadow: 'var(--theme-element-ranking_card_description-shadow, 1px 1px 4px rgba(0, 0, 0, 0.8))'
              }}
            >
              {ranking.description}
            </p>
          )}
          
          {/* Author for Community Rankings */}
          {!ranking.isOfficial && ranking.author && (
            <div 
              className="flex items-center gap-1 text-xs sm:text-sm mb-2"
              style={{
                color: 'var(--theme-element-ranking_card_stats-color, #BFBFBF)',
                fontSize: 'var(--theme-element-ranking_card_stats-font-size, 0.75rem)',
                fontWeight: 'var(--theme-element-ranking_card_stats-font-weight, 400)',
                lineHeight: 'var(--theme-element-ranking_card_stats-line-height, 1.25)'
              }}
            >
              <User className="w-4 h-4" />
              <span>by {ranking.author}</span>
            </div>
          )}
          
          {/* Stats Row */}
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-1 text-xs sm:text-sm"
              style={{
                color: 'var(--theme-element-ranking_card_stats-color, #BFBFBF)',
                fontSize: 'var(--theme-element-ranking_card_stats-font-size, 0.75rem)',
                fontWeight: 'var(--theme-element-ranking_card_stats-font-weight, 400)',
                lineHeight: 'var(--theme-element-ranking_card_stats-line-height, 1.25)'
              }}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{(ranking.totalVotes || 0).toLocaleString()} Votes</span>
            </div>
            
            {/* View Ranking CTA */}
            <div 
              className="flex items-center gap-1 text-xs sm:text-sm transition-colors duration-300 group-hover:opacity-80"
              style={{
                color: 'hsl(var(--theme-primary))',
                fontFamily: 'var(--theme-font-body)',
                fontSize: 'var(--theme-element-ranking_card_cta-font-size, 0.75rem)',
                fontWeight: 'var(--theme-element-ranking_card_cta-font-weight, 500)',
                lineHeight: 'var(--theme-element-ranking_card_cta-line-height, 1.25)'
              }}
            >
              <Award className="w-4 h-4" />
              <span>View Ranking</span>
            </div>
          </div>
        </div>
        
        {/* Hover State Overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'var(--theme-element-ranking_card-hover-overlay, rgba(212, 175, 55, 0.05))'
          }}
        />
      </div>
    </Link>
  );
};

export default RankingCard;