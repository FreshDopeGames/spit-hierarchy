
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { useRapperImage } from "@/hooks/useImageStyle";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";
import { Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  
  // Component to render individual ranking card with structured layout
  const RankingCard = ({ rapper, position, isTopTwo }: { rapper: RapperWithVotes; position: number; isTopTwo: boolean }) => {
    const imageSize = isTopTwo ? 'original' : 'large';
    const { data: imageUrl } = useRapperImage(rapper.id, imageSize);
    const placeholderImage = getOptimizedPlaceholder(imageSize);
    const imageToDisplay = imageUrl && imageUrl.trim() !== "" ? imageUrl : placeholderImage;
    
    const voteCount = rankingId && rapper.ranking_votes !== undefined 
      ? rapper.ranking_votes 
      : (rapper.total_votes || 0);

    // Card dimensions
    const cardHeight = isTopTwo ? "h-96 sm:h-112" : "h-80 sm:h-96";
    const imageHeight = isTopTwo ? "h-64 sm:h-72" : "h-52 sm:h-64";
    
    const rankingTextSize = isTopTwo ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl";
    const nameTextSize = isTopTwo ? "text-lg sm:text-xl" : "text-base sm:text-lg";

    const rapperUrl = `/rapper/${rapper.slug || rapper.id}`;
    
    // Debug logging
    console.log('Rapper card data:', { 
      name: rapper.name, 
      slug: rapper.slug, 
      id: rapper.id, 
      url: rapperUrl 
    });

    return (
      <div
        className={`${cardHeight} overflow-hidden rounded-lg border-2 border-rap-gold bg-carbon-gradient min-h-[256px] sm:min-h-[384px] flex flex-col`}
      >
        {/* Image Section */}
        <div className={`${imageHeight} relative overflow-hidden flex-shrink-0`}>
          <img 
            src={imageToDisplay}
            alt={rapper.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        
        {/* Text Content Section */}
        <div className={`flex-1 ${isTopTwo ? 'p-2 sm:p-3' : 'p-2 sm:p-2'} flex items-center gap-3 sm:gap-4`}>
          <div className={`flex-shrink-0 ${isTopTwo ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-10 h-10 sm:w-12 sm:h-12'} bg-gradient-to-br from-rap-gold-dark via-rap-gold to-rap-gold-light rounded-lg flex items-center justify-center`}>
            <span className={`${rankingTextSize} font-mogra font-bold text-rap-carbon leading-none`}>
              {position}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`${nameTextSize} font-mogra text-white leading-tight mb-1 truncate`}>
              {rapper.name}
            </h3>
            <div className="flex items-center gap-1 mb-2">
              {voteCount === 0 ? (
                <>
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-rap-gold/70" />
                  <span className="text-rap-gold/70 font-kaushan text-xs italic">Vote to rank</span>
                </>
              ) : (
                <p className="text-rap-silver text-xs sm:text-sm font-bold">Votes: {voteCount.toLocaleString()}</p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button 
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔘 Button clicked!', { 
                  rapperName: rapper.name, 
                  rapperUrl, 
                  event: e 
                });
                
                // Try multiple navigation methods for debugging
                try {
                  console.log('🚀 Attempting React Router navigation...');
                  navigate(rapperUrl);
                  
                  // Fallback: direct window navigation after a delay
                  setTimeout(() => {
                    console.log('⚡ Fallback: Using window.location...');
                    window.location.href = rapperUrl;
                  }, 100);
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                  // Emergency fallback
                  window.location.href = rapperUrl;
                }
              }}
              className="bg-rap-gold hover:bg-rap-gold-dark text-rap-carbon font-mogra font-bold cursor-pointer relative z-10"
              style={{ pointerEvents: 'auto' }}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
          </div>
        </div>
      </div>
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
