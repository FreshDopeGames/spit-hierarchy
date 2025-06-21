import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Calendar, Verified, Mic2, Loader2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import AdUnit from "@/components/AdUnit";
import { useRapperImages } from "@/hooks/useImageStyle";
import { formatBirthdate } from "@/utils/zodiacUtils";
type Rapper = Tables<"rappers">;
interface AllRappersGridProps {
  rappers: Rapper[];
  total: number;
  hasMore: boolean;
  isFetching: boolean;
  itemsPerPage: number;
  onLoadMore: () => void;
}
const RapperCard = ({
  rapper,
  imageUrl
}: {
  rapper: Rapper;
  imageUrl?: string | null;
}) => {
  const birthdate = formatBirthdate(rapper.birth_year, rapper.birth_month, rapper.birth_day);
  
  return (
    <Link key={rapper.id} to={`/rapper/${rapper.id}`}>
      <Card className="bg-rap-carbon border-rap-gold/40 hover:border-rap-gold/70 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer relative overflow-hidden group">
        {/* Rap culture accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-rap-gold"></div>
        
        <CardContent className="p-6">
          {/* Rapper image or placeholder - changed to 1:1 aspect ratio */}
          <div className="w-full aspect-square bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-burgundy/30 rounded-lg mb-4 flex items-center justify-center relative group-hover:from-rap-burgundy/20 group-hover:via-rap-forest/20 group-hover:to-rap-carbon transition-all duration-300 overflow-hidden">
            {imageUrl ? <img src={imageUrl} alt={rapper.name} className="w-full h-full object-cover" /> : <>
                <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-transparent to-rap-carbon/50 rounded-lg"></div>
                
                {/* Stage spotlight effect */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-rap-silver/30 to-transparent rounded-full blur-sm"></div>
                
                {/* Rapper silhouette with microphone */}
                <div className="relative z-10 flex flex-col items-center">
                  <Mic2 className="w-8 h-8 text-rap-silver/70 group-hover:text-rap-platinum transition-colors mb-1" />
                  <Users className="w-4 h-4 text-rap-silver/50 group-hover:text-rap-platinum/70 transition-colors" />
                </div>
                
                {/* Stage floor effect */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-rap-carbon to-transparent rounded-b-lg"></div>
              </>}
          </div>

          {/* Rapper Info */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-mogra text-lg leading-tight transition-colors font-normal text-rap-gold">{rapper.name}</h3>
              {rapper.verified && <Verified className="w-5 h-5 text-rap-forest flex-shrink-0" />}
            </div>

            {rapper.real_name && <p className="text-rap-smoke text-sm font-medium font-kaushan">{rapper.real_name}</p>}

            <div className="flex flex-wrap gap-2 text-xs">
              {rapper.origin && <div className="flex items-center gap-1 text-rap-platinum bg-rap-carbon/60 px-2 py-1 rounded-full font-kaushan">
                  <MapPin className="w-3 h-3" />
                  <span>{rapper.origin}</span>
                </div>}
              {birthdate && <div className="flex items-center gap-1 text-rap-platinum bg-rap-carbon/60 px-2 py-1 rounded-full font-kaushan">
                  <Calendar className="w-3 h-3" />
                  <span>{birthdate}</span>
                </div>}
            </div>

            {/* Stats with enhanced styling */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-gradient-to-r from-rap-gold-dark to-rap-gold-light px-3 py-1 rounded-full border border-rap-silver/20">
                <Star className="w-4 h-4 text-rap-carbon" />
                <span className="text-rap-carbon font-bold font-ceviche">
                  {rapper.average_rating ? Number(rapper.average_rating).toFixed(1) : "—"}
                </span>
              </div>
              <Badge variant="secondary" className="bg-gradient-to-r from-rap-gold-dark to-rap-gold-light text-rap-carbon border-rap-silver/30 font-kaushan">
                {rapper.total_votes || 0} votes
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
const AllRappersGrid = ({
  rappers,
  total,
  hasMore,
  isFetching,
  itemsPerPage,
  onLoadMore
}: AllRappersGridProps) => {
  // Batch load all rapper images for better performance
  const rapperIds = rappers.map(rapper => rapper.id);
  const {
    data: imageMap = {}
  } = useRapperImages(rapperIds);
  return <>
      {/* Top ad placement */}
      <AdUnit placement="grid-top" pageRoute="/all-rappers" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {rappers.map((rapper, index) => {
        // Show middle ad after every 20 rappers
        const shouldShowMiddleAd = (index + 1) % 20 === 0 && index < rappers.length - 1;
        return <React.Fragment key={rapper.id}>
              <RapperCard rapper={rapper} imageUrl={imageMap[rapper.id]} />
              
              {shouldShowMiddleAd && <div className="col-span-full">
                  <AdUnit placement="grid-middle" pageRoute="/all-rappers" />
                </div>}
            </React.Fragment>;
      })}
      </div>

      {/* Enhanced Load More Button */}
      {hasMore && <div className="flex justify-center" id="load-more-anchor">
          <Button onClick={onLoadMore} disabled={isFetching} className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-bold px-8 py-3 text-lg border-2 border-rap-silver/50 hover:border-rap-silver shadow-lg hover:shadow-rap-gold/30 transition-all duration-300 font-mogra">
            {isFetching ? <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span className="font-kaushan">Loading More...</span>
              </> : <span className="font-kaushan">Load More Artists ({total - rappers.length} remaining)</span>}
          </Button>
        </div>}

      {/* Bottom ad placement */}
      <AdUnit placement="grid-bottom" pageRoute="/all-rappers" />
    </>;
};
export default AllRappersGrid;
