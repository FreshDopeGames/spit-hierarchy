
import React from "react";
import { Label } from "@/components/ui/label";

interface RatingSliderProps {
  rating: number[];
  setRating: (rating: number[]) => void;
}

const RatingSlider = ({ rating, setRating }: RatingSliderProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)]">
        Your Rating: <span className="text-[var(--theme-text)] font-bold text-lg font-[var(--theme-fontPrimary)]">{rating[0]}/10</span>
        <span className="text-[var(--theme-textMuted)] text-sm ml-2">
          (≈ {Math.round((rating[0] / 10) * 100)}/100)
        </span>
      </Label>
      <div className="px-2">
        <div className="relative flex w-full touch-none select-none items-center">
          <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-700">
            <div 
              className="absolute h-full bg-[var(--theme-primary)] rounded-full" 
              style={{ width: `${(rating[0] / 10) * 100}%` }}
            />
          </div>
          <div 
            className="block h-5 w-5 rounded-full border-2 border-[var(--theme-primary)] bg-[var(--theme-background)] ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 absolute"
            style={{ left: `calc(${(rating[0] / 10) * 100}% - 10px)` }}
          />
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={rating[0]}
            onChange={(e) => setRating([parseInt(e.target.value)])}
            className="absolute w-full h-5 opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-xs text-[var(--theme-textMuted)] mt-1 font-[var(--theme-fontSecondary)]">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
};

export default RatingSlider;
