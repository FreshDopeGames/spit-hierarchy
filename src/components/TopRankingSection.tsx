
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { useRapperImage } from "@/hooks/useImageStyle";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";
import { Star, MapPin } from "lucide-react";

type Rapper = Tables<"rappers">;

interface RapperWithVotes extends Rapper {
  ranking_votes?: number;
}

interface TopRankingSectionProps {
  rappers: RapperWithVotes[];
  rankingId?: string;
}

const TopRankingSection = ({ rappers, rankingId }: TopRankingSectionProps) => {
  const navigate = useNavigate();
  
  // Component to render individual ranking card with background image
  const RankingCard = ({ rapper, position, isTopTwo }: { rapper: RapperWithVotes; position: number; isTopTwo: boolean }) => {
    const imageSize = isTopTwo ? 'original' : 'large';
    const { data: imageUrl } = useRapperImage(rapper.id, imageSize);
    const placeholderImage = getOptimizedPlaceholder(imageSize);
    const backgroundImage = imageUrl && imageUrl.trim() !== "" ? imageUrl : placeholderImage;
    
    const voteCount = rankingId && rapper.ranking_votes !== undefined 
      ? rapper.ranking_votes 
      : (rapper.total_votes || 0);

    const cardHeight = isTopTwo ? "h-80 sm:h-96" : "h-64 sm:h-72";
    const rankingTextSize = isTopTwo ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl";
    const nameTextSize = isTopTwo ? "text-xl sm:text-2xl" : "text-lg sm:text-xl";

    const handleClick = (e: React.MouseEvent) => {
      console.log('🎯 TopRankingSection card clicked!', {
        rapperId: rapper.id,
        rapperSlug: rapper.slug,
        rapperName: rapper.name,
        navigationPath: `/rapper/${rapper.slug || rapper.id}`,
        eventType: 'click',
        target: e.target,
        currentTarget: e.currentTarget
      });

      // Validate rapper data
      if (!rapper.id && !rapper.slug) {
        console.error('❌ No rapper ID or slug available for navigation');
        return;
      }

      try {
        window.scrollTo(0, 0);
        const path = `/rapper/${rapper.slug || rapper.id}`;
        console.log('🚀 Navigating to:', path);
        navigate(path);
      } catch (error) {
        console.error('❌ Navigation failed, trying fallback:', error);
        // Fallback to window.location
        window.location.href = `/rapper/${rapper.slug || rapper.id}`;
      }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      console.log('🖱️ TopRankingSection card mouse down!', {
        rapperId: rapper.id,
        eventType: 'mousedown'
      });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(e as any);
      }
    };

    return (
      <div 
        className={`block cursor-pointer pointer-events-auto ${cardHeight} relative overflow-hidden rounded-lg border border-rap-gold z-50`}
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          pointerEvents: 'auto'
        }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`View ${rapper.name} profile`}
      >
        {/* Ranking Number - Top Left */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-rap-gold-dark via-rap-gold to-rap-gold-light shadow-lg border-2 border-black/20 pointer-events-none">
            <span className={`${rankingTextSize} font-mogra font-bold text-rap-carbon`}>
              {position}
            </span>
          </div>
        </div>

        {/* Gradient Overlay - Bottom Third */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" />
        
        {/* Content - Bottom Area */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 pointer-events-none">
          <div className="text-white">
            <h3 className={`${nameTextSize} font-mogra text-white leading-tight mb-2`}>
              {rapper.name}
            </h3>
            
            {rapper.origin && (
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-rap-silver flex-shrink-0" />
                <p className="text-rap-silver text-sm sm:text-base font-kaushan">
                  {rapper.origin}
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {voteCount === 0 ? (
                <>
                  <Star className="w-4 h-4 text-rap-gold/70" />
                  <span className="text-rap-gold/70 font-kaushan text-sm italic">
                    Vote to rank
                  </span>
                </>
              ) : (
                <p className="text-rap-silver text-sm sm:text-base font-bold">
                  Votes: {voteCount.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top 2 Cards - Larger and More Prominent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
