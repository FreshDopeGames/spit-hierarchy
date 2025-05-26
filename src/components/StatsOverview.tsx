
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-black/40 border-purple-500/20 animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: "Total Rappers",
      value: stats?.totalRappers || 0,
      color: "from-purple-500 to-blue-500"
    },
    {
      icon: Vote,
      label: "Total Votes",
      value: stats?.totalVotes || 0,
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Trophy,
      label: "Categories",
      value: stats?.totalCategories || 0,
      color: "from-cyan-500 to-green-500"
    },
    {
      icon: TrendingUp,
      label: "Top Rated",
      value: stats?.topRapper || "N/A",
      color: "from-green-500 to-yellow-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-black/40 border-purple-500/20 hover:border-purple-400/40 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-white font-bold text-lg">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
