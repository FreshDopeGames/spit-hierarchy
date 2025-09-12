import React from "react";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";

interface RapperMosaicProps {
  rappers: Array<{
    id: string;
    name: string;
    image_url?: string | null;
  }>;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const RapperMosaic = ({ rappers, size = 'small', className = '' }: RapperMosaicProps) => {
  // Get the top 5 rappers for the mosaic
  const topFiveRappers = rappers.slice(0, 5);
  
  // Split into top row (2 images) and bottom row (3 images)
  const topRowRappers = topFiveRappers.slice(0, 2);
  const bottomRowRappers = topFiveRappers.slice(2, 5);
  
  // Size configurations
  const sizeConfig = {
    small: {
      height: 'h-16',
      border: 'border-[1px]'
    },
    medium: {
      height: 'h-20',
      border: 'border-[2px]'
    },
    large: {
      height: 'h-24',
      border: 'border-[3px]'
    }
  };
  
  const config = sizeConfig[size];
  
  return (
    <div className={`${config.height} grid grid-rows-2 gap-0 rounded-md overflow-hidden ${className}`}>
      {/* Top Row - 2 Images */}
      <div className="grid grid-cols-2">
        {topRowRappers.map((rapper) => (
          <div key={rapper.id} className={`relative overflow-hidden ${config.border} border-[var(--theme-background)]`}>
            <img 
              src={rapper.image_url || getOptimizedPlaceholder('thumb')}
              alt={rapper.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getOptimizedPlaceholder('thumb');
              }}
            />
          </div>
        ))}
        {/* Fill empty spots if less than 2 rappers */}
        {Array.from({ length: 2 - topRowRappers.length }).map((_, index) => (
          <div key={`top-placeholder-${index}`} className={`relative overflow-hidden ${config.border} border-[var(--theme-background)]`} style={{ backgroundColor: 'hsl(var(--theme-surfaceSecondary))' }}>
            <img 
              src={getOptimizedPlaceholder('thumb')}
              alt="Placeholder"
              className="w-full h-full object-cover opacity-70"
            />
          </div>
        ))}
      </div>
      
      {/* Bottom Row - 3 Images */}
      <div className="grid grid-cols-3">
        {bottomRowRappers.map((rapper) => (
          <div key={rapper.id} className={`relative overflow-hidden ${config.border} border-[var(--theme-background)]`}>
            <img 
              src={rapper.image_url || getOptimizedPlaceholder('thumb')}
              alt={rapper.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getOptimizedPlaceholder('thumb');
              }}
            />
          </div>
        ))}
        {/* Fill empty spots if less than 3 rappers in bottom row */}
        {Array.from({ length: 3 - bottomRowRappers.length }).map((_, index) => (
          <div key={`bottom-placeholder-${index}`} className={`relative overflow-hidden ${config.border} border-[var(--theme-background)]`} style={{ backgroundColor: 'hsl(var(--theme-surfaceSecondary))' }}>
            <img 
              src={getOptimizedPlaceholder('thumb')}
              alt="Placeholder"
              className="w-full h-full object-cover opacity-70"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RapperMosaic;