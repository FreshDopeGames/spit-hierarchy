
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
      <Card className="bg-carbon-fiber/90 border-rap-gold/30 animate-pulse shadow-lg shadow-rap-gold/20">
        <CardContent className="p-6">
          <div className="h-64 bg-rap-carbon-light rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-carbon-fiber/90 border-rap-gold/30 shadow-lg shadow-rap-gold/20">
      <CardHeader>
        <CardTitle className="text-rap-gold font-mogra flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Top Voters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topVoters?.map((voter: any, index: number) => (
            <div key={voter.user_id} className="flex items-center justify-between p-3 bg-rap-carbon/30 border border-rap-gold/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-rap-carbon font-bold text-sm font-mogra ${
                  index === 0 ? 'bg-gradient-to-r from-rap-gold to-rap-silver' :
                  index === 1 ? 'bg-gradient-to-r from-rap-silver to-rap-platinum' :
                  index === 2 ? 'bg-gradient-to-r from-rap-burgundy to-rap-gold' :
                  'bg-gradient-to-r from-rap-burgundy to-rap-forest'
                }`}>
                  #{index + 1}
                </div>
                <div>
                  <p className="text-rap-platinum font-medium font-kaushan">
                    {voter.profile?.full_name || voter.profile?.username || 'Anonymous User'}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-rap-smoke">
                    <span className="font-kaushan">{voter.unique_rappers_voted} rappers</span>
                    <span>•</span>
                    <span className="font-kaushan">{voter.categories_used} categories</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-rap-platinum font-bold font-mogra">{voter.total_votes}</p>
                  <p className="text-rap-smoke text-xs font-kaushan">Votes</p>
                </div>
                <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30">
                  {Number(voter.average_rating_given || 0).toFixed(1)} avg
                </Badge>
              </div>
            </div>
          ))}
          
          {(!topVoters || topVoters.length === 0) && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-rap-smoke mx-auto mb-2" />
              <p className="text-rap-smoke font-kaushan">No voting data available yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopVoters;
