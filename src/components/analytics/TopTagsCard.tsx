import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTopTagsStats } from "@/hooks/useTopTagsStats";

const TopTagsCard = () => {
  const { data: topTags, isLoading } = useTopTagsStats();

  if (isLoading) {
    return (
      <Card className="bg-black border-rap-gold/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
            <Hash className="w-5 h-5" />
            Top Rapper Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-rap-smoke/20 rounded w-20"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-rap-gold/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
          <Hash className="w-5 h-5" />
          Top 5 Rapper Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topTags && topTags.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {topTags.slice(0, 5).map((tag, index) => (
                <div key={tag.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-rap-gold font-mogra text-sm w-6">
                      #{index + 1}
                    </span>
                    <Badge variant="outline" className="border-rap-gold/30 text-rap-platinum">
                      {tag.name}
                    </Badge>
                  </div>
                  <span className="text-rap-smoke font-mogra">
                    {tag.count} rappers
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-rap-smoke font-kaushan">
              No tag data available yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopTagsCard;