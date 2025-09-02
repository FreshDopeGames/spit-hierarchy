import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { Vote, Users, Award, Star } from "lucide-react";
const GlobalStatsCards = () => {
  const {
    data: globalStats
  } = useQuery({
    queryKey: ["global-voting-stats"],
    queryFn: async () => {
      // Get total votes count
      const {
        count: totalVotes
      } = await supabase.from("votes").select("*", {
        count: "exact",
        head: true
      });

      // Get active voters (distinct users who have voted)
      const {
        data: activeVotersData
      } = await supabase.from("votes").select("user_id").not("user_id", "is", null);
      const uniqueVoters = new Set(activeVotersData?.map(v => v.user_id) || []);
      const activeVoters = uniqueVoters.size;

      // Get rated rappers (distinct rappers who have received votes)
      const {
        data: ratedRappersData
      } = await supabase.from("votes").select("rapper_id").not("rapper_id", "is", null);
      const uniqueRappers = new Set(ratedRappersData?.map(v => v.rapper_id) || []);
      const ratedRappers = uniqueRappers.size;

      // Get average rating from all votes
      const {
        data: avgRatingData
      } = await supabase.from("votes").select("rating");
      const ratings = avgRatingData?.map(v => v.rating) || [];
      const avgRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
      return {
        totalVotes: totalVotes || 0,
        activeVoters,
        ratedRappers,
        avgRating
      };
    }
  });
  if (!globalStats) return null;
  const statCards = [{
    icon: Vote,
    label: "Total Votes",
    value: globalStats.totalVotes,
    color: "from-[var(--theme-primaryDark)] to-[var(--theme-accent)]"
  }, {
    icon: Users,
    label: "Active Voters",
    value: globalStats.activeVoters,
    color: "from-[var(--theme-accent)] to-[var(--theme-primary)]"
  }, {
    icon: Award,
    label: "Rated Rappers",
    value: globalStats.ratedRappers,
    color: "from-[var(--theme-primary)] to-[var(--theme-secondary)]"
  }, {
    icon: Star,
    label: "Avg Rating",
    value: globalStats.avgRating.toFixed(1),
    color: "from-[var(--theme-secondary)] to-[var(--theme-primaryLight)]"
  }];
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => <Card key={index} className="bg-[var(--theme-surface)] border-[var(--theme-primary)] border-2 shadow-lg shadow-[var(--theme-primary)]/20">
          <CardContent className="p-4 bg-[inheri] bg-background">
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
        </Card>)}
    </div>;
};
export default GlobalStatsCards;