
import React from "react";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface RapperImageDisplayProps {
  rapper: Rapper;
}

const RapperImageDisplay = ({ rapper }: RapperImageDisplayProps) => {
  if (!rapper.image_url) return null;

  return (
    <div className="flex justify-center">
      <img 
        src={rapper.image_url} 
        alt={rapper.name}
        className="w-64 h-64 object-cover border-2 border-rap-gold/30 rounded-lg"
        onLoad={() => console.log('Current image loaded successfully:', rapper.image_url)}
        onError={(e) => {
          console.error('Image failed to load:', rapper.image_url);
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    </div>
  );
};

export default RapperImageDisplay;
