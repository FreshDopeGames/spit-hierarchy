
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface RapperStatsProps {
  rapper: Rapper;
}

const RapperStats = ({ rapper }: RapperStatsProps) => {
  return (
    <Card className="bg-black/40 border-purple-500/20">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Community Stats</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {rapper.total_votes || 0}
            </div>
            <div className="text-gray-400">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {rapper.average_rating ? Number(rapper.average_rating).toFixed(1) : "—"}
            </div>
            <div className="text-gray-400">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {rapper.verified ? "✓" : "—"}
            </div>
            <div className="text-gray-400">Verified Status</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RapperStats;
