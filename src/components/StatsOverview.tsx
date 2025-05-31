
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Vote, Trophy, TrendingUp } from "lucide-react";

const StatsOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["site-stats"],
    queryFn: async () => {
      // Get total rappers
      const { count: totalRappers } = await supabase
        .from("rappers")
        .select("*", { count: "exact", head: true });

      // Get total votes
      const { count: totalVotes } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true });

      // Get total categories
      const { count: totalCategories } = await supabase
        .from("voting_categories")
        .select("*", { count: "exact", head: true })
        .eq("active", true);

      // Get top rated rapper
      const { data: topRapper } = await supabase
        .from("rappers")
        .select("name, average_rating")
        .gt("total_votes", 0)
        .order("average_rating", { ascending: false })
        .limit(1)
        .single();

      return {
        totalRappers: totalRappers || 0,
        totalVotes: totalVotes || 0,
        totalCategories: totalCategories || 0,
        topRapper: topRapper?.name || "N/A"
      };
    }
  });

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-ceviche text-rap-gold mb-2 animate-text-glow tracking-wider">
            Dynasty Statistics
          </h2>
          <p className="text-rap-platinum font-kaushan text-lg">
            Sacred numbers from the Temple archives
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-carbon-fiber border-rap-gold/20 animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-rap-carbon-light rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: "Pharaohs",
      value: stats?.totalRappers || 0,
      color: "from-rap-burgundy to-rap-burgundy-light"
    },
    {
      icon: Vote,
      label: "Sacred Votes",
      value: stats?.totalVotes || 0,
      color: "from-rap-forest to-rap-forest-light"
    },
    {
      icon: Trophy,
      label: "Royal Decrees",
      value: stats?.totalCategories || 0,
      color: "from-rap-gold to-rap-gold-light"
    },
    {
      icon: TrendingUp,
      label: "Supreme Ruler",
      value: stats?.topRapper || "N/A",
      color: "from-rap-silver to-rap-platinum"
    }
  ];

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-ceviche text-rap-gold mb-2 animate-text-glow tracking-wider">
          Dynasty Statistics
        </h2>
        <p className="text-rap-platinum font-kaushan text-lg">
          Sacred numbers from the Temple archives
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-carbon-fiber border border-rap-gold/40 hover:border-rap-gold/70 transition-all duration-300 hover:transform hover:scale-105 shadow-lg shadow-rap-gold/20 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest"></div>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg group-hover:animate-glow-pulse`}>
                  <stat.icon className="w-5 h-5 text-rap-carbon" />
                </div>
                <div>
                  <p className="text-rap-smoke text-sm font-kaushan tracking-wide">{stat.label}</p>
                  <p className="text-rap-platinum font-bold text-lg font-mogra">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StatsOverview;
