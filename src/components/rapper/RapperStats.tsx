
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface RapperStatsProps {
  rapper: Rapper;
}

const RapperStats = ({ rapper }: RapperStatsProps) => {
  return (
    <Card className="bg-black border-rap-burgundy/40">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-rap-platinum mb-4 font-mogra">Community Stats</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-rap-gold mb-2 font-mogra">
              {rapper.total_votes || 0}
            </div>
            <div className="text-rap-smoke font-kaushan">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rap-burgundy mb-2 font-mogra">
              {rapper.average_rating ? Number(rapper.average_rating).toFixed(1) : "—"}
            </div>
            <div className="text-rap-smoke font-kaushan">Average Rating</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RapperStats;
