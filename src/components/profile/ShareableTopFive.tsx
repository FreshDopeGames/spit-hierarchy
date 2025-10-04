import React from "react";
import { cn } from "@/lib/utils";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";

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
  format?: 'square' | 'landscape' | 'portrait';
}

const ShareableTopFive: React.FC<ShareableTopFiveProps> = ({ 
  slots, 
  username, 
  format = 'square' 
}) => {
  const isSquare = format === 'square';
  const isPortrait = format === 'portrait';
  
  const getDimensions = () => {
    if (isPortrait) return "w-[1080px] h-[1920px]";
    if (isSquare) return "w-[1080px] h-[1080px]";
    return "w-[1200px] h-[630px]";
  };
  
  return (
    <div 
      className={cn(
        "bg-gradient-to-br from-black via-gray-900 to-black relative",
        "border-2 border-gray-700 overflow-hidden",
        getDimensions()
      )}
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#ffd700_0%,transparent_50%)]" />
      </div>
      
      {/* Header */}
      <div className={cn(
        "relative z-10 text-center",
        isPortrait ? "pt-12 pb-8" : "pt-8 pb-6"
      )}>
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
          {username}'s Top 5
        </h1>
        <p className="text-xl text-gray-300">
          My favorite rappers ranked
        </p>
      </div>

      {/* Rappers Grid */}
      {isPortrait ? (
        <div className="relative z-10 px-8 space-y-6 max-w-2xl mx-auto">
          {/* #1 Featured */}
          {slots[0] && (
            <div className="bg-gray-800 border-2 border-yellow-400 rounded-lg p-6 shadow-2xl">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400 text-black font-bold text-2xl">
                  1
                </div>
                <div className="flex-1">
                  {slots[0].rapper ? (
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={slots[0].rapper.image_url || getOptimizedPlaceholder('medium')}
                          alt={slots[0].rapper.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-bold text-white text-lg leading-tight">
                        {slots[0].rapper.name}
                      </h3>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-lg bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No pick</span>
                      </div>
                      <p className="text-gray-400 text-base">Empty slot</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Rows for #2-5 */}
          <div className="grid grid-cols-2 gap-4">
            {slots.slice(1).map((slot) => (
              <div
                key={slot.position}
                className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 text-black font-bold text-lg">
                    {slot.position}
                  </div>
                </div>
                <div>
                  {slot.rapper ? (
                    <>
                      <div className="w-20 h-20 rounded-lg overflow-hidden mb-2 mx-auto">
                        <img 
                          src={slot.rapper.image_url || getOptimizedPlaceholder('medium')}
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
                      <div className="w-20 h-20 rounded-lg bg-gray-700 mb-2 mx-auto flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No pick</span>
                      </div>
                      <p className="text-gray-400 text-sm">Empty slot</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
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
                        src={slot.rapper.image_url || getOptimizedPlaceholder('medium')}
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
      )}

      {/* Footer */}
      <div className={cn(
        "absolute left-0 right-0 text-center",
        isPortrait ? "bottom-8" : "bottom-6"
      )}>
        <p className="text-lg text-gray-400">
          Personal hip-hop rankings
        </p>
      </div>
    </div>
  );
};

export default ShareableTopFive;