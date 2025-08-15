
import { useNavigate, Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { useRapperImage } from "@/hooks/useImageStyle";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";
import { Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
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

    const handleCardClick = (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      console.log('Card clicked:', { name: rapper.name, url: rapperUrl });
      console.log('Navigating to:', rapperUrl);
      
      try {
        window.location.href = rapperUrl;
      } catch (error) {
        console.error('Navigation failed:', error);
        // Fallback navigation
        window.location.pathname = rapperUrl;
      }
    };

    return (
      <div 
        onClick={handleCardClick}
        className={cn(
          "relative block rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group cursor-pointer",
          isTopTwo ? "h-80" : "h-64"
        )}
      >
          <img 
            src={imageToDisplay}
            alt={rapper.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white pointer-events-none">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center">
                  {position}
                </span>
                <h3 className="text-lg font-bold truncate">
                  {rapper.name}
                </h3>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {voteCount === 0 ? (
                <>
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">Vote to rank</span>
                </>
              ) : (
                <span className="text-sm text-gray-300">Votes: {voteCount.toLocaleString()}</span>
              )}
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
