
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Vote, Award, Star, Activity } from "lucide-react";

const VotingAnalytics = () => {
  const { data: categoryAnalytics, isLoading: loadingCategories } = useQuery({
    queryKey: ["category-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("category_voting_analytics")
        .select("*")
        .order("total_votes", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: topRappers, isLoading: loadingRappers } = useQuery({
    queryKey: ["top-voted-rappers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rapper_voting_analytics")
        .select("*")
        .order("total_votes", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: recentActivity, isLoading: loadingActivity } = useQuery({
    queryKey: ["recent-voting-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("votes")
        .select(`
          *,
          rappers(name),
          voting_categories(name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: globalStats } = useQuery({
    queryKey: ["global-voting-stats"],
    queryFn: async () => {
      const [votesResult, usersResult, rappersResult] = await Promise.all([
        supabase.from("votes").select("*", { count: "exact", head: true }),
        supabase.from("user_voting_stats").select("*"),
        supabase.from("rapper_voting_analytics").select("*").gt("total_votes", 0)
      ]);

      return {
        totalVotes: votesResult.count || 0,
        activeVoters: usersResult.data?.length || 0,
        ratedRappers: rappersResult.data?.length || 0,
        avgRating: rappersResult.data?.reduce((sum, r) => sum + (r.average_rating || 0), 0) / (rappersResult.data?.length || 1) || 0
      };
    }
  });

  if (loadingCategories || loadingRappers || loadingActivity) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-black/40 border-purple-500/20 animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-4">Platform Analytics</h3>

      {/* Global Stats */}
      {globalStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-black/40 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Vote className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Votes</p>
                  <p className="text-white font-bold text-lg">{globalStats.totalVotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Active Voters</p>
                  <p className="text-white font-bold text-lg">{globalStats.activeVoters}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Rated Rappers</p>
                  <p className="text-white font-bold text-lg">{globalStats.ratedRappers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-yellow-500 flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Avg Rating</p>
                  <p className="text-white font-bold text-lg">{globalStats.avgRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Analytics */}
      {categoryAnalytics && categoryAnalytics.length > 0 && (
        <Card className="bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryAnalytics.map((category: any) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-purple-900/20 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{category.name}</h4>
                    <p className="text-gray-400 text-sm">{category.description}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-white font-bold">{category.total_votes}</p>
                      <p className="text-gray-400">Votes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold">{category.unique_voters}</p>
                      <p className="text-gray-400">Voters</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
                      {Number(category.average_rating || 0).toFixed(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Voted Rappers */}
      {topRappers && topRappers.length > 0 && (
        <Card className="bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Most Voted Rappers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRappers.map((rapper: any, index: number) => (
                <div key={rapper.id} className="flex items-center justify-between p-3 bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{rapper.name}</h4>
                      <p className="text-gray-400 text-sm">{rapper.unique_voters} unique voters</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-white font-bold">{rapper.total_votes}</p>
                      <p className="text-gray-400">Total Votes</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
                      {Number(rapper.average_rating || 0).toFixed(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <Card className="bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Voting Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity.slice(0, 5).map((vote: any) => (
                <div key={vote.id} className="flex items-center justify-between p-2 text-sm">
                  <div className="flex-1">
                    <span className="text-white">{vote.rappers?.name}</span>
                    <span className="text-gray-400 mx-2">in</span>
                    <span className="text-purple-300">{vote.voting_categories?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
                      {vote.rating}/10
                    </Badge>
                    <span className="text-gray-400 text-xs">
                      {new Date(vote.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VotingAnalytics;
