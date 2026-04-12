import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Globe } from "lucide-react";
import { useVoterActivityMap } from "@/hooks/useVoterActivityMap";
import VoterActivityMap from "./VoterActivityMap";

const VoterActivityMapCard = () => {
  const { data: locations, isLoading } = useVoterActivityMap();

  if (isLoading) {
    return (
      <Card className="bg-black border-4 border-rap-gold/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
            <Globe className="w-5 h-5" />
            User Activity Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[450px] rounded-lg bg-rap-smoke/5 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const topLocations = locations?.slice(0, 10) || [];

  return (
    <Card className="bg-black border-4 border-rap-gold/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
          <Globe className="w-5 h-5" />
          User Activity Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <VoterActivityMap locations={locations || []} />

        {topLocations.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-rap-gold font-mogra text-sm mb-2">Top Locations</h4>
            {topLocations.map((loc, index) => (
              <div key={loc.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-rap-gold font-mogra text-base w-6">
                    #{index + 1}
                  </span>
                  <span className="text-rap-platinum font-kaushan text-base">
                    {loc.label}
                  </span>
                </div>
                <span className="text-rap-smoke font-mogra text-base">
                  {loc.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoterActivityMapCard;
