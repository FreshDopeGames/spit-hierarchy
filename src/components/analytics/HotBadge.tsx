
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame } from "lucide-react";

interface HotBadgeProps {
  isHot: boolean;
  voteVelocity?: number;
  variant?: "default" | "compact";
}

const HotBadge = ({ isHot, voteVelocity, variant = "default" }: HotBadgeProps) => {
  if (!isHot) return null;

  if (variant === "compact") {
    return (
      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs px-2 py-1">
        <Flame className="w-3 h-3 mr-1" />
        Hot
      </Badge>
    );
  }

  return (
    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 animate-pulse">
      <Flame className="w-4 h-4 mr-1" />
      Hot
      {voteVelocity && voteVelocity > 0 && (
        <>
          <TrendingUp className="w-3 h-3 ml-1 mr-1" />
          <span className="text-xs">+{voteVelocity}</span>
        </>
      )}
    </Badge>
  );
};

export default HotBadge;
