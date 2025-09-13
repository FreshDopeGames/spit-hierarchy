
import React from "react";
import { Music } from "lucide-react";

interface TopFiveSlotProps {
  position: number;
  rapper: {
    id: string;
    name: string;
    image_url: string | null;
  } | null;
  onClick: () => void;
}

const TopFiveSlot = ({ position, rapper, onClick }: TopFiveSlotProps) => {
  return (
    <div
      onClick={onClick}
      className="border rounded-lg p-3 cursor-pointer transition-colors group relative hover:opacity-90"
      style={{
        backgroundColor: 'hsl(var(--theme-surfaceSecondary))',
        borderColor: 'hsl(var(--theme-border))',
      }}
    >
      {/* Position number in top left */}
      <div 
        className="absolute top-2 sm:top-3 left-2 sm:left-3 text-sm sm:text-lg font-bold rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border z-10"
        style={{
          color: 'hsl(var(--theme-primary))',
          backgroundColor: 'hsl(var(--theme-surface))',
          borderColor: 'hsl(var(--theme-primary))',
          fontFamily: 'var(--theme-font-heading)'
        }}
      >
        #{position}
      </div>
      
      <div className="flex flex-col items-center space-y-4">
        {rapper ? (
          <>
            <div 
              className="w-full max-w-60 h-32 sm:h-40 rounded-lg overflow-hidden border"
              style={{
                backgroundColor: 'hsl(var(--theme-surface))',
                borderColor: 'hsl(var(--theme-border))'
              }}
            >
              {rapper.image_url ? (
                <img 
                  src={rapper.image_url} 
                  alt={rapper.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-12 h-12" style={{ color: 'hsl(var(--theme-textMuted))' }} />
                </div>
              )}
            </div>
            <div 
              className="text-sm sm:text-lg font-bold text-center line-clamp-2"
              style={{ 
                color: 'hsl(var(--theme-text))',
                fontFamily: 'var(--theme-font-body)'
              }}
            >
              {rapper.name}
            </div>
          </>
        ) : (
          <>
            <div 
              className="w-full max-w-60 h-32 sm:h-40 rounded-lg border-2 border-dashed flex items-center justify-center group-hover:opacity-80"
              style={{
                backgroundColor: 'hsl(var(--theme-surface))',
                borderColor: 'hsl(var(--theme-border))'
              }}
            >
              <Music className="w-12 h-12" style={{ color: 'hsl(var(--theme-textMuted))' }} />
            </div>
            <div 
              className="text-sm sm:text-lg font-bold text-center"
              style={{ 
                color: 'hsl(var(--theme-textMuted))',
                fontFamily: 'var(--theme-font-body)'
              }}
            >
              Click to add rapper
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TopFiveSlot;
