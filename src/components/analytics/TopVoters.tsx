
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Star } from "lucide-react";

const TopVoters = () => {
  const { data: topVoters, isLoading } = useQuery({
    queryKey: ["top-voters"],
    queryFn: async () => {
      // First get the user voting stats
      const { data: votingStats, error: statsError } = await supabase
        .from("user_voting_stats")
        .select("*")
        .order("total_votes", { ascending: false })
        .limit(10);
      
      if (statsError) throw statsError;
      
      // Then get profile information for these users
      if (votingStats && votingStats.length > 0) {
        const userIds = votingStats.map(stat => stat.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, full_name")
          .in("id", userIds);
        
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
    return (
      <Card className="bg-black/40 border-purple-500/20 animate-pulse">
        <CardContent className="p-6">
          <div className="h-64 bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Top Voters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topVoters?.map((voter: any, index: number) => (
            <div key={voter.user_id} className="flex items-center justify-between p-3 bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                  index === 2 ? 'bg-gradient-to-r from-orange-600 to-yellow-600' :
                  'bg-gradient-to-r from-purple-500 to-blue-500'
                }`}>
                  #{index + 1}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {voter.profile?.full_name || voter.profile?.username || 'Anonymous User'}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{voter.unique_rappers_voted} rappers</span>
                    <span>•</span>
                    <span>{voter.categories_used} categories</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-white font-bold">{voter.total_votes}</p>
                  <p className="text-gray-400 text-xs">Votes</p>
                </div>
                <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
                  {Number(voter.average_rating_given || 0).toFixed(1)} avg
                </Badge>
              </div>
            </div>
          ))}
          
          {(!topVoters || topVoters.length === 0) && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">No voting data available yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopVoters;
