
import React from "react";
import { Star, MapPin, Calendar, Verified } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface RapperInfoProps {
  rapper: Rapper;
}

const RapperInfo = ({ rapper }: RapperInfoProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-kaushan text-rap-platinum">{rapper.name}</h3>
        {rapper.verified && <Verified className="w-5 h-5 text-rap-forest" />}
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
        <span className="text-rap-smoke font-kaushan">({rapper.total_votes || 0} votes)</span>
      </div>
    </div>
  );
};

export default RapperInfo;
