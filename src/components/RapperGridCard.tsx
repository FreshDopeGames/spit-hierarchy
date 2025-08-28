import { useState } from "react";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { Badge } from "@/components/ui/badge";
import { ThemedButton } from "@/components/ui/themed-button";
import { Star, MapPin, Calendar, Verified } from "lucide-react";
import { Link } from "react-router-dom";
import VoteModal from "./VoteModal";
import HotBadge from "./analytics/HotBadge";
import { useIsHotRapper } from "@/hooks/useHotRappers";
import { useRapperImage } from "@/hooks/useImageStyle";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface RapperGridCardProps {
  rapper: Rapper;
  index: number;
  sortBy: "name" | "rating" | "votes";
  selectedCategory: string;
}

const RapperGridCard = ({ rapper, index, sortBy, selectedCategory }: RapperGridCardProps) => {
  const [selectedRapper, setSelectedRapper] = useState<Rapper | null>(null);
  const { isHot, voteVelocity } = useIsHotRapper(rapper.id);
  const { data: imageUrl } = useRapperImage(rapper.id);

  const handleCardClick = (e: React.MouseEvent) => {
    // Debug logging
    console.log('Card clicked:', { 
      name: rapper.name, 
      slug: rapper.slug, 
      id: rapper.id, 
      url: `/rapper/${rapper.slug || rapper.id}` 
    });
  };

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation when vote button is clicked
    setSelectedRapper(rapper);
  };

  return (
    <>
      <Link to={`/rapper/${rapper.slug || rapper.id}`} onClick={handleCardClick}>
        <ThemedCard className="hover:border-[var(--theme-primary)]/70 transition-all duration-300 hover:transform hover:scale-105 group relative overflow-hidden shadow-lg cursor-pointer">
          {/* Theme accent bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--theme-primary)]"></div>
          
          <ThemedCardContent className="p-6">
            {/* Ranking Badge */}
            {sortBy === "rating" && (
              <div className="absolute -top-2 -left-2 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primaryLight)] text-[var(--theme-background)] text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center font-[var(--theme-font-heading)] shadow-lg">
                #{index + 1}
              </div>
            )}

            {/* Hot Badge */}
            {isHot && (
              <div className="absolute top-2 right-2 z-10">
                <HotBadge isHot={isHot} voteVelocity={voteVelocity} variant="compact" />
              </div>
            )}

            {/* Rapper Image */}
            <div className="w-full h-48 rounded-lg mb-4 overflow-hidden bg-gradient-to-br from-[var(--theme-secondary)] to-[var(--theme-accent)] flex items-center justify-center group-hover:from-[var(--theme-secondaryDark)] group-hover:to-[var(--theme-accentDark)] transition-colors shadow-inner">
              <img 
                src={imageUrl} 
                alt={rapper.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Rapper Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-[var(--theme-text)] font-bold text-lg leading-tight hover:text-[var(--theme-primary)] transition-colors font-[var(--theme-font-heading)]">{rapper.name}</h3>
                {rapper.verified && (
                  <Verified className="w-5 h-5 text-[var(--theme-accent)] flex-shrink-0" />
                )}
              </div>

            {rapper.real_name && (
              <p className="text-[var(--theme-textMuted)] text-sm font-[var(--theme-font-body)]">{rapper.real_name}</p>
            )}

            <div className="flex flex-wrap gap-2 text-xs">
              {rapper.origin && (
                <div className="flex items-center gap-1 text-[var(--theme-text)] font-[var(--theme-font-body)]">
                  <MapPin className="w-3 h-3" />
                  <span>{rapper.origin}</span>
                </div>
              )}
              {rapper.birth_year && (
                <div className="flex items-center gap-1 text-[var(--theme-text)] font-[var(--theme-font-body)]">
                  <Calendar className="w-3 h-3" />
                  <span>{rapper.birth_year}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-[var(--theme-primary)]" />
                <span className="text-[var(--theme-text)] font-semibold font-[var(--theme-font-body)]">
                  {rapper.average_rating || "—"}
                </span>
              </div>
              <Badge variant="secondary" className="bg-[var(--theme-secondary)]/20 text-[var(--theme-text)] border-[var(--theme-border)] font-[var(--theme-font-body)]">
                {rapper.total_votes || 0} votes
              </Badge>
            </div>

            {/* Bio Preview */}
            {rapper.bio && (
              <p className="text-[var(--theme-textMuted)] text-sm line-clamp-2 font-[var(--theme-font-body)]">
                {rapper.bio}
              </p>
            )}

            {/* Vote Button */}
              {/*<Button
              onClick={handleVoteClick}
              className="w-full bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-mogra shadow-lg shadow-rap-gold/30"
            >
              Cast Royal Decree
            </Button>*/}
          </div>
        </ThemedCardContent>
      </ThemedCard>
    </Link>

      {/* Vote Modal */}
      {selectedRapper && (
        <VoteModal
          rapper={selectedRapper}
          isOpen={!!selectedRapper}
          onClose={() => setSelectedRapper(null)}
          selectedCategory={selectedCategory}
        />
      )}
    </>
  );
};

export default RapperGridCard;
