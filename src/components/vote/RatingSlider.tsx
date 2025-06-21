
import React from "react";
import { Label } from "@/components/ui/label";

interface RatingSliderProps {
  rating: number[];
  setRating: (rating: number[]) => void;
}

const RatingSlider = ({ rating, setRating }: RatingSliderProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-rap-smoke font-kaushan">
        Your Rating: <span className="text-rap-platinum font-bold text-lg font-mogra">{rating[0]}/10</span>
        <span className="text-rap-smoke text-sm ml-2">
          (≈ {Math.round((rating[0] / 10) * 100)}/100)
        </span>
      </Label>
      <div className="px-2">
        <div className="relative flex w-full touch-none select-none items-center">
          <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-rap-charcoal">
            <div 
              className="absolute h-full bg-rap-gold rounded-full" 
              style={{ width: `${(rating[0] / 10) * 100}%` }}
            />
          </div>
          <div 
            className="block h-5 w-5 rounded-full border-2 border-rap-gold bg-rap-carbon ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rap-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 absolute"
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
        <div className="flex justify-between text-xs text-rap-smoke mt-1 font-kaushan">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
};

export default RatingSlider;
