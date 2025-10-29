import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Users, Calendar, Baby, Briefcase, Smartphone, Music2 } from "lucide-react";
import { useRapperAgeStats } from "@/hooks/useRapperAgeStats";

const getGenerationIcon = (generation: string) => {
  switch (generation) {
    case 'Boomers': return Baby;
    case 'Gen X': return Briefcase;
    case 'Millennials': return Smartphone;
    case 'Gen Z': return Music2;
    default: return Users;
  }
};

const RapperAgeCard = () => {
  const { data: ageStats, isLoading } = useRapperAgeStats();

  if (isLoading) {
    return (
      <Card className="bg-black border-rap-gold/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
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
        <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
          <Calendar className="w-5 h-5" />
          Been Here For Years
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-rap-platinum font-mogra">
              {ageStats?.averageAge ? `${ageStats.averageAge.toFixed(1)}` : "N/A"}
            </div>
            <div className="text-rap-smoke font-kaushan text-xs md:text-sm">
              Average Age
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-rap-smoke">
            <Users className="w-4 h-4" />
            <span className="text-sm font-kaushan">
              {ageStats?.totalWithBirthYear || 0} rappers with birth data
            </span>
          </div>

          {/* Generational Breakdown */}
          {ageStats?.generationBreakdown && ageStats.generationBreakdown.length > 0 && (
            <>
              <div className="border-t border-rap-gold/20 pt-3"></div>
              <div className={`grid gap-2 ${
                ageStats.generationBreakdown.length === 4 ? 'grid-cols-4' : 
                ageStats.generationBreakdown.length === 3 ? 'grid-cols-3' : 
                'grid-cols-2'
              }`}>
                {ageStats.generationBreakdown.map((gen) => {
                  const Icon = getGenerationIcon(gen.generation);
                  return (
                    <div key={gen.generation} className="text-center">
                      <div className="flex items-center justify-center gap-1 text-rap-gold/70 mb-1">
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="text-lg font-bold text-rap-platinum font-mogra">{gen.count}</div>
                      <div className="text-xs text-rap-smoke font-kaushan">{gen.generation}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RapperAgeCard;