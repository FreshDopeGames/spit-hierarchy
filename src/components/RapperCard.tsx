
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
        <Card className="bg-black/40 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:transform hover:scale-105 relative cursor-pointer">
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
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 pointer-events-none" />
            )}

            {/* Rapper Image Placeholder */}
            <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg mb-4 flex items-center justify-center relative">
              <Music className="w-16 h-16 text-white/70" />
              {position === 1 && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg" />
              )}
            </div>

            {/* Rapper Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-white font-bold text-lg leading-tight">{rapper.name}</h3>
                {rapper.verified && (
                  <Verified className="w-5 h-5 text-blue-500 flex-shrink-0" />
                )}
              </div>

              {rapper.real_name && (
                <p className="text-gray-400 text-sm">{rapper.real_name}</p>
              )}

              <div className="flex flex-wrap gap-2 text-xs">
                {rapper.origin && (
                  <div className="flex items-center gap-1 text-gray-300">
                    <MapPin className="w-3 h-3" />
                    <span>{rapper.origin}</span>
                  </div>
                )}
                {rapper.birth_year && (
                  <div className="flex items-center gap-1 text-gray-300">
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
                <p className="text-gray-400 text-sm line-clamp-2">
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
