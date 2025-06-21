
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="bg-carbon-fiber/90 border-rap-gold/30 shadow-lg shadow-rap-gold/20 animate-pulse border-2 border-rap-gold">
        <CardContent className="p-6">
          <div className="h-32 bg-rap-carbon-light rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!topRappers || topRappers.length === 0) return null;

  return (
    <Card className="bg-carbon-fiber/90 border-rap-gold/30 shadow-lg shadow-rap-gold/20 border-2 border-rap-gold">
      <CardHeader>
        <CardTitle className="text-rap-gold font-merienda flex items-center gap-2 font-extrabold text-3xl">
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
  );
};

export default TopVotedRappersCard;
