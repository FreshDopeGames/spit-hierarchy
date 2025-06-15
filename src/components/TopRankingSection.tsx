
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import RapperAvatar from "@/components/RapperAvatar";

type Rapper = Tables<"rappers">;

interface RapperWithVotes extends Rapper {
  ranking_votes?: number;
}

interface TopRankingSectionProps {
  rappers: RapperWithVotes[];
  rankingId?: string;
}

const TopRankingSection = ({ rappers, rankingId }: TopRankingSectionProps) => {
  return (
    <div className="space-y-8">
      {/* Top 2 in one row - TALLER CARDS for mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {rappers.slice(0, 2).map((rapper, index) => 
          <div key={rapper.id} className="flex items-center space-x-4 sm:space-x-6 p-6 sm:p-4 bg-gradient-to-r from-rap-carbon-light/40 to-transparent rounded-lg border border-rap-gold/30 min-h-[120px] sm:min-h-[100px]">
            <div className="flex items-center justify-center w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-rap-gold via-yellow-400 to-rap-gold shadow-lg flex-shrink-0">
              <span className="text-rap-carbon font-mogra text-lg sm:text-base font-bold">
                {index + 1}
              </span>
            </div>
            <RapperAvatar rapper={rapper} size="lg" />
            <div className="flex-1 min-w-0">
              <Link to={`/rapper/${rapper.id}`} className="group" onClick={() => window.scrollTo(0, 0)}>
                <h3 className="text-lg sm:text-lg font-mogra text-rap-platinum group-hover:text-rap-gold transition-colors truncate">
                  {rapper.name}
                </h3>
              </Link>
              {rapper.origin && 
                <p className="text-rap-smoke text-sm sm:text-sm font-kaushan mt-1 truncate">
                  {rapper.origin}
                </p>
              }
              <p className="text-rap-silver text-xs font-bold mt-1">
                Votes: {rankingId && rapper.ranking_votes !== undefined 
                  ? rapper.ranking_votes.toLocaleString()
                  : (rapper.total_votes || 0).toLocaleString()
                }
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Next 3 in one row - SHORTER CARDS for mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {rappers.slice(2, 5).map((rapper, index) => 
          <div key={rapper.id} className="flex flex-col items-center space-y-2 sm:space-y-3 p-4 sm:p-4 bg-gradient-to-b from-rap-carbon-light/20 to-transparent rounded-lg border border-rap-gold/10 min-h-[100px] sm:min-h-[120px]">
            <div className="flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-rap-gold via-yellow-400 to-rap-gold shadow-lg flex-shrink-0">
              <span className="text-rap-carbon font-mogra text-sm font-bold">
                {index + 3}
              </span>
            </div>
            <RapperAvatar rapper={rapper} size="sm" />
            <div className="text-center min-w-0 w-full">
              <Link to={`/rapper/${rapper.id}`} className="group" onClick={() => window.scrollTo(0, 0)}>
                <h4 className="text-sm sm:text-base font-mogra text-rap-platinum group-hover:text-rap-gold transition-colors truncate">
                  {rapper.name}
                </h4>
              </Link>
              {rapper.origin && 
                <p className="text-rap-smoke text-xs sm:text-xs font-kaushan mt-1 truncate">
                  {rapper.origin}
                </p>
              }
              <p className="text-rap-silver text-xs font-bold mt-1">
                Votes: {rankingId && rapper.ranking_votes !== undefined 
                  ? rapper.ranking_votes.toLocaleString()
                  : (rapper.total_votes || 0).toLocaleString()
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopRankingSection;
