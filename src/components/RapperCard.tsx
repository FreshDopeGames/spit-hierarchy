
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Calendar, Verified, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import RankingBadge from "./RankingBadge";
import RapperStats from "./RapperStats";
import HotBadge from "./analytics/HotBadge";
import { useIsHotRapper } from "@/hooks/useHotRappers";

type Rapper = Tables<"rappers">;

interface RapperCardProps {
  rapper: Rapper;
  position: number;
}

const RapperCard = ({ rapper, position }: RapperCardProps) => {
  const { isHot, voteVelocity } = useIsHotRapper(rapper.id);

  return (
    <div className="relative">
      <Link to={`/rapper/${rapper.id}`}>
        <Card className="bg-carbon-fiber border-rap-burgundy/40 hover:border-rap-burgundy/70 transition-all duration-300 hover:transform hover:scale-105 relative cursor-pointer group overflow-hidden">
          {/* Rap culture accent bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rap-burgundy via-rap-forest to-rap-silver"></div>
          
          <CardContent className="p-6">
            <RankingBadge position={position} />

            {/* Hot Badge */}
            {isHot && (
              <div className="absolute top-2 right-2 z-10">
                <HotBadge isHot={isHot} voteVelocity={voteVelocity} variant="compact" />
              </div>
            )}

            {/* Special effects for #1 */}
            {position === 1 && (
              <div className="absolute inset-0 bg-gradient-to-r from-rap-gold/10 to-rap-burgundy/10 pointer-events-none" />
            )}

            {/* Rapper Image Placeholder */}
            <div className="w-full h-48 bg-gradient-to-br from-rap-burgundy to-rap-forest rounded-lg mb-4 flex items-center justify-center relative group-hover:from-rap-burgundy-light group-hover:to-rap-forest-light transition-all duration-300">
              <Music className="w-16 h-16 text-rap-platinum/70" />
              {position === 1 && (
                <div className="absolute inset-0 bg-gradient-to-br from-rap-gold/20 to-rap-burgundy/20 rounded-lg" />
              )}
            </div>

            {/* Rapper Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-rap-platinum font-bold text-lg leading-tight font-mogra">{rapper.name}</h3>
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

              <RapperStats 
                averageRating={rapper.average_rating} 
                totalVotes={rapper.total_votes || 0} 
              />

              {/* Bio Preview */}
              {rapper.bio && (
                <p className="text-rap-smoke text-sm line-clamp-2 font-kaushan">
                  {rapper.bio}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default RapperCard;
