
import React from "react";
import { Tables } from "@/integrations/supabase/types";
import { useRapperImage } from "@/hooks/useImageStyle";

type Rapper = Tables<"rappers">;

interface RapperImageDisplayProps {
  rapper: Rapper;
}

const RapperImageDisplay = ({ rapper }: RapperImageDisplayProps) => {
  const { data: imageUrl, isLoading, error } = useRapperImage(rapper.id, 'xlarge');

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="w-64 h-64 border-2 border-rap-gold/30 rounded-lg bg-rap-carbon animate-pulse flex items-center justify-center">
          <div className="text-rap-smoke">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading rapper image:', error);
  }

  if (!imageUrl) return null;

  // Add cache-busting timestamp to force refresh
  const cacheBustingUrl = `${imageUrl}?t=${Date.now()}`;

  return (
    <div className="flex justify-center">
      <img 
        src={cacheBustingUrl} 
        alt={rapper.name}
        className="w-64 h-64 object-cover border-2 border-rap-gold/30 rounded-lg"
        onLoad={() => console.log('Image loaded successfully:', cacheBustingUrl)}
        onError={(e) => {
          console.error('Image failed to load:', cacheBustingUrl);
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    </div>
  );
};

export default RapperImageDisplay;
