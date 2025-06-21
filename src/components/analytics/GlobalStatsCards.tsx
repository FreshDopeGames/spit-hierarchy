
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Vote, Users, Award, Star } from "lucide-react";

const GlobalStatsCards = () => {
  const { data: globalStats } = useQuery({
    queryKey: ["global-voting-stats"],
    queryFn: async () => {
      const [votesResult, usersResult, rapperTopCounts] = await Promise.all([
        supabase.from("votes").select("*", { count: "exact", head: true }),
        supabase.from("user_voting_stats").select("*"),
        supabase.rpc("get_rapper_top5_counts")
      ]);

      const activeRappersWithVotes = rapperTopCounts.data?.filter(r => r.top5_count > 0) || [];
      const avgRating = activeRappersWithVotes.length > 0 
        ? activeRappersWithVotes.reduce((sum, r) => sum + (r.top5_count || 0), 0) / activeRappersWithVotes.length 
        : 0;

      return {
        totalVotes: votesResult.count || 0,
        activeVoters: usersResult.data?.length || 0,
        ratedRappers: activeRappersWithVotes.length,
        avgRating: avgRating
      };
    }
  });

  if (!globalStats) return null;

  const statCards = [
    {
      icon: Vote,
      label: "Total Votes",
      value: globalStats.totalVotes,
      color: "from-rap-burgundy to-rap-forest"
    },
    {
      icon: Users,
      label: "Active Voters",
      value: globalStats.activeVoters,
      color: "from-rap-forest to-rap-gold"
    },
    {
      icon: Award,
      label: "Rated Rappers",
      value: globalStats.ratedRappers,
      color: "from-rap-gold to-rap-silver"
    },
    {
      icon: Star,
      label: "Avg Rating",
      value: globalStats.avgRating.toFixed(1),
      color: "from-rap-silver to-rap-platinum"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-carbon-fiber/90 border-rap-gold border-2 shadow-lg shadow-rap-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-5 h-5 text-rap-carbon" />
              </div>
              <div>
                <p className="text-rap-smoke text-sm font-merienda font-extrabold tracking-wide">{stat.label}</p>
                <p className="text-rap-platinum font-extrabold text-lg font-merienda">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GlobalStatsCards;
