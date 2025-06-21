
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface RapperAttributeStatsProps {
  rapper: Rapper;
}

const RapperAttributeStats = ({ rapper }: RapperAttributeStatsProps) => {
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
    }
  });

  if (isLoading) {
    return (
      <Card className="bg-rap-carbon border-rap-burgundy/40">
        <CardHeader>
          <CardTitle className="text-rap-platinum font-mogra">Attribute Ratings</CardTitle>
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
    <Card className="bg-rap-carbon border-rap-burgundy/40">
      <CardHeader>
        <CardTitle className="text-rap-platinum font-mogra">Attribute Ratings</CardTitle>
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
                Calculated from all attributes
              </span>
              <div className="text-right">
                <span className="text-rap-platinum font-bold text-2xl font-mogra">
                  {overallScaled}/100
                </span>
                <span className="text-rap-smoke text-sm ml-2 font-kaushan">
                  (Average of {attributesWithVotes.length} attributes)
                </span>
              </div>
            </div>
            <Progress value={overallPercentage} className="h-4 bg-rap-carbon" />
          </div>
        </div>

        {/* Individual Attributes */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-rap-smoke uppercase tracking-wider font-kaushan">
            Individual Attributes
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
      </CardContent>
    </Card>
  );
};

export default RapperAttributeStats;
