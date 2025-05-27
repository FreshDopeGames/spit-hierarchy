
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface RapperAttributeStatsProps {
  rapper: Rapper;
}

const RapperAttributeStats = ({ rapper }: RapperAttributeStatsProps) => {
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
          totalVotes: votes?.length || 0
        };
      });

      return Promise.all(ratingsPromises);
    }
  });

  if (isLoading) {
    return (
      <Card className="bg-black/40 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Attribute Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white">Attribute Ratings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoryRatings?.map((category) => {
          const percentage = (category.averageRating / 10) * 100;
          const scaledRating = Math.round((category.averageRating / 10) * 100);
          
          return (
            <div key={category.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300">
                  {category.name}
                </span>
                <div className="text-right">
                  <span className="text-white font-bold text-lg">
                    {scaledRating}/100
                  </span>
                  <span className="text-gray-400 text-sm ml-2">
                    ({category.totalVotes} votes)
                  </span>
                </div>
              </div>
              <Progress 
                value={percentage} 
                className="h-3 bg-gray-800"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RapperAttributeStats;
