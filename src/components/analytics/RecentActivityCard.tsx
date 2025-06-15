
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

const RecentActivityCard = () => {
  const { data: recentActivity, isLoading } = useQuery({
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
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-carbon-fiber/90 border-2 border-rap-gold shadow-lg shadow-rap-gold/20 animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-rap-carbon-light rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!recentActivity || recentActivity.length === 0) return null;

  return (
    <Card className="bg-carbon-fiber/90 border-2 border-rap-gold shadow-lg shadow-rap-gold/20">
      <CardHeader>
        <CardTitle className="text-rap-gold font-mogra flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Voting Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentActivity.slice(0, 5).map((vote: any) => (
            <div
              key={vote.id}
              className="flex items-center justify-between p-2 text-sm"
            >
              <div className="flex-1">
                <span className="text-rap-platinum font-kaushan">
                  {vote.rappers?.name}
                </span>
                <span className="text-rap-smoke mx-2 font-kaushan">in</span>
                <span className="text-rap-gold font-kaushan">
                  {vote.voting_categories?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-rap-gold/20 text-rap-gold border-rap-gold/30"
                >
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
  );
};

export default RecentActivityCard;
