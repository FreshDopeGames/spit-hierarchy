import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Clock, TrendingUp, Music, Skull, Pause } from "lucide-react";
import { useCareerLengthStats } from "@/hooks/useCareerLengthStats";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CareerLengthCard = () => {
  const { data: careerStats, isLoading } = useCareerLengthStats();

  if (isLoading) {
    return (
      <Card className="bg-black border-4 border-rap-gold/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
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
    <Card className="bg-black border-4 border-rap-gold/30">
      <CardHeader className="pb-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra cursor-help">
                <Clock className="w-5 h-5" />
                ...And It Don't Stop
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Career length calculated from first official album release to last release (or present day for active artists, or death year for deceased artists).
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
            <div className="text-xs text-rap-smoke/70 mt-1">
              (Based on album releases)
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-rap-smoke">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-kaushan">
              {careerStats?.totalWithCareerData || 0} rappers with discographies
            </span>
          </div>

          {/* Career Status Breakdown */}
          {careerStats && (careerStats.activeArtistsCount > 0 || careerStats.deceasedArtistsCount > 0) && (
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-rap-gold/20">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-rap-gold/70 mb-1">
                  <Music className="w-5 h-5" />
                </div>
                <div className="text-lg font-bold text-rap-platinum font-mogra">{careerStats.activeArtistsCount}</div>
                <div className="text-xs text-rap-smoke font-kaushan">Active</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-rap-gold/70 mb-1">
                  <Pause className="w-5 h-5" />
                </div>
                <div className="text-lg font-bold text-rap-platinum font-mogra">{careerStats.completedCareersCount}</div>
                <div className="text-xs text-rap-smoke font-kaushan">Inactive</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-rap-gold/70 mb-1">
                  <Skull className="w-5 h-5" />
                </div>
                <div className="text-lg font-bold text-rap-platinum font-mogra">{careerStats.deceasedArtistsCount}</div>
                <div className="text-xs text-rap-smoke font-kaushan">Deceased</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerLengthCard;