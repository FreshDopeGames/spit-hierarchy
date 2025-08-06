import React from "react";
import { cn } from "@/lib/utils";

interface ShareableTopFiveProps {
  slots: Array<{
    position: number;
    rapper: {
      id: string;
      name: string;
      image_url?: string;
    } | null;
  }>;
  username: string;
  format?: 'square' | 'landscape';
}

const ShareableTopFive: React.FC<ShareableTopFiveProps> = ({ 
  slots, 
  username, 
  format = 'square' 
}) => {
  const isSquare = format === 'square';
  
  return (
    <div 
      className={cn(
        "bg-gradient-to-br from-black via-gray-900 to-black relative",
        "border-2 border-gray-700 overflow-hidden",
        isSquare ? "w-[1080px] h-[1080px]" : "w-[1200px] h-[630px]"
      )}
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#ffd700_0%,transparent_50%)]" />
      </div>
      
      {/* Header */}
      <div className="relative z-10 text-center pt-8 pb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
          {username}'s Top 5
        </h1>
        <p className="text-xl text-gray-300">
          My favorite rappers ranked
        </p>
      </div>

      {/* Rappers Grid */}
      <div className={cn(
        "relative z-10 px-8",
        isSquare 
          ? "grid grid-cols-2 gap-6 max-w-4xl mx-auto" 
          : "flex justify-center items-center gap-8"
      )}>
        {slots.map((slot) => (
          <div
            key={slot.position}
            className={cn(
              "bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg",
              "flex items-center gap-4",
              isSquare ? "min-h-[140px]" : "min-h-[120px] max-w-[200px]"
            )}
          >
            {/* Position Badge */}
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400 text-black font-bold text-xl">
              {slot.position}
            </div>
            
            {/* Rapper Info */}
            <div className="flex-1 min-w-0">
              {slot.rapper ? (
                <>
                  <div className="w-16 h-16 rounded-lg overflow-hidden mb-2 mx-auto">
                    <img 
                      src={slot.rapper.image_url || "/placeholder.svg"} 
                      alt={slot.rapper.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-white text-center text-sm leading-tight">
                    {slot.rapper.name}
                  </h3>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-lg bg-gray-700 mb-2 mx-auto flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No pick</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Empty slot
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-lg text-gray-400">
          Personal hip-hop rankings
        </p>
      </div>
    </div>
  );
};

export default ShareableTopFive;