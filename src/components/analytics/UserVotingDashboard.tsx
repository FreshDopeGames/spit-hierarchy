
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vote, Users, Star, Calendar, TrendingUp, Award } from "lucide-react";

const UserVotingDashboard = () => {
  const { user } = useAuth();

  const { data: userStats, isLoading } = useQuery({
    queryKey: ["user-voting-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Try to get user stats from the secure function first (admin only)
      const { data: adminStats } = await supabase.rpc("get_user_voting_stats");
      const userStat = adminStats?.find((stat: any) => stat.user_id === user.id);
      
      if (userStat) {
        return userStat;
      }
      
      // Fallback to member_stats for basic info
      const { data, error } = await supabase
        .from("member_stats")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: recentVotes, isLoading: loadingRecent } = useQuery({
    queryKey: ["user-recent-ranking-votes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("ranking_votes")
        .select(`
          *,
          rapper:rappers (
            name
          ),
          ranking:official_rankings (
            title
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  if (!user) {
    return (
      <Card className="bg-black/40 border-2 border-rap-gold">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">Please log in to view your voting statistics.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-black/40 border-2 border-rap-gold animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = userStats || {
    total_votes: 0,
    unique_rappers_voted: 0,
    categories_used: 0,
    average_rating_given: 0,
    last_vote_date: null,
    first_vote_date: null
  };

  const statCards = [
    {
      icon: Vote,
      label: "Total Votes",
      value: stats.total_votes || 0,
      color: "from-purple-500 to-blue-500"
    },
    {
      icon: Users,
      label: "Rappers Voted",
      value: stats.unique_rappers_voted || 0,
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Award,
      label: "Categories Used",
      value: stats.categories_used || 0,
      color: "from-cyan-500 to-green-500"
    },
    {
      icon: Star,
      label: "Avg Rating Given",
      value: stats.average_rating_given ? Number(stats.average_rating_given).toFixed(1) : "0.0",
      color: "from-green-500 to-yellow-500"
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl mb-4 text-rap-gold font-extrabold">Your Voting Statistics</h3>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-black/40 border-2 border-rap-gold">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-rap-gold-light text-xs">{stat.label}</p>
                  <p className="font-bold text-lg text-white">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Voting Timeline */}
      {stats.first_vote_date && (
        <Card className="bg-black/40 border-2 border-rap-gold">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rap-gold">
              <Calendar className="w-5 h-5" />
              Voting Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-base">First Vote:</span>
                <span className="text-white text-xl">
                  {new Date(stats.first_vote_date).toLocaleDateString()}
                </span>
              </div>
              {stats.last_vote_date && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-base">Last Vote:</span>
                  <span className="text-white text-xl">
                    {new Date(stats.last_vote_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Votes */}
      {recentVotes && recentVotes.length > 0 && (
        <Card className="bg-black/40 border-2 border-rap-gold">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rap-gold">
              <TrendingUp className="w-5 h-5" />
              Recent Ranking Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentVotes.map((vote: any) => (
                <div key={vote.id} className="flex items-center gap-5 text-rap-gold bg-rap-gold px-[10px] py-[11px] rounded">
                  <div className="flex-1">
                    <p className="text-black font-extrabold text-xl">{vote.rapper?.name}</p>
                    <p className="text-rap-carbon font-bold">{vote.ranking?.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-rap-gold-dark bg-black">
                      {vote.vote_weight}x vote ({vote.member_status})
                    </Badge>
                    <span className="text-xs font-normal text-black">
                      {new Date(vote.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.total_votes === 0 && (
        <Card className="bg-black/40 border-2 border-rap-gold">
          <CardContent className="p-6 text-center">
            <Vote className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Votes Yet</h3>
            <p className="text-gray-400">Start voting for your favorite rappers to see your statistics here!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserVotingDashboard;
