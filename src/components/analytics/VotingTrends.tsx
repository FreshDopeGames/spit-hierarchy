
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

const VotingTrends = () => {
  const { data: votingTrends, isLoading } = useQuery({
    queryKey: ["voting-trends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("votes")
        .select("created_at, rating")
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      // Group votes by day for the last 30 days
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      
      const dailyVotes = data
        .filter(vote => new Date(vote.created_at) >= last30Days)
        .reduce((acc: any, vote) => {
          const date = new Date(vote.created_at).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = { date, votes: 0, totalRating: 0, count: 0 };
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
    return (
      <div className="space-y-4">
        <Card className="bg-black/40 border-purple-500/20 animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-700 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Daily Voting Activity (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={votingTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => new Date(value).getDate().toString()}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="votes" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-black/40 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Average Daily Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={votingTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => new Date(value).getDate().toString()}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Bar 
                dataKey="avgRating" 
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default VotingTrends;
