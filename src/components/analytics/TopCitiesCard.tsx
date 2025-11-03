import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { MapPin } from "lucide-react";
import { useTopCitiesStats } from "@/hooks/useTopCitiesStats";

const TopCitiesCard = () => {
  const { data: topCities, isLoading } = useTopCitiesStats();

  if (isLoading) {
    return (
      <Card className="bg-black border-4 border-rap-gold/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
            <MapPin className="w-5 h-5" />
            Top Cities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-rap-smoke/20 rounded w-1/2"></div>
                <div className="h-4 bg-rap-smoke/20 rounded w-8"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-4 border-rap-gold/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
          <MapPin className="w-5 h-5" />
          Top 5 Cities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topCities?.slice(0, 5).map((city, index) => (
            <div key={city.location} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-rap-gold font-mogra text-sm w-6">
                  #{index + 1}
                </span>
                <span className="text-rap-platinum font-kaushan">
                  {city.location}
                </span>
              </div>
              <span className="text-rap-smoke font-mogra">
                {city.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopCitiesCard;