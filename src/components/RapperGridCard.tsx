
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
      <Card className="bg-black/40 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:transform hover:scale-105 group relative">
        <CardContent className="p-6">
          {/* Ranking Badge */}
          {sortBy === "rating" && (
            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
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
            <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg mb-4 flex items-center justify-center cursor-pointer group-hover:from-purple-500 group-hover:to-blue-500 transition-colors">
              <Music className="w-16 h-16 text-white/70" />
            </div>
          </Link>

          {/* Rapper Info */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <Link to={`/rapper/${rapper.id}`}>
                <h3 className="text-white font-bold text-lg leading-tight hover:text-purple-300 transition-colors cursor-pointer">{rapper.name}</h3>
              </Link>
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

            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-white font-semibold">
                  {rapper.average_rating || "—"}
                </span>
              </div>
              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                {rapper.total_votes || 0} votes
              </Badge>
            </div>

            {/* Bio Preview */}
            {rapper.bio && (
              <p className="text-gray-400 text-sm line-clamp-2">
                {rapper.bio}
              </p>
            )}

            {/* Vote Button */}
            <Button
              onClick={() => setSelectedRapper(rapper)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
