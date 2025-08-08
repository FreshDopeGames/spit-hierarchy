
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useRapperPercentile } from "@/hooks/useRapperPercentile";

type Rapper = Tables<"rappers">;

interface RapperAttributeStatsProps {
  rapper: Rapper;
}

const RapperAttributeStats = ({ rapper }: RapperAttributeStatsProps) => {
  const { data: percentile, isLoading: percentileLoading } = useRapperPercentile(rapper.id);

  const {
    data: categoryRatings,
    isLoading
  } = useQuery({
    queryKey: ["rapper-category-ratings", rapper.id],
    queryFn: async () => {
      const {
        data: categories
      } = await supabase.from("voting_categories").select("*").eq("active", true).order("name");
      if (!categories) return [];
      
      const ratingsPromises = categories.map(async category => {
        const {
          data: votes
        } = await supabase.from("votes").select("rating").eq("rapper_id", rapper.id).eq("category_id", category.id);
        const avgRating = votes && votes.length > 0 ? votes.reduce((sum, vote) => sum + vote.rating, 0) / votes.length : 0;
        return {
          ...category,
          averageRating: avgRating,
          totalVotes: votes?.length || 0
        };
      });
      return Promise.all(ratingsPromises);
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // Cache for 30 seconds to allow for real-time updates
  });

  const formatPercentileText = (percentile: number | null) => {
    if (percentile === null) return "";
    
    let suffix = "th";
    if (percentile % 10 === 1 && percentile % 100 !== 11) suffix = "st";
    else if (percentile % 10 === 2 && percentile % 100 !== 12) suffix = "nd";
    else if (percentile % 10 === 3 && percentile % 100 !== 13) suffix = "rd";
    
    return `${percentile}${suffix} percentile`;
  };

  if (isLoading) {
    return (
      <Card className="bg-black border-rap-burgundy/40">
        <CardHeader>
          <CardTitle className="text-rap-platinum font-mogra">Skill Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 bg-rap-carbon rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter out Overall category completely - it should only be calculated, not stored
  const attributeCategories = categoryRatings?.filter(cat => cat.name !== "Overall") || [];

  // Calculate the overall rating as average of all attributes with votes
  const attributesWithVotes = attributeCategories.filter(cat => cat.totalVotes > 0);
  const calculatedOverall = attributesWithVotes.length > 0 ? attributesWithVotes.reduce((sum, cat) => sum + cat.averageRating, 0) / attributesWithVotes.length : 0;

  const overallPercentage = calculatedOverall / 10 * 100;
  const overallScaled = Math.round(calculatedOverall / 10 * 100);

  return (
    <Card className="bg-black border-rap-burgundy/40">
      <CardHeader>
        <CardTitle className="text-rap-platinum font-mogra">Skill Ratings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating - Always calculated from attributes */}
        <div className="bg-gradient-to-r from-rap-burgundy/30 to-rap-forest/30 via-rap-gold/30 border border-rap-gold/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-rap-gold" />
            <span className="text-lg font-bold text-rap-platinum font-mogra">Overall Rating</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-rap-smoke font-kaushan">
                Calculated from all skills
              </span>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-rap-platinum font-bold text-2xl font-mogra">
                    {overallScaled}/100
                  </span>
                  {percentile !== null && !percentileLoading && overallScaled > 0 && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-rap-gold" />
                      <span className="text-rap-gold text-sm font-kaushan">
                        ({formatPercentileText(percentile)})
                      </span>
                    </div>
                  )}
                </div>
              <span className="text-rap-smoke text-sm font-kaushan">
                (Average of {attributesWithVotes.length} skills)
              </span>
              </div>
            </div>
            <Progress value={overallPercentage} className="h-4 bg-rap-carbon" />
          </div>
        </div>

        {/* Individual Attributes */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-rap-smoke uppercase tracking-wider font-kaushan">
            Individual Skills
          </h3>
          {attributeCategories.map((category) => {
            const percentage = (category.averageRating / 10) * 100;
            const scaledRating = Math.round((category.averageRating / 10) * 100);

            return (
              <div key={category.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-rap-platinum font-kaushan">
                    {category.name}
                  </span>
                  <div className="text-right">
                    <span className="text-rap-platinum font-bold text-lg font-merienda">
                      {scaledRating}/100
                    </span>
                    <span className="text-rap-smoke text-sm ml-2 font-kaushan">
                      ({category.totalVotes} votes)
                    </span>
                  </div>
                </div>
                <Progress value={percentage} className="h-3 bg-rap-charcoal" />
              </div>
            );
          })}
        </div>

        {attributeCategories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-rap-smoke font-kaushan">No skill ratings yet. Be the first to rate this rapper!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RapperAttributeStats;
