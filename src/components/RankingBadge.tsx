
import { Crown } from "lucide-react";

interface RankingBadgeProps {
  position: number;
}

const RankingBadge = ({ position }: RankingBadgeProps) => {
const getRankIcon = (position: number) => {
  if (position === 1) return <Crown className="w-5 h-5 text-[var(--theme-primary)]" />;
  return null;
};

const getRankBadgeColor = (position: number) => {
  switch (position) {
    case 1: return "bg-[var(--theme-gradient-primary)]";
    case 2: return "bg-[var(--theme-gradient-neutral)]";
    case 3: return "bg-[var(--theme-gradient-warning)]";
    default: return "bg-[var(--theme-gradient-accent)]";
  }
};

  return (
    <div className={`absolute -top-3 -right-3 ${getRankBadgeColor(position)} text-[var(--theme-textLight)] text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center z-10`}>
      {getRankIcon(position) || position}
    </div>
  );
};

export default RankingBadge;
