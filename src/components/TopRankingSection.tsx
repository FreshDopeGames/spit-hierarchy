
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import RapperAvatar from "@/components/RapperAvatar";
import { Star, MapPin } from "lucide-react";

type Rapper = Tables<"rappers">;

interface RapperWithVotes extends Rapper {
  ranking_votes?: number;
}

interface TopRankingSectionProps {
  rappers: RapperWithVotes[];
  rankingId?: string;
}

const TopRankingSection = ({ rappers, rankingId }: TopRankingSectionProps) => {
  const getVoteDisplay = (voteCount: number | undefined) => {
    const count = rankingId && voteCount !== undefined ? voteCount : 0;
    
    if (count === 0) {
      return (
        <div className="flex items-center gap-1 mt-3">
          <Star className="w-4 h-4 text-rap-gold/50" />
          <span className="text-rap-smoke/70 font-kaushan text-sm italic">
            Vote to rank
          </span>
        </div>
      );
    }
    
    return (
      <p className="text-rap-silver text-sm sm:text-base font-bold mt-3">
        Votes: {count.toLocaleString()}
      </p>
    );
  };

  return (
    <div className="space-y-8">
      {/* Top 2 in one row - Use xlarge for prominence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {rappers.slice(0, 2).map((rapper, index) => 
          <div key={rapper.id} className="flex flex-col items-center space-y-4 p-6 sm:p-6 bg-black rounded-lg border border-rap-gold/30 min-h-[200px] sm:min-h-[180px]">
            <div className="flex items-center justify-center w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-rap-gold-dark via-rap-gold to-rap-gold-light shadow-lg flex-shrink-0">
              <span className="text-rap-carbon font-mogra text-lg sm:text-base font-bold">
                {index + 1}
              </span>
            </div>
            <RapperAvatar rapper={rapper} size="xl" />
            <div className="flex-1 text-center w-full">
              <Link to={`/rapper/${rapper.id}`} className="group" onClick={() => window.scrollTo(0, 0)}>
                <h3 className="text-xl sm:text-2xl font-mogra text-rap-platinum group-hover:text-rap-gold transition-colors leading-tight mb-2">
                  {rapper.name}
                </h3>
              </Link>
              {rapper.origin && 
                <div className="flex items-center justify-center gap-1 mt-2">
                  <MapPin className="w-4 h-4 text-rap-smoke" />
                  <p className="text-rap-smoke text-base sm:text-lg font-kaushan leading-relaxed">
                    {rapper.origin}
                  </p>
                </div>
              }
              {getVoteDisplay(rapper.ranking_votes)}
            </div>
          </div>
        )}
      </div>
      
      {/* Next 3 in one row - Use medium for smaller cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {rappers.slice(2, 5).map((rapper, index) => 
          <div key={rapper.id} className="flex flex-col items-center space-y-2 sm:space-y-3 p-4 sm:p-4 bg-black rounded-lg border border-rap-gold/10 min-h-[140px] sm:min-h-[160px]">
            <div className="flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-rap-gold-dark via-rap-gold to-rap-gold-light shadow-lg flex-shrink-0">
              <span className="text-rap-carbon font-mogra text-sm font-bold">
                {index + 3}
              </span>
            </div>
            <RapperAvatar rapper={rapper} size="md" />
            <div className="text-center min-w-0 w-full">
              <Link to={`/rapper/${rapper.id}`} className="group" onClick={() => window.scrollTo(0, 0)}>
                <h4 className="text-base sm:text-lg font-mogra text-rap-platinum group-hover:text-rap-gold transition-colors truncate">
                  {rapper.name}
                </h4>
              </Link>
              {rapper.origin && 
                <div className="flex items-center justify-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-rap-smoke" />
                  <p className="text-rap-smoke text-sm sm:text-sm font-kaushan truncate">
                    {rapper.origin}
                  </p>
                </div>
              }
              <div className="mt-1">
                {(() => {
                  const voteCount = rankingId && rapper.ranking_votes !== undefined 
                    ? rapper.ranking_votes 
                    : (rapper.total_votes || 0);
                  
                  if (voteCount === 0) {
                    return (
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 text-rap-gold/50" />
                        <span className="text-rap-smoke/70 font-kaushan text-xs italic">
                          Vote now
                        </span>
                      </div>
                    );
                  }
                  
                  return (
                    <p className="text-rap-silver text-xs font-bold">
                      Votes: {voteCount.toLocaleString()}
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopRankingSection;
