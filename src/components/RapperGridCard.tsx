
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Calendar, Verified, Music } from "lucide-react";
import { Link } from "react-router-dom";
import VoteModal from "./VoteModal";
import HotBadge from "./analytics/HotBadge";
import { useIsHotRapper } from "@/hooks/useHotRappers";
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

  return (
    <>
      <Card className="bg-carbon-fiber border-rap-burgundy/40 hover:border-rap-burgundy/70 transition-all duration-300 hover:transform hover:scale-105 group relative overflow-hidden">
        {/* Rap culture accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rap-burgundy via-rap-forest to-rap-silver"></div>
        
        <CardContent className="p-6">
          {/* Ranking Badge */}
          {sortBy === "rating" && (
            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-rap-gold to-rap-gold-light text-rap-carbon text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center font-mogra">
              #{index + 1}
            </div>
          )}

          {/* Hot Badge */}
          {isHot && (
            <div className="absolute top-2 right-2 z-10">
              <HotBadge isHot={isHot} voteVelocity={voteVelocity} variant="compact" />
            </div>
          )}

          {/* Rapper Image Placeholder - Make it clickable */}
          <Link to={`/rapper/${rapper.id}`}>
            <div className="w-full h-48 bg-gradient-to-br from-rap-burgundy to-rap-forest rounded-lg mb-4 flex items-center justify-center cursor-pointer group-hover:from-rap-burgundy-light group-hover:to-rap-forest-light transition-colors">
              <Music className="w-16 h-16 text-rap-platinum/70" />
            </div>
          </Link>

          {/* Rapper Info */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <Link to={`/rapper/${rapper.id}`}>
                <h3 className="text-rap-platinum font-bold text-lg leading-tight hover:text-rap-silver transition-colors cursor-pointer font-mogra">{rapper.name}</h3>
              </Link>
              {rapper.verified && (
                <Verified className="w-5 h-5 text-rap-forest flex-shrink-0" />
              )}
            </div>

            {rapper.real_name && (
              <p className="text-rap-smoke text-sm font-kaushan">{rapper.real_name}</p>
            )}

            <div className="flex flex-wrap gap-2 text-xs">
              {rapper.origin && (
                <div className="flex items-center gap-1 text-rap-platinum font-kaushan">
                  <MapPin className="w-3 h-3" />
                  <span>{rapper.origin}</span>
                </div>
              )}
              {rapper.birth_year && (
                <div className="flex items-center gap-1 text-rap-platinum font-kaushan">
                  <Calendar className="w-3 h-3" />
                  <span>{rapper.birth_year}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-rap-gold" />
                <span className="text-rap-platinum font-semibold font-ceviche">
                  {rapper.average_rating || "—"}
                </span>
              </div>
              <Badge variant="secondary" className="bg-rap-burgundy/20 text-rap-platinum border-rap-burgundy/30 font-kaushan">
                {rapper.total_votes || 0} votes
              </Badge>
            </div>

            {/* Bio Preview */}
            {rapper.bio && (
              <p className="text-rap-smoke text-sm line-clamp-2 font-kaushan">
                {rapper.bio}
              </p>
            )}

            {/* Vote Button */}
            <Button
              onClick={() => setSelectedRapper(rapper)}
              className="w-full bg-gradient-to-r from-rap-burgundy to-rap-forest hover:from-rap-burgundy-light hover:to-rap-forest-light text-rap-platinum font-mogra"
            >
              Vote & Rate
            </Button>
          </div>
        </CardContent>
      </Card>

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
