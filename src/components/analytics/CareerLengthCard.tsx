import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp } from "lucide-react";
import { useCareerLengthStats } from "@/hooks/useCareerLengthStats";

const CareerLengthCard = () => {
  const { data: careerStats, isLoading } = useCareerLengthStats();

  if (isLoading) {
    return (
      <Card className="bg-black border-rap-gold/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-rap-gold flex items-center gap-2 font-mogra">
            <Clock className="w-5 h-5" />
            ...And It Don't Stop
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-rap-smoke/20 rounded"></div>
            <div className="h-4 bg-rap-smoke/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-rap-gold/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-rap-gold flex items-center gap-2 font-mogra">
          <Clock className="w-5 h-5" />
          ...And It Don't Stop
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-rap-platinum font-mogra">
              {careerStats?.averageCareerLength ? `${careerStats.averageCareerLength.toFixed(1)} years` : "N/A"}
            </div>
            <div className="text-rap-smoke font-kaushan text-sm">
              Average Career Length
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-rap-smoke">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-kaushan">
              Data from {careerStats?.totalWithCareerData || 0} rappers
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerLengthCard;