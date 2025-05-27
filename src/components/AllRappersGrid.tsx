
import React, { useRef } from "react";
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
  loadedCount: number;
  itemsPerPage: number;
  onLoadMore: () => void;
}

const AllRappersGrid = ({
  rappers,
  total,
  hasMore,
  isFetching,
  loadedCount,
  itemsPerPage,
  onLoadMore,
}: AllRappersGridProps) => {
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = () => {
    // Store current scroll position before loading more
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    
    onLoadMore();
  };

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
              {section.data.map((rapper) => (
                <Link key={rapper.id} to={`/rapper/${rapper.id}`}>
                  <Card className="bg-black/40 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer">
                    <CardContent className="p-6">
                      {/* Rapper Image Placeholder */}
                      <div className="w-full h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
                        <Music className="w-12 h-12 text-white/70" />
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

      {/* Scroll anchor for maintaining position */}
      {hasMore && <div ref={scrollAnchorRef} className="h-0" />}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={isFetching}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
          >
            {isFetching ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading More...
              </>
            ) : (
              `Load More Rappers (${total - rappers.length} remaining)`
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default AllRappersGrid;
