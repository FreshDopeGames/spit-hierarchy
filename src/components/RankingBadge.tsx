
import { Crown } from "lucide-react";

interface RankingBadgeProps {
  position: number;
}

const RankingBadge = ({ position }: RankingBadgeProps) => {
  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    return null;
  };

  const getRankBadgeColor = (position: number) => {
    switch (position) {
      case 1: return "from-yellow-500 to-orange-500";
      case 2: return "from-gray-400 to-gray-600";
      case 3: return "from-amber-600 to-yellow-700";
      default: return "from-purple-500 to-blue-500";
    }
  };

  return (
    <div className={`absolute -top-2 -left-2 bg-gradient-to-r ${getRankBadgeColor(position)} text-white text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center z-10`}>
      {getRankIcon(position) || `#${position}`}
    </div>
  );
};

export default RankingBadge;
