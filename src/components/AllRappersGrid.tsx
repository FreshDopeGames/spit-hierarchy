
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Calendar, Verified, Music, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import BillboardAd from "@/components/BillboardAd";

type Rapper = Tables<"rappers">;

interface AllRappersGridProps {
  rappers: Rapper[];
  total: number;
  hasMore: boolean;
  isFetching: boolean;
  itemsPerPage: number;
  onLoadMore: () => void;
}

const AllRappersGrid = ({
  rappers,
  total,
  hasMore,
  isFetching,
  itemsPerPage,
  onLoadMore,
}: AllRappersGridProps) => {

  // Split rappers into chunks to insert ads between sections
  const rappersWithAds = [];
  const chunkSize = itemsPerPage;
  
  for (let i = 0; i < rappers.length; i += chunkSize) {
    const chunk = rappers.slice(i, i + chunkSize);
    rappersWithAds.push({ type: 'rappers', data: chunk, isFirstChunk: i === 0 });
    
    // Add ad after each chunk except the last one
    if (i + chunkSize < rappers.length) {
      rappersWithAds.push({ 
        type: 'ad', 
        data: {
          title: "Discover New Music",
          description: "Find the latest hip-hop tracks and underground artists",
          ctaText: "Explore Now"
        }
      });
    }
  }

  return (
    <>
      {rappersWithAds.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {section.type === 'rappers' ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${section.isFirstChunk ? 'mb-8' : 'mb-8'}`}>
              {section.data.map((rapper, index) => (
                <Link key={rapper.id} to={`/rapper/${rapper.id}`}>
                  <Card className="bg-black/60 border-hip-hop-gold/30 hover:border-hip-hop-gold/60 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer relative overflow-hidden group">
                    {/* Hip-hop style accent bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-hip-hop-gold via-hip-hop-electric-blue to-hip-hop-hot-pink"></div>
                    
                    <CardContent className="p-6">
                      {/* Rapper Image Placeholder with enhanced styling */}
                      <div className="w-full h-32 bg-gradient-to-br from-purple-600 via-hip-hop-electric-blue to-blue-600 rounded-lg mb-4 flex items-center justify-center relative group-hover:animate-glow-pulse">
                        <Music className="w-12 h-12 text-white/70 group-hover:text-hip-hop-gold transition-colors" />
                        {/* Overlay pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                      </div>

                      {/* Rapper Info */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-white font-street font-bold text-lg leading-tight group-hover:text-hip-hop-gold transition-colors">{rapper.name}</h3>
                          {rapper.verified && (
                            <Verified className="w-5 h-5 text-hip-hop-electric-blue flex-shrink-0" />
                          )}
                        </div>

                        {rapper.real_name && (
                          <p className="text-gray-300 text-sm font-medium">{rapper.real_name}</p>
                        )}

                        <div className="flex flex-wrap gap-2 text-xs">
                          {rapper.origin && (
                            <div className="flex items-center gap-1 text-hip-hop-platinum bg-black/40 px-2 py-1 rounded-full">
                              <MapPin className="w-3 h-3" />
                              <span>{rapper.origin}</span>
                            </div>
                          )}
                          {rapper.birth_year && (
                            <div className="flex items-center gap-1 text-hip-hop-platinum bg-black/40 px-2 py-1 rounded-full">
                              <Calendar className="w-3 h-3" />
                              <span>{rapper.birth_year}</span>
                            </div>
                          )}
                        </div>

                        {/* Stats with enhanced styling */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-gradient-to-r from-hip-hop-gold/20 to-yellow-500/20 px-3 py-1 rounded-full">
                            <Star className="w-4 h-4 text-hip-hop-gold" />
                            <span className="text-white font-bold">
                              {rapper.average_rating ? Number(rapper.average_rating).toFixed(1) : "—"}
                            </span>
                          </div>
                          <Badge variant="secondary" className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-hip-hop-platinum border-hip-hop-electric-blue/30">
                            {rapper.total_votes || 0} votes
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <BillboardAd
              title={section.data.title}
              description={section.data.description}
              ctaText={section.data.ctaText}
            />
          )}
        </div>
      ))}

      {/* Enhanced Load More Button */}
      {hasMore && (
        <div className="flex justify-center" id="load-more-anchor">
          <Button
            onClick={onLoadMore}
            disabled={isFetching}
            className="bg-gradient-to-r from-hip-hop-gold to-yellow-500 hover:from-hip-hop-gold/80 hover:to-yellow-500/80 text-black font-bold px-8 py-3 text-lg border-2 border-hip-hop-gold/50 hover:border-hip-hop-gold shadow-lg hover:shadow-hip-hop-gold/30 transition-all duration-300"
          >
            {isFetching ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span className="font-street">Loading More...</span>
              </>
            ) : (
              <span className="font-street">Load More Rappers ({total - rappers.length} remaining)</span>
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default AllRappersGrid;
