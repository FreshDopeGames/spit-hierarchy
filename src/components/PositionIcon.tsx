
import { Crown, Trophy, Star, TrendingUp } from "lucide-react";

interface PositionIconProps {
  position: number;
}

const PositionIcon = ({ position }: PositionIconProps) => {
  switch (position) {
    case 1:
      return <Crown className="w-6 h-6 text-rap-gold" />;
    case 2:
      return <Trophy className="w-6 h-6 text-rap-silver" />;
    case 3:
      return <Star className="w-6 h-6 text-orange-500" />;
    default:
      return <TrendingUp className="w-6 h-6 text-rap-platinum" />;
  }
};

export default PositionIcon;
