
import { Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  slug?: string;
}

interface OfficialRankingsSectionProps {
  rankings: OfficialRanking[];
  onRankingClick: (id: string) => void;
}

const OfficialRankingsSection = ({ rankings, onRankingClick }: OfficialRankingsSectionProps) => {
  return (
    <div className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-rap-gold flex-shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold text-rap-platinum font-mogra">Official Rankings</h2>
          <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30 font-kaushan text-xs sm:text-sm">
            Curated Topics
          </Badge>
        </div>
        
        <Link to="/official-rankings" className="w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-carbon font-kaushan text-sm px-3 py-2"
          >
            See All Official Rankings
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {rankings.map((ranking) => (
          <div key={ranking.id}>
            {ranking.slug ? (
              <Link to={`/rankings/official/${ranking.slug}`}>
                <RankingCard
                  {...ranking}
                  onClick={() => {}} // Not used since we're using Link
                />
              </Link>
            ) : (
              <RankingCard
                {...ranking}
                onClick={onRankingClick}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfficialRankingsSection;
