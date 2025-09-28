import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useRapperPercentile } from "@/hooks/useRapperPercentile";

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
      <CardContent>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-800 rounded" />
          ))}
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

  return (
    <Card className="bg-black border-4 border-[hsl(var(--theme-primary))]">
      <CardHeader>
        <CardTitle className="text-[var(--theme-text)] font-[var(--theme-fontPrimary)]">Skill Ratings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating - Always calculated from skills */}
        <div className="bg-gradient-to-r from-[var(--theme-secondary)]/30 to-[var(--theme-accent)]/30 via-[var(--theme-primary)]/30 border border-[var(--theme-primary)]/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-[var(--theme-primary)]" />
            <span className="text-lg font-bold text-[var(--theme-text)] font-[var(--theme-fontPrimary)]">Overall Rating</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)]">Calculated from all skills</span>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--theme-text)] font-bold text-2xl font-[var(--theme-fontPrimary)]">{overallScaled}/100</span>
                  {percentile !== null && !percentileLoading && overallScaled > 0 && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-[var(--theme-primary)]" />
                      <span className="text-[var(--theme-primary)] text-sm font-[var(--theme-fontSecondary)]">({formatPercentileText(percentile)})</span>
                    </div>
                  )}
                </div>
                <span className="text-[var(--theme-textMuted)] text-sm font-[var(--theme-fontSecondary)]">(Average of {attributesWithVotes.length} skills)</span>
              </div>
            </div>
            <Progress value={overallPercentage} className="h-4 bg-[var(--theme-backgroundLight)]" />
          </div>
        </div>

        {/* Individual Skills */}
        <div className="space-y-4">
          {onVoteClick && (
            <div className="flex justify-end">
              <button
                onClick={onVoteClick}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-[hsl(var(--theme-primary))] via-[hsl(var(--theme-primaryLight))] to-[hsl(var(--theme-primary))] hover:opacity-90 text-black font-semibold transition-opacity duration-200 font-[var(--theme-fontSecondary)]"
              >
                Rate Rapper
              </button>
            </div>
          )}
          <h3 className="text-sm font-semibold text-[var(--theme-textMuted)] uppercase tracking-wider font-[var(--theme-fontSecondary)]">Individual Skills</h3>
          {attributeCategories.map((category: any) => {
            const percentage = (category.averageRating / 10) * 100;
            const scaledRating = Math.round((category.averageRating / 10) * 100);
            return (
              <div key={category.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[var(--theme-text)] font-[var(--theme-fontSecondary)]">{category.name}</span>
                  <div className="text-right">
                    <span className="text-[var(--theme-text)] font-bold text-lg font-[var(--theme-fontSecondary)]">{scaledRating}/100</span>
                    <span className="text-[var(--theme-textMuted)] text-sm ml-2 font-[var(--theme-fontSecondary)]">({category.totalVotes} votes)</span>
                  </div>
                </div>
                <Progress value={percentage} className="h-3 bg-[var(--theme-backgroundLight)]" />
              </div>
            );
          })}
        </div>

        {attributeCategories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)]">No skill ratings yet. Be the first to rate this rapper!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RapperAttributeStats;
