
import { useMemberStatus } from "@/hooks/useMemberStatus";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { TrendingUp, Vote, Trophy, Calendar, MessageCircle } from "lucide-react";

const UserVotingDashboard = () => {
  const { memberStats, currentStatus } = useMemberStatus();

  if (!memberStats) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h3 className="font-[var(--theme-fontPrimary)] text-[var(--theme-primary)] mb-3 sm:mb-4 font-thin sm:text-6xl text-4xl">
          My Stats
        </h3>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-[var(--theme-surface)]/50 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="font-[var(--theme-fontPrimary)] text-[var(--theme-primary)] mb-3 sm:mb-4 font-thin sm:text-6xl text-4xl">
        My Stats
      </h3>

      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        <Card className="bg-[var(--theme-surface)]/90 border border-[var(--theme-primary)]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--theme-textMuted)]">Total Votes</CardTitle>
            <Vote className="h-4 w-4 text-[var(--theme-primary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--theme-primary)]">
              {memberStats.total_votes?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--theme-surface)]/90 border border-[var(--theme-primary)]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--theme-textMuted)]">Rankings Created</CardTitle>
            <Trophy className="h-4 w-4 text-[var(--theme-primary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--theme-primary)]">
              {memberStats.ranking_lists_created || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--theme-surface)]/90 border border-[var(--theme-primary)]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--theme-textMuted)]">Consecutive Days</CardTitle>
            <Calendar className="h-4 w-4 text-[var(--theme-primary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--theme-primary)]">
              {memberStats.consecutive_voting_days || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--theme-surface)]/90 border border-[var(--theme-primary)]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--theme-textMuted)]">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-[var(--theme-primary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--theme-primary)]">
              {memberStats.total_comments || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--theme-surface)]/90 border border-[var(--theme-primary)]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--theme-textMuted)]">Upvotes Received</CardTitle>
            <TrendingUp className="h-4 w-4 text-[var(--theme-primary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--theme-primary)]">
              {memberStats.total_upvotes || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserVotingDashboard;
