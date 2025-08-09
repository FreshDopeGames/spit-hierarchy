
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

    return (
      <div
        role="link"
        tabIndex={0}
        aria-label={`View ${rapper.name} details`}
        onClick={() => navigate(`/rapper/${rapper.slug || rapper.id}`)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/rapper/${rapper.slug || rapper.id}`); } }}
        className={`block ${cardHeight} relative overflow-hidden rounded-lg border-2 border-rap-gold cursor-pointer min-h-[176px] sm:min-h-[288px]`}
        style={{ touchAction: 'manipulation' }}
      >
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Ranking Number - Top Left */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-rap-gold-dark via-rap-gold to-rap-gold-light shadow-lg border-2 border-black/20">
            <span className={`${rankingTextSize} font-mogra font-bold text-rap-carbon drop-shadow-lg`}>
              {position}
            </span>
          </div>
        </div>
        
        {/* Content - Bottom Area with Drop Shadow */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 z-10 pointer-events-none">
          <div className="text-white">
            <h3 
              className={`${nameTextSize} font-mogra text-white leading-tight mb-2`}
              style={{
                textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, -2px 0 0 #000, 2px 0 0 #000, 0 -2px 0 #000, 0 2px 0 #000, 2px 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              {rapper.name}
            </h3>
            
            {rapper.origin && (
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-rap-silver flex-shrink-0 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]" />
                <p 
                  className="text-rap-silver text-sm sm:text-base font-kaushan"
                  style={{
                    textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, -2px 0 0 #000, 2px 0 0 #000, 0 -2px 0 #000, 0 2px 0 #000, 1px 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  {rapper.origin}
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {voteCount === 0 ? (
                <>
                  <Star className="w-4 h-4 text-rap-gold/70 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]" />
                  <span 
                    className="text-rap-gold/70 font-kaushan text-sm italic"
                    style={{
                      textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, -2px 0 0 #000, 2px 0 0 #000, 0 -2px 0 #000, 0 2px 0 #000, 1px 1px 2px rgba(0,0,0,0.8)'
                    }}
                  >
                    Vote to rank
                  </span>
                </>
              ) : (
                <p 
                  className="text-rap-silver text-sm sm:text-base font-bold"
                  style={{
                    textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, -2px 0 0 #000, 2px 0 0 #000, 0 -2px 0 #000, 0 2px 0 #000, 1px 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
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
    <div className="space-y-6 sm:space-y-8 px-2 sm:px-0">
      {/* Top 2 Cards - Larger and More Prominent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-8">
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
