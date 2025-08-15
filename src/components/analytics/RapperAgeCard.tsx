import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar } from "lucide-react";
import { useRapperAgeStats } from "@/hooks/useRapperAgeStats";

const RapperAgeCard = () => {
  const { data: ageStats, isLoading } = useRapperAgeStats();

  if (isLoading) {
    return (
      <Card className="bg-black border-rap-gold/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-rap-gold flex items-center gap-2 font-mogra">
            <Calendar className="w-5 h-5" />
            Been Here For Years
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
          <Calendar className="w-5 h-5" />
          Been Here For Years
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-rap-platinum font-mogra">
              {ageStats?.averageAge ? `${ageStats.averageAge.toFixed(1)} years` : "N/A"}
            </div>
            <div className="text-rap-smoke font-kaushan text-sm">
              Average Age
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-rap-smoke">
            <Users className="w-4 h-4" />
            <span className="text-sm font-kaushan">
              Data from {ageStats?.totalWithBirthYear || 0} rappers
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RapperAgeCard;