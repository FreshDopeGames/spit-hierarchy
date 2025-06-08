import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Star } from "lucide-react";

const TopVoters = () => {
  const {
    data: topVoters,
    isLoading
  } = useQuery({
    queryKey: ["top-voters"],
    queryFn: async () => {
      // First get the user voting stats
      const {
        data: votingStats,
        error: statsError
      } = await supabase.from("user_voting_stats").select("*").order("total_votes", {
        ascending: false
      }).limit(10);
      if (statsError) throw statsError;

      // Then get profile information for these users
      if (votingStats && votingStats.length > 0) {
        const userIds = votingStats.map(stat => stat.user_id);
        const {
          data: profiles,
          error: profilesError
        } = await supabase.from("profiles").select("id, username, full_name").in("id", userIds);
        if (profilesError) console.error("Error fetching profiles:", profilesError);

        // Merge the data
        return votingStats.map(stat => ({
          ...stat,
          profile: profiles?.find(p => p.id === stat.user_id) || null
        }));
      }
      return votingStats || [];
    }
  });
  if (isLoading) {
    return <ThemedCard className="animate-pulse">
        <ThemedCardContent className="p-6">
          <div className="h-64 bg-[var(--theme-surface)] rounded"></div>
        </ThemedCardContent>
      </ThemedCard>;
  }
  return <ThemedCard className="bg-rap-carbon border-2 border-rap-gold">
      <ThemedCardHeader>
        <ThemedCardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Top Voters
        </ThemedCardTitle>
      </ThemedCardHeader>
      <ThemedCardContent>
        <div className="space-y-3">
          {topVoters?.map((voter: any, index: number) => <div key={voter.user_id} className="flex items-center justify-between p-3 bg-[var(--theme-surface)]/30 border border-[var(--theme-border)] rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[var(--theme-background)] font-bold text-sm font-[var(--theme-font-heading)] ${index === 0 ? 'bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primaryLight)]' : index === 1 ? 'bg-gradient-to-r from-[var(--theme-primaryLight)] to-[var(--theme-text)]' : index === 2 ? 'bg-gradient-to-r from-[var(--theme-secondary)] to-[var(--theme-primary)]' : 'bg-gradient-to-r from-[var(--theme-secondary)] to-[var(--theme-accent)]'}`}>
                  #{index + 1}
                </div>
                <div>
                  <p className="text-[var(--theme-text)] font-medium font-[var(--theme-font-body)]">
                    {voter.profile?.full_name || voter.profile?.username || 'Anonymous User'}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[var(--theme-textMuted)]">
                    <span className="font-[var(--theme-font-body)]">{voter.unique_rappers_voted} rappers</span>
                    <span>•</span>
                    <span className="font-[var(--theme-font-body)]">{voter.categories_used} categories</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-[var(--theme-text)] font-bold font-[var(--theme-font-heading)]">{voter.total_votes}</p>
                  <p className="text-[var(--theme-textMuted)] text-xs font-[var(--theme-font-body)]">Votes</p>
                </div>
                <Badge variant="secondary" className="bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border-[var(--theme-primary)]/30">
                  {Number(voter.average_rating_given || 0).toFixed(1)} avg
                </Badge>
              </div>
            </div>)}
          
          {(!topVoters || topVoters.length === 0) && <div className="text-center py-8">
              <Users className="w-12 h-12 text-[var(--theme-textMuted)] mx-auto mb-2" />
              <p className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)]">No voting data available yet</p>
            </div>}
        </div>
      </ThemedCardContent>
    </ThemedCard>;
};

export default TopVoters;
