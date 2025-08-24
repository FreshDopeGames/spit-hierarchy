
import React from "react";
import { Star, MapPin, Calendar, TrendingUp } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useRapperPercentile } from "@/hooks/useRapperPercentile";

type Rapper = Tables<"rappers">;

interface RapperData {
  id: string;
  name: string;
  real_name: string | null;
  origin: string | null;
  birth_year: number | null;
  average_rating: number | null;
  total_votes: number | null;
}

interface RapperInfoProps {
  rapper: RapperData;
}

const RapperInfo = ({ rapper }: RapperInfoProps) => {
  const { data: percentile, isLoading: percentileLoading } = useRapperPercentile(rapper.id);

  const formatPercentileText = (percentile: number | null) => {
    if (percentile === null) return "";
    
    let suffix = "th";
    if (percentile % 10 === 1 && percentile % 100 !== 11) suffix = "st";
    else if (percentile % 10 === 2 && percentile % 100 !== 12) suffix = "nd";
    else if (percentile % 10 === 3 && percentile % 100 !== 13) suffix = "rd";
    
    return `${percentile}${suffix} percentile`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-kaushan text-rap-platinum">{rapper.name}</h3>
      </div>
      
      {rapper.real_name && (
        <p className="text-rap-smoke font-kaushan">{rapper.real_name}</p>
      )}

      <div className="flex flex-wrap gap-3 text-sm">
        {rapper.origin && (
          <div className="flex items-center gap-1 text-rap-smoke font-kaushan">
            <MapPin className="w-4 h-4" />
            <span>{rapper.origin}</span>
          </div>
        )}
        {rapper.birth_year && (
          <div className="flex items-center gap-1 text-rap-smoke font-kaushan">
            <Calendar className="w-4 h-4" />
            <span>{rapper.birth_year}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-rap-gold" />
        <span className="text-rap-platinum font-semibold font-kaushan">
          {rapper.average_rating || "No ratings yet"}
        </span>
        {rapper.average_rating && percentile !== null && !percentileLoading && (
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-rap-gold" />
            <span className="text-rap-gold text-sm font-kaushan">
              ({formatPercentileText(percentile)})
            </span>
          </div>
        )}
        <span className="text-rap-smoke font-kaushan">({rapper.total_votes || 0} votes)</span>
      </div>
    </div>
  );
};

export default RapperInfo;
