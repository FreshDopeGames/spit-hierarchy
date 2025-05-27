
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RapperStatsProps {
  averageRating: number | null;
  totalVotes: number;
}

const RapperStats = ({ averageRating, totalVotes }: RapperStatsProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-yellow-500" />
        <span className="text-white font-semibold">
          {averageRating ? Number(averageRating).toFixed(1) : "—"}
        </span>
      </div>
      <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
        {totalVotes || 0} votes
      </Badge>
    </div>
  );
};

export default RapperStats;
