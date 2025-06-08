import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

const VotingTrends = () => {
  const {
    data: votingTrends,
    isLoading
  } = useQuery({
    queryKey: ["voting-trends"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("votes").select("created_at, rating").order("created_at", {
        ascending: true
      });
      if (error) throw error;

      // Group votes by day for the last 30 days
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      const dailyVotes = data.filter(vote => new Date(vote.created_at) >= last30Days).reduce((acc: any, vote) => {
        const date = new Date(vote.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            votes: 0,
            totalRating: 0,
            count: 0
          };
        }
        acc[date].votes += 1;
        acc[date].totalRating += vote.rating;
        acc[date].count += 1;
        return acc;
      }, {});
      return Object.values(dailyVotes).map((day: any) => ({
        ...day,
        avgRating: day.count > 0 ? (day.totalRating / day.count).toFixed(1) : 0
      }));
    }
  });
  if (isLoading) {
    return <div className="space-y-4">
        <ThemedCard className="animate-pulse">
          <ThemedCardContent className="p-6">
            <div className="h-64 bg-[var(--theme-surface)] rounded"></div>
          </ThemedCardContent>
        </ThemedCard>
      </div>;
  }
  return <div className="space-y-6">
      <ThemedCard className="border-2 border-rap-gold">
        <ThemedCardHeader className="bg-rap-carbon">
          <ThemedCardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Daily Voting Activity (Last 30 Days)
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent className="bg-rap-carbon">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={votingTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" />
              <XAxis dataKey="date" stroke="var(--theme-textMuted)" fontSize={12} tickFormatter={value => new Date(value).getDate().toString()} />
              <YAxis stroke="var(--theme-textMuted)" fontSize={12} />
              <Tooltip contentStyle={{
              backgroundColor: 'var(--theme-surface)',
              border: `1px solid var(--theme-border)`,
              borderRadius: 'var(--theme-radius-md)',
              color: 'var(--theme-text)'
            }} labelFormatter={value => new Date(value).toLocaleDateString()} />
              <Line type="monotone" dataKey="votes" stroke="var(--theme-primary)" strokeWidth={2} dot={{
              fill: 'var(--theme-primary)',
              strokeWidth: 2
            }} />
            </LineChart>
          </ResponsiveContainer>
        </ThemedCardContent>
      </ThemedCard>

      <ThemedCard className="border-2 border-rap-gold">
        <ThemedCardHeader className="bg-rap-carbon">
          <ThemedCardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Average Daily Rating
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent className="bg-rap-carbon rounded-none">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={votingTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" />
              <XAxis dataKey="date" stroke="var(--theme-textMuted)" fontSize={12} tickFormatter={value => new Date(value).getDate().toString()} />
              <YAxis stroke="var(--theme-textMuted)" fontSize={12} domain={[0, 10]} />
              <Tooltip contentStyle={{
              backgroundColor: 'var(--theme-surface)',
              border: `1px solid var(--theme-border)`,
              borderRadius: 'var(--theme-radius-md)',
              color: 'var(--theme-text)'
            }} labelFormatter={value => new Date(value).toLocaleDateString()} />
              <Bar dataKey="avgRating" fill="var(--theme-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ThemedCardContent>
      </ThemedCard>
    </div>;
};

export default VotingTrends;
