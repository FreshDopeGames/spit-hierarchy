import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { Vote, Users, Award, Star } from "lucide-react";

interface GlobalStatsCardsProps {
  countryCode?: string | null;
  region?: string | null;
}

const GlobalStatsCards = ({ countryCode, region }: GlobalStatsCardsProps) => {
  const { data: globalStats } = useQuery({
    queryKey: ["global-voting-stats", countryCode, region],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_global_voting_stats", {
        p_country_code: countryCode || null,
        p_region: region || null,
      });
      if (error) throw error;
      return data?.[0] || { total_votes: 0, active_voters: 0, rated_rappers: 0, avg_rating: 0 };
    },
  });

  if (!globalStats) return null;

  const statCards = [
    { icon: Vote, label: "Total Votes", value: globalStats.total_votes, color: "from-[var(--theme-primaryDark)] to-[var(--theme-accent)]" },
    { icon: Users, label: "Active Voters", value: globalStats.active_voters, color: "from-[var(--theme-accent)] to-[var(--theme-primary)]" },
    { icon: Award, label: "Rated Rappers", value: globalStats.rated_rappers, color: "from-[var(--theme-primary)] to-[var(--theme-secondary)]" },
    { icon: Star, label: "Avg Rating", value: Number(globalStats.avg_rating).toFixed(1), color: "from-[var(--theme-secondary)] to-[var(--theme-primaryLight)]" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-[var(--theme-surface)] border-[hsl(var(--theme-primary))] border-4 shadow-lg shadow-[var(--theme-primary)]/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-5 h-5 text-[var(--theme-background)]" />
              </div>
              <div>
                <p className="text-[var(--theme-textMuted)] text-sm font-[var(--theme-font-body)] font-extrabold tracking-wide">{stat.label}</p>
                <p className="text-[var(--theme-text)] font-extrabold text-lg font-[var(--theme-font-heading)]">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GlobalStatsCards;
