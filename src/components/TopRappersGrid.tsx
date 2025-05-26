
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Calendar, Verified, Music, Crown } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

const TopRappersGrid = () => {
  const { data: topRappers, isLoading } = useQuery({
    queryKey: ["top-rappers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rappers")
        .select("*")
        .order("average_rating", { ascending: false })
        .order("total_votes", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Top 5 Rappers Right Now
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-black/40 border-purple-500/20 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6 md:px-16">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="bg-black/40 border-purple-500/20 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!topRappers || topRappers.length === 0) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Top 5 Rappers Right Now
          </h2>
          <p className="text-gray-300">
            Based on community votes and ratings
          </p>
        </div>
        <Card className="bg-black/40 border-purple-500/20">
          <CardContent className="p-8 text-center">
            <Music className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Rappers Yet</h3>
            <p className="text-gray-400 mb-4">Be the first to add rappers to our database!</p>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Add a Rapper
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    return null;
  };

  const getRankBadgeColor = (position: number) => {
    switch (position) {
      case 1: return "from-yellow-500 to-orange-500";
      case 2: return "from-gray-400 to-gray-600";
      case 3: return "from-amber-600 to-yellow-700";
      default: return "from-purple-500 to-blue-500";
    }
  };

  // Ensure we have exactly 5 items by padding with empty slots if needed
  const paddedRappers = [...topRappers];
  while (paddedRappers.length < 5) {
    paddedRappers.push(null);
  }

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Top 5 Rappers Right Now
        </h2>
        <p className="text-gray-300">
          Based on community votes and ratings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Row - First 3 rappers */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {paddedRappers.slice(0, 3).map((rapper, index) => (
            <Card key={rapper?.id || `empty-${index}`} className="bg-black/40 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:transform hover:scale-105 relative overflow-hidden">
              <CardContent className="p-6">
                {/* Ranking Badge */}
                <div className={`absolute -top-2 -left-2 bg-gradient-to-r ${getRankBadgeColor(index + 1)} text-white text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center z-10`}>
                  {getRankIcon(index + 1) || `#${index + 1}`}
                </div>

                {/* Special effects for #1 */}
                {index === 0 && rapper && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 pointer-events-none" />
                )}

                {rapper ? (
                  <>
                    {/* Rapper Image Placeholder */}
                    <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg mb-4 flex items-center justify-center relative">
                      <Music className="w-16 h-16 text-white/70" />
                      {index === 0 && (
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

                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-white font-semibold">
                            {rapper.average_rating ? Number(rapper.average_rating).toFixed(1) : "—"}
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
                    </div>
                  </>
                ) : (
                  // Empty slot placeholder
                  <div className="text-center py-8">
                    <div className="w-full h-48 bg-gray-800/50 rounded-lg mb-4 flex items-center justify-center">
                      <Music className="w-16 h-16 text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-sm">No rapper yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Row - Last 2 rappers */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 md:px-16">
          {paddedRappers.slice(3, 5).map((rapper, index) => (
            <Card key={rapper?.id || `empty-${index + 3}`} className="bg-black/40 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:transform hover:scale-105 relative">
              <CardContent className="p-6">
                {/* Ranking Badge */}
                <div className={`absolute -top-2 -left-2 bg-gradient-to-r ${getRankBadgeColor(index + 4)} text-white text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center`}>
                  #{index + 4}
                </div>

                {rapper ? (
                  <>
                    {/* Rapper Image Placeholder */}
                    <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
                      <Music className="w-16 h-16 text-white/70" />
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

                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-white font-semibold">
                            {rapper.average_rating ? Number(rapper.average_rating).toFixed(1) : "—"}
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
                    </div>
                  </>
                ) : (
                  // Empty slot placeholder
                  <div className="text-center py-8">
                    <div className="w-full h-48 bg-gray-800/50 rounded-lg mb-4 flex items-center justify-center">
                      <Music className="w-16 h-16 text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-sm">No rapper yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="text-center mt-8">
        <Button 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          size="lg"
        >
          View All Rankings
        </Button>
      </div>
    </div>
  );
};

export default TopRappersGrid;
