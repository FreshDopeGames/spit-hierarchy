
import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import RankingCard from "./RankingCard";

interface Rapper {
  rank: number;
  name: string;
  reason: string;
}

interface OfficialRanking {
  id: string;
  title: string;
  description: string;
  author: string;
  timeAgo: string;
  rappers: Rapper[];
  likes: number;
  views: number;
  isOfficial: boolean;
  tags: string[];
}

interface OfficialRankingsSectionProps {
  rankings: OfficialRanking[];
  onRankingClick: (id: string) => void;
}

const OfficialRankingsSection = ({ rankings, onRankingClick }: OfficialRankingsSectionProps) => {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-6 h-6 text-yellow-500" />
        <h2 className="text-3xl font-bold text-white">Official Rankings</h2>
        <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
          Curated Topics
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {rankings.map((ranking) => (
          <RankingCard
            key={ranking.id}
            {...ranking}
            onClick={onRankingClick}
          />
        ))}
      </div>
    </div>
  );
};

export default OfficialRankingsSection;
