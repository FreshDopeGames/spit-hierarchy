import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Trophy, TrendingUp } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useRapperPercentile } from "@/hooks/useRapperPercentile";
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  type ChartConfig 
} from "@/components/ui/chart";

type Rapper = Tables<"rappers">;

interface RapperAttributeStatsProps {
  rapper: Rapper;
  onVoteClick?: () => void;
}

const RapperAttributeStats = ({ rapper, onVoteClick }: RapperAttributeStatsProps) => {
  const { data: percentile, isLoading: percentileLoading } = useRapperPercentile(rapper.id);

  const { data: categoryRatings, isLoading } = useQuery({
    queryKey: ["rapper-category-ratings", rapper.id],
    queryFn: async () => {
      const { data: categories } = await supabase
        .from("voting_categories")
        .select("*")
        .eq("active", true)
        .order("name");
      if (!categories) return [];

      const ratingsPromises = categories.map(async (category) => {
        const { data: votes } = await supabase
          .from("votes")
          .select("rating")
          .eq("rapper_id", rapper.id)
          .eq("category_id", category.id);
        const avgRating = votes && votes.length > 0
          ? votes.reduce((sum, vote) => sum + vote.rating, 0) / votes.length
          : 0;
        return {
          ...category,
          averageRating: avgRating,
          totalVotes: votes?.length || 0,
        } as any;
      });
      return Promise.all(ratingsPromises);
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const formatPercentileText = (value: number | null) => {
    if (value === null) return "";
    let suffix = "th";
    if (value % 10 === 1 && value % 100 !== 11) suffix = "st";
    else if (value % 10 === 2 && value % 100 !== 12) suffix = "nd";
    else if (value % 10 === 3 && value % 100 !== 13) suffix = "rd";
    return `${value}${suffix} percentile`;
  };

  if (isLoading) {
    return (
      <Card className="bg-black border-4 border-[hsl(var(--theme-primary))]">
        <CardHeader>
          <CardTitle className="text-[var(--theme-text)] font-[var(--theme-fontPrimary)]">Skill Ratings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Rating Skeleton */}
          <div className="bg-gradient-to-r from-[var(--theme-secondary)]/30 to-[var(--theme-accent)]/30 via-[var(--theme-primary)]/30 border border-[var(--theme-primary)]/30 rounded-lg p-6">
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full bg-gray-800 animate-pulse" />
            </div>
          </div>
          
          {/* Button Skeleton */}
          <div className="flex justify-center">
            <div className="w-40 h-12 bg-gray-800 rounded-md animate-pulse" />
          </div>
          
          {/* Radar Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[280px] bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-[280px] bg-gray-800 rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter out Overall category completely - it should only be calculated, not stored
  const attributeCategories = (categoryRatings || []).filter((cat: any) => cat.name !== "Overall");

  // Calculate the overall rating as average of all skills with votes
  const attributesWithVotes = attributeCategories.filter((cat: any) => cat.totalVotes > 0);
  const calculatedOverall = attributesWithVotes.length > 0
    ? attributesWithVotes.reduce((sum: number, cat: any) => sum + cat.averageRating, 0) / attributesWithVotes.length
    : 0;

  const overallPercentage = (calculatedOverall / 10) * 100;
  const overallScaled = Math.round((calculatedOverall / 10) * 100);

  // Categorize skills into Technique and Artistry
  const techniqueSkills = ['Beat Selection', 'Flow On Beats', 'Lyrical Ability', 'Technical Skill', 'Performance'];
  const artistrySkills = ['Freestyling', 'Metaphor', 'Storytelling', 'Consistency', 'Cultural Impact'];

  const technique = attributeCategories
    .filter((cat: any) => techniqueSkills.includes(cat.name))
    .map((cat: any) => ({
      skill: cat.name,
      rating: Math.round((cat.averageRating / 10) * 100),
      votes: cat.totalVotes
    }));

  const artistry = attributeCategories
    .filter((cat: any) => artistrySkills.includes(cat.name))
    .map((cat: any) => ({
      skill: cat.name,
      rating: Math.round((cat.averageRating / 10) * 100),
      votes: cat.totalVotes
    }));

  const radarChartConfig = {
    rating: {
      label: "Rating",
    },
  } satisfies ChartConfig;

  return (
    <Card className="bg-black border-4 border-[hsl(var(--theme-primary))]">
      <CardHeader>
        <CardTitle className="text-[var(--theme-text)] font-[var(--theme-fontPrimary)]">Skill Ratings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating with Circular Progress */}
        <div className="bg-gradient-to-r from-[var(--theme-secondary)]/30 to-[var(--theme-accent)]/30 via-[var(--theme-primary)]/30 border border-[var(--theme-primary)]/30 rounded-lg p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-[var(--theme-primary)]" />
            <span className="text-lg font-bold text-[var(--theme-text)] font-[var(--theme-fontPrimary)]">
              Overall Rating
            </span>
          </div>
          
          {/* Circular Progress Indicator */}
          <div className="flex justify-center mb-4">
            <CircularProgress 
              value={overallPercentage} 
              size={typeof window !== 'undefined' && window.innerWidth >= 1024 ? 140 : window.innerWidth >= 768 ? 120 : 100}
              strokeWidth={12}
            />
          </div>
          
          {/* Percentile Badge */}
          {percentile !== null && !percentileLoading && overallScaled > 0 && (
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-[var(--theme-primary)]" />
              <span className="text-[var(--theme-primary)] text-sm font-[var(--theme-fontSecondary)]">
                {formatPercentileText(percentile)}
              </span>
            </div>
          )}
        </div>

        {/* Centered Rate Rapper Button */}
        {onVoteClick && (
          <div className="flex justify-center">
            <button
              onClick={onVoteClick}
              className="px-6 py-3 rounded-md bg-gradient-to-r from-[hsl(var(--theme-primary))] via-[hsl(var(--theme-primaryLight))] to-[hsl(var(--theme-primary))] hover:opacity-90 text-black font-semibold transition-all duration-200 hover:scale-105 font-[var(--theme-fontSecondary)]"
            >
              Rate Rapper
            </button>
          </div>
        )}

        {/* Technique & Artistry Radar Charts */}
        {attributeCategories.length > 0 ? (
          <div className="space-y-6">
            {/* Responsive Grid: Side-by-side on Desktop, Stacked on Mobile/Tablet */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Technique Radar */}
              <div className="space-y-2 animate-fade-in">
                <h4 className="text-sm font-bold text-[var(--theme-primary)] text-center uppercase font-[var(--theme-fontSecondary)]">
                  Technique
                </h4>
                <ChartContainer config={radarChartConfig} className="h-[250px] md:h-[280px] lg:h-[320px] w-full mx-auto">
                  <RadarChart data={technique} margin={{ top: 40, right: 35, bottom: 25, left: 35 }}>
                    <PolarGrid 
                      stroke="hsl(var(--theme-primary))" 
                      strokeOpacity={0.5}
                      strokeWidth={1}
                    />
                    <PolarAngleAxis 
                      dataKey="skill"
                      tick={({ payload, x, y, textAnchor }) => {
                        const words = payload.value.split(' ');
                        const lines: string[] = [];
                        
                        if (words.length > 1) {
                          lines.push(words[0]);
                          lines.push(words.slice(1).join(' '));
                        } else {
                          lines.push(payload.value);
                        }
                        
                        return (
                          <g transform={`translate(${x},${y})`}>
                            {lines.map((line: string, i: number) => (
                              <text
                                key={i}
                                x={0}
                                y={i * 6}
                                dy={i === 0 ? -20 : -4}
                                textAnchor={textAnchor}
                                fill="hsl(var(--theme-text))"
                                fontSize={15}
                                fontFamily="var(--theme-fontSecondary)"
                                fontWeight={700}
                              >
                                {line}
                              </text>
                            ))}
                          </g>
                        );
                      }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      tick={{ 
                        fill: 'hsl(var(--theme-text))', 
                        fontSize: 10,
                        opacity: 0.7
                      }}
                      stroke="hsl(var(--theme-primary))"
                      strokeOpacity={0.4}
                    />
                    <Radar
                      name="Rating"
                      dataKey="rating"
                      stroke="hsl(var(--theme-primary))"
                      fill="hsl(var(--theme-primary))"
                      fillOpacity={0.5}
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--theme-primary))', strokeWidth: 2, r: 4 }}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[hsl(var(--theme-surface))] border border-[hsl(var(--theme-primary))]/30 rounded-lg p-3 shadow-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold text-[var(--theme-text)] font-[var(--theme-fontSecondary)]">{data.skill}</span>
                              <span className="text-lg font-bold text-[var(--theme-primary)] font-[var(--theme-fontPrimary)]">{data.rating}/100</span>
                              <span className="text-xs text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)]">
                                {data.votes} votes
                              </span>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </RadarChart>
                </ChartContainer>
              </div>
              
              {/* Artistry Radar */}
              <div className="space-y-2 animate-fade-in">
                <h4 className="text-sm font-bold text-[var(--theme-accent)] text-center uppercase font-[var(--theme-fontSecondary)]">
                  Artistry
                </h4>
                <ChartContainer config={radarChartConfig} className="h-[250px] md:h-[280px] lg:h-[320px] w-full mx-auto">
                  <RadarChart data={artistry} margin={{ top: 40, right: 35, bottom: 25, left: 35 }}>
                    <PolarGrid 
                      stroke="hsl(var(--theme-accent))" 
                      strokeOpacity={0.5}
                      strokeWidth={1}
                    />
                    <PolarAngleAxis 
                      dataKey="skill"
                      tick={({ payload, x, y, textAnchor }) => {
                        const words = payload.value.split(' ');
                        const lines: string[] = [];
                        
                        if (words.length > 1) {
                          lines.push(words[0]);
                          lines.push(words.slice(1).join(' '));
                        } else {
                          lines.push(payload.value);
                        }
                        
                        return (
                          <g transform={`translate(${x},${y})`}>
                            {lines.map((line: string, i: number) => (
                              <text
                                key={i}
                                x={0}
                                y={i * 6}
                                dy={i === 0 ? -20 : -4}
                                textAnchor={textAnchor}
                                fill="hsl(var(--theme-text))"
                                fontSize={15}
                                fontFamily="var(--theme-fontSecondary)"
                                fontWeight={700}
                              >
                                {line}
                              </text>
                            ))}
                          </g>
                        );
                      }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      tick={{ 
                        fill: 'hsl(var(--theme-text))', 
                        fontSize: 10,
                        opacity: 0.7
                      }}
                      stroke="hsl(var(--theme-accent))"
                      strokeOpacity={0.4}
                    />
                    <Radar
                      name="Rating"
                      dataKey="rating"
                      stroke="hsl(var(--theme-accent))"
                      fill="hsl(var(--theme-accent))"
                      fillOpacity={0.5}
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--theme-accent))', strokeWidth: 2, r: 4 }}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[hsl(var(--theme-surface))] border border-[hsl(var(--theme-accent))]/30 rounded-lg p-3 shadow-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold text-[var(--theme-text)] font-[var(--theme-fontSecondary)]">{data.skill}</span>
                              <span className="text-lg font-bold text-[var(--theme-accent)] font-[var(--theme-fontPrimary)]">{data.rating}/100</span>
                              <span className="text-xs text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)]">
                                {data.votes} votes
                              </span>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </RadarChart>
                </ChartContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)]">
              No skill ratings yet. Be the first to rate this rapper!
            </div>
            {onVoteClick && (
              <button
                onClick={onVoteClick}
                className="px-6 py-3 rounded-md bg-gradient-to-r from-[hsl(var(--theme-primary))] via-[hsl(var(--theme-primaryLight))] to-[hsl(var(--theme-primary))] hover:opacity-90 text-black font-semibold transition-all duration-200 hover:scale-105 font-[var(--theme-fontSecondary)]"
              >
                Rate This Rapper
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RapperAttributeStats;
