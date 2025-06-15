import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import PositionIcon from "@/components/PositionIcon";
import TopRankingSection from "@/components/TopRankingSection";

type Rapper = Tables<"rappers">;

interface TopRappersGridProps {
  title?: string;
  description?: string;
  rappers?: Rapper[];
  showViewAll?: boolean;
  viewAllLink?: string;
  rankingId?: string;
}

interface RapperWithVotes extends Rapper {
  ranking_votes?: number;
}

const TopRappersGrid = ({
  title = "The GOATs",
  description = "The undisputed legends who shaped the culture",
  rappers: providedRappers,
  showViewAll = false,
  viewAllLink = "/all-rappers",
  rankingId
}: TopRappersGridProps) => {
  // Only fetch default data if no rappers are provided
  const {
    data: fetchedRappers = [],
    isLoading
  } = useQuery({
    queryKey: ["top-rappers"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase
        .from("rappers")
        .select("*")
        .order("total_votes", { ascending: false })
        .order("average_rating", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !providedRappers,
    refetchInterval: 10000, // Refetch every 10 seconds for homepage
    refetchIntervalInBackground: true,
  });

  // Fetch ranking-specific vote counts if rankingId is provided
  const { data: rankingVoteCounts = {} } = useQuery({
    queryKey: ["ranking-vote-counts", rankingId],
    queryFn: async () => {
      if (!rankingId) return {};
      
      const { data, error } = await supabase
        .from("ranking_votes")
        .select("rapper_id, vote_weight")
        .eq("ranking_id", rankingId);
      
      if (error) throw error;
      
      // Aggregate vote counts by rapper
      const counts: Record<string, number> = {};
      data.forEach(vote => {
        counts[vote.rapper_id] = (counts[vote.rapper_id] || 0) + vote.vote_weight;
      });
      
      return counts;
    },
    enabled: !!rankingId
  });

  const rappers = providedRappers || fetchedRappers;

  // Enhance rappers with ranking-specific vote counts and sort by votes when rankingId is present
  const rappersWithVotes: RapperWithVotes[] = rappers.map(rapper => ({
    ...rapper,
    ranking_votes: rankingId ? (rankingVoteCounts[rapper.id] || 0) : undefined
  }));

  // Sort by ranking votes if we have rankingId, otherwise keep original order
  const sortedRappers = rankingId 
    ? rappersWithVotes.sort((a, b) => (b.ranking_votes || 0) - (a.ranking_votes || 0))
    : rappersWithVotes;

  if (isLoading && !providedRappers) {
    return (
      <section className="mb-16">
        <div className="animate-pulse">
          <div className="h-8 bg-rap-carbon-light rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => 
              <div key={i} className="h-64 bg-rap-carbon-light rounded"></div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <Card className="bg-carbon-fiber border-rap-gold/30 shadow-lg shadow-rap-gold/20">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <PositionIcon position={1} />
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-rap-platinum font-mogra">{title}</h2>
                <p className="text-rap-smoke font-merienda text-sm sm:text-base mt-1">
                  {description}
                </p>
              </div>
            </div>
            
            {showViewAll && 
              <Link to={viewAllLink} className="w-full sm:w-auto" onClick={() => window.scrollTo(0, 0)}>
                <Button className="w-full sm:w-auto bg-rap-gold text-rap-charcoal hover:bg-rap-gold/80 hover:text-rap-carbon font-mogra text-sm px-3 py-2">
                  View Full Ranking
                </Button>
              </Link>
            }
          </div>
          
          <TopRankingSection rappers={sortedRappers} rankingId={rankingId} />
        </CardContent>
      </Card>
    </section>
  );
};

export default TopRappersGrid;
