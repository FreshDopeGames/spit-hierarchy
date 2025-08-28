
import { Crown, Trophy, Star, TrendingUp } from "lucide-react";

interface PositionIconProps {
  position: number;
}

const PositionIcon = ({ position }: PositionIconProps) => {
  switch (position) {
    case 1:
      return <Crown className="w-6 h-6 text-[var(--theme-primary)]" />;
    case 2:
      return <Trophy className="w-6 h-6 text-[var(--theme-secondary)]" />;
    case 3:
      return <Star className="w-6 h-6 text-[var(--theme-accent)]" />;
    default:
      return <TrendingUp className="w-6 h-6 text-[var(--theme-textMuted)]" />;
  }
};

export default PositionIcon;
