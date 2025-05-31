
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
          <Card key={i} className="bg-carbon-fiber/90 border-rap-gold/30 animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-rap-carbon-light rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-mogra text-rap-gold mb-4 animate-text-glow">Platform Analytics</h3>

      {/* Global Stats */}
      {globalStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-carbon-fiber/90 border-rap-gold/30 shadow-lg shadow-rap-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-rap-burgundy to-rap-forest flex items-center justify-center shadow-lg">
                  <Vote className="w-5 h-5 text-rap-silver" />
                </div>
                <div>
                  <p className="text-rap-smoke text-sm font-kaushan tracking-wide">Total Votes</p>
                  <p className="text-rap-platinum font-bold text-lg font-mogra">{globalStats.totalVotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-carbon-fiber/90 border-rap-gold/30 shadow-lg shadow-rap-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-rap-forest to-rap-gold flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-rap-carbon" />
                </div>
                <div>
                  <p className="text-rap-smoke text-sm font-kaushan tracking-wide">Active Voters</p>
                  <p className="text-rap-platinum font-bold text-lg font-mogra">{globalStats.activeVoters}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-carbon-fiber/90 border-rap-gold/30 shadow-lg shadow-rap-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-rap-gold to-rap-silver flex items-center justify-center shadow-lg">
                  <Award className="w-5 h-5 text-rap-carbon" />
                </div>
                <div>
                  <p className="text-rap-smoke text-sm font-kaushan tracking-wide">Rated Rappers</p>
                  <p className="text-rap-platinum font-bold text-lg font-mogra">{globalStats.ratedRappers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-carbon-fiber/90 border-rap-gold/30 shadow-lg shadow-rap-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-rap-silver to-rap-platinum flex items-center justify-center shadow-lg">
                  <Star className="w-5 h-5 text-rap-carbon" />
                </div>
                <div>
                  <p className="text-rap-smoke text-sm font-kaushan tracking-wide">Avg Rating</p>
                  <p className="text-rap-platinum font-bold text-lg font-mogra">{globalStats.avgRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Analytics */}
      {categoryAnalytics && categoryAnalytics.length > 0 && (
        <Card className="bg-carbon-fiber/90 border-rap-gold/30 shadow-lg shadow-rap-gold/20">
          <CardHeader>
            <CardTitle className="text-rap-gold font-mogra flex items-center gap-2 animate-text-glow">
              <TrendingUp className="w-5 h-5" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryAnalytics.map((category: any) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-rap-carbon/30 border border-rap-gold/20 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-rap-platinum font-medium font-kaushan">{category.name}</h4>
                    <p className="text-rap-smoke text-sm font-kaushan">{category.description}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-rap-platinum font-bold font-mogra">{category.total_votes}</p>
                      <p className="text-rap-smoke font-kaushan">Votes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-rap-platinum font-bold font-mogra">{category.unique_voters}</p>
                      <p className="text-rap-smoke font-kaushan">Voters</p>
                    </div>
                    <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30">
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
        <Card className="bg-carbon-fiber/90 border-rap-gold/30 shadow-lg shadow-rap-gold/20">
          <CardHeader>
            <CardTitle className="text-rap-gold font-mogra flex items-center gap-2 animate-text-glow">
              <Users className="w-5 h-5" />
              Most Voted Rappers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRappers.map((rapper: any, index: number) => (
                <div key={rapper.id} className="flex items-center justify-between p-3 bg-rap-carbon/30 border border-rap-gold/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-rap-gold to-rap-silver rounded-full flex items-center justify-center text-rap-carbon font-bold text-sm font-mogra">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="text-rap-platinum font-medium font-kaushan">{rapper.name}</h4>
                      <p className="text-rap-smoke text-sm font-kaushan">{rapper.unique_voters} unique voters</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-rap-platinum font-bold font-mogra">{rapper.total_votes}</p>
                      <p className="text-rap-smoke font-kaushan">Total Votes</p>
                    </div>
                    <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30">
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
        <Card className="bg-carbon-fiber/90 border-rap-gold/30 shadow-lg shadow-rap-gold/20">
          <CardHeader>
            <CardTitle className="text-rap-gold font-mogra flex items-center gap-2 animate-text-glow">
              <Activity className="w-5 h-5" />
              Recent Voting Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity.slice(0, 5).map((vote: any) => (
                <div key={vote.id} className="flex items-center justify-between p-2 text-sm">
                  <div className="flex-1">
                    <span className="text-rap-platinum font-kaushan">{vote.rappers?.name}</span>
                    <span className="text-rap-smoke mx-2 font-kaushan">in</span>
                    <span className="text-rap-gold font-kaushan">{vote.voting_categories?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30">
                      {vote.rating}/10
                    </Badge>
                    <span className="text-rap-smoke text-xs font-kaushan">
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
