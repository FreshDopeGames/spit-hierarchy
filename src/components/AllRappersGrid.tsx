
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Calendar, Verified, Mic2, Loader2, Users, Crown, Vote } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import AdUnit from "@/components/AdUnit";
import { useRapperImages } from "@/hooks/useImageStyle";
import { useRapperStats } from "@/hooks/useRapperStats";
import { formatBirthdate } from "@/utils/zodiacUtils";
import { useNavigationState } from "@/hooks/useNavigationState";

type Rapper = Tables<"rappers">;

interface AllRappersGridProps {
  rappers: Rapper[];
  total: number;
  hasMore: boolean;
  isFetching: boolean;
  itemsPerPage: number;
  onLoadMore: () => void;
  currentPage: number;
}

const RapperCard = ({
  rapper,
  imageUrl,
  stats,
  currentPage
}: {
  rapper: Rapper;
  imageUrl?: string | null;
  stats?: { top5_count: number; ranking_votes: number };
  currentPage: number;
}) => {
  const { navigateToRapper } = useNavigationState();
  const birthdate = formatBirthdate(rapper.birth_year, rapper.birth_month, rapper.birth_day);
  
  // Convert average_rating from 1-10 scale to 0-100 scale to match detail page
  const overallRating = rapper.average_rating 
    ? Math.round((Number(rapper.average_rating) / 10) * 100) 
    : 0;

  // Placeholder image from Supabase Storage
  const PLACEHOLDER_IMAGE = "https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images/Rapper_Placeholder_01.png";
  
  // Use rapper image if available and not empty, otherwise use placeholder
  const imageToDisplay = imageUrl && imageUrl.trim() !== "" ? imageUrl : PLACEHOLDER_IMAGE;
  
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateToRapper(rapper.id, currentPage);
  };
  
  return (
    <Card 
      className="bg-rap-carbon border-rap-gold/40 hover:border-rap-gold/70 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer relative overflow-hidden group"
      onClick={handleCardClick}
    >
      {/* Rap culture accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-rap-gold"></div>
      
      <CardContent className="p-6">
        {/* Rapper image or placeholder - 1:1 aspect ratio */}
        <div className="w-full aspect-square bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-burgundy/30 rounded-lg mb-4 flex items-center justify-center relative group-hover:from-rap-burgundy/20 group-hover:via-rap-forest/20 group-hover:to-rap-carbon transition-all duration-300 overflow-hidden">
          <img 
            src={imageToDisplay}
            alt={rapper.name || "Rapper"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              if (target.src !== PLACEHOLDER_IMAGE) {
                target.src = PLACEHOLDER_IMAGE;
              }
            }}
          />
        </div>

        {/* Rapper Info */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-mogra text-lg leading-tight transition-colors font-normal text-rap-gold">{rapper.name}</h3>
            {rapper.verified && <Verified className="w-5 h-5 text-rap-forest flex-shrink-0" />}
          </div>

          {rapper.real_name && <p className="text-rap-smoke text-sm font-medium font-kaushan">{rapper.real_name}</p>}

          <div className="flex flex-wrap gap-2 text-xs">
            {rapper.origin && (
              <div className="flex items-center gap-1 text-rap-platinum bg-rap-carbon/60 px-2 py-1 rounded-full font-kaushan">
                <MapPin className="w-3 h-3" />
                <span>{rapper.origin}</span>
              </div>
            )}
            {birthdate && (
              <div className="flex items-center gap-1 text-rap-platinum bg-rap-carbon/60 px-2 py-1 rounded-full font-kaushan">
                <Calendar className="w-3 h-3" />
                <span>{birthdate}</span>
              </div>
            )}
          </div>

          {/* Three Equal-Height Stat Indicators */}
          <div className="grid grid-cols-3 gap-2">
            {/* Overall Rating */}
            <div className="bg-gradient-to-r from-rap-gold-dark to-rap-gold-light px-2 py-2 rounded-lg border border-rap-silver/20 text-center">
              <div className="text-rap-carbon font-bold text-lg font-mogra leading-none">
                {overallRating}
              </div>
              <div className="text-rap-carbon/70 text-xs font-kaushan mt-1">
                Overall
              </div>
            </div>

            {/* Top 5 Count */}
            <div className="bg-gradient-to-r from-rap-burgundy/30 to-rap-forest/30 px-2 py-2 rounded-lg border border-rap-silver/20 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Crown className="w-4 h-4 text-rap-gold" />
                <span className="text-rap-platinum font-bold text-lg font-mogra leading-none">
                  {stats?.top5_count || 0}
                </span>
              </div>
              <div className="text-rap-smoke text-xs font-kaushan">
                Top 5s
              </div>
            </div>

            {/* Ranking Votes */}
            <div className="bg-gradient-to-r from-rap-forest/30 to-rap-burgundy/30 px-2 py-2 rounded-lg border border-rap-silver/20 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Vote className="w-4 h-4 text-rap-silver" />
                <span className="text-rap-platinum font-bold text-lg font-mogra leading-none">
                  {stats?.ranking_votes || 0}
                </span>
              </div>
              <div className="text-rap-smoke text-xs font-kaushan">
                Votes
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AllRappersGrid = ({
  rappers,
  total,
  hasMore,
  isFetching,
  itemsPerPage,
  onLoadMore,
  currentPage
}: AllRappersGridProps) => {
  // Batch load all rapper images for better performance
  const rapperIds = rappers.map(rapper => rapper.id);
  const { data: imageMap = {} } = useRapperImages(rapperIds);
  const { data: statsMap = {} } = useRapperStats(rapperIds);

  return (
    <>
      {/* Top ad placement */}
      <AdUnit placement="grid-top" pageRoute="/all-rappers" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {rappers.map((rapper, index) => {
          // Show middle ad after every 20 rappers
          const shouldShowMiddleAd = (index + 1) % 20 === 0 && index < rappers.length - 1;
          
          return (
            <React.Fragment key={rapper.id}>
              <RapperCard 
                rapper={rapper} 
                imageUrl={imageMap[rapper.id]} 
                stats={statsMap[rapper.id]}
                currentPage={currentPage}
              />
              
              {shouldShowMiddleAd && (
                <div className="col-span-full">
                  <AdUnit placement="grid-middle" pageRoute="/all-rappers" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Enhanced Load More Button */}
      {hasMore && (
        <div className="flex justify-center" id="load-more-anchor">
          <Button
            onClick={onLoadMore}
            disabled={isFetching}
            className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-bold px-8 py-3 text-lg border-2 border-rap-silver/50 hover:border-rap-silver shadow-lg hover:shadow-rap-gold/30 transition-all duration-300 font-mogra"
          >
            {isFetching ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span className="font-kaushan">Loading More...</span>
              </>
            ) : (
              <span className="font-kaushan">Load More Artists ({total - rappers.length} remaining)</span>
            )}
          </Button>
        </div>
      )}

      {/* Bottom ad placement */}
      <AdUnit placement="grid-bottom" pageRoute="/all-rappers" />
    </>
  );
};

export default AllRappersGrid;
