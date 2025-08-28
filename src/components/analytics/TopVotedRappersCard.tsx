
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

const TopVotedRappersCard = () => {
  const { data: topRappers, isLoading } = useQuery({
    queryKey: ["top-voted-rappers"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_rapper_voting_stats");
      if (error) throw error;
      return data?.slice(0, 5) || [];
    }
  });

  if (isLoading) {
    return (
      <Card className="bg-[var(--theme-surface)] border-[var(--theme-primary)]/30 shadow-lg shadow-[var(--theme-primary)]/20 animate-pulse border-2 border-[var(--theme-primary)]">
        <CardContent className="p-6">
          <div className="h-32 bg-[var(--theme-background)] rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!topRappers || topRappers.length === 0) return null;

  return (
    <Card className="bg-[var(--theme-surface)] border-[var(--theme-primary)]/30 shadow-lg shadow-[var(--theme-primary)]/20 border-2 border-[var(--theme-primary)]">
      <CardHeader>
        <CardTitle className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] flex items-center gap-2 font-extrabold text-3xl">
          <Users className="w-5 h-5" />
          Most Voted Rappers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topRappers.map((rapper: any, index: number) => (
            <div key={rapper.id} className="flex items-center justify-between p-3 bg-[var(--theme-background)] border border-[var(--theme-primary)]/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] rounded-full flex items-center justify-center text-[var(--theme-background)] font-bold text-sm font-[var(--theme-font-heading)]">
                  #{index + 1}
                </div>
                <div>
                  <h4 className="text-[var(--theme-text)] font-medium font-[var(--theme-font-body)]">{rapper.name}</h4>
                  <p className="text-[var(--theme-textMuted)] text-base font-[var(--theme-font-body)]">{rapper.unique_voters} unique voters</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[var(--theme-text)] font-bold font-[var(--theme-font-heading)] text-2xl">{rapper.total_votes}</p>
                <p className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-base">Total Votes</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopVotedRappersCard;
