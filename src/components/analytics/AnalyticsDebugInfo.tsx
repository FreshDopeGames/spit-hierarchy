
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Database, Users, Vote } from "lucide-react";

const AnalyticsDebugInfo = () => {
  const { data: debugInfo } = useQuery({
    queryKey: ["analytics-debug"],
    queryFn: async () => {
      // Get vote count
      const { count: voteCount } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true });

      // Get user count using admin function
      const { data: allProfiles } = await supabase
        .rpc('search_profiles_admin', { search_term: '' });
      const userCount = allProfiles?.length || 0;

      // Get recent votes for trends
      const { data: recentVotes } = await supabase
        .from("votes")
        .select("created_at, rating")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false });

      return {
        totalVotes: voteCount || 0,
        totalUsers: userCount || 0,
        recentVotes: recentVotes?.length || 0
      };
    }
  });

  if (!debugInfo) return null;

  return (
    <Card className="bg-[var(--theme-surface)] border-[var(--theme-primary)]/30 shadow-lg shadow-[var(--theme-primary)]/20 mb-6">
      <CardHeader>
        <CardTitle className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] flex items-center gap-2">
          <Database className="w-5 h-5" />
          Analytics Data Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Vote className="w-4 h-4 text-[var(--theme-primary)]" />
              <span className="text-[var(--theme-text)] font-bold">{debugInfo.totalVotes}</span>
            </div>
            <p className="text-[var(--theme-textMuted)] text-sm">Total Votes</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-4 h-4 text-[var(--theme-primary)]" />
              <span className="text-[var(--theme-text)] font-bold">{debugInfo.totalUsers}</span>
            </div>
            <p className="text-[var(--theme-textMuted)] text-sm">Users</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Database className="w-4 h-4 text-[var(--theme-primary)]" />
              <span className="text-[var(--theme-text)] font-bold">{debugInfo.recentVotes}</span>
            </div>
            <p className="text-[var(--theme-textMuted)] text-sm">Recent Votes (7d)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDebugInfo;
