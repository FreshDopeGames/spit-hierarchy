import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Star } from "lucide-react";
import RapperAvatar from "@/components/RapperAvatar";
import { useRapperImages } from "@/hooks/useImageStyle";

const MostRatedRappersCard = () => {
  const {
    data: topRatedRappers,
    isLoading
  } = useQuery({
    queryKey: ["most-rated-rappers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("votes")
        .select(`
          rapper_id,
          rating,
          rappers (
            id,
            name,
            slug
          )
        `)
        .eq("category_id", "9d4ea6ba-b8d6-4118-911d-7211e8522d16")
        .not("rating", "is", null)
        .gt("rating", 0);

      if (error) throw error;

      // Group by rapper and calculate stats
      const rapperStats = data?.reduce((acc: any, vote: any) => {
        const rapperId = vote.rapper_id;
        if (!acc[rapperId]) {
          acc[rapperId] = {
            id: vote.rappers.id,
            name: vote.rappers.name,
            slug: vote.rappers.slug,
            ratings: [],
          };
        }
        acc[rapperId].ratings.push(vote.rating);
        return acc;
      }, {});

      // Calculate averages and sort
      const rapperArray = Object.values(rapperStats || {}).map((rapper: any) => ({
        ...rapper,
        rating_count: rapper.ratings.length,
        average_rating: (rapper.ratings.reduce((sum: number, r: number) => sum + r, 0) / rapper.ratings.length).toFixed(1),
      }));

      return rapperArray
        .sort((a: any, b: any) => b.rating_count - a.rating_count)
        .slice(0, 5);
    }
  });

  const rapperIds = topRatedRappers?.map((r: any) => r.id) || [];
  const { data: rapperImages } = useRapperImages(rapperIds, 'medium');

  if (isLoading) {
    return (
      <Card className="bg-[var(--theme-surface)] border-[var(--theme-primary)]/30 shadow-lg shadow-[var(--theme-primary)]/20 animate-pulse border-2 border-[var(--theme-primary)]">
        <CardContent className="p-6">
          <div className="h-32 bg-[var(--theme-background)] rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!topRatedRappers || topRatedRappers.length === 0) return null;

  return (
    <Card className="bg-[var(--theme-surface)] border-[hsl(var(--theme-primary))] border-2 shadow-lg shadow-[var(--theme-primary)]/20 bg-black">
      <CardHeader>
        <CardTitle className="text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] flex items-center gap-2 font-extrabold text-3xl">
          <Star className="w-5 h-5" />
          Most Rated Rappers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topRatedRappers.map((rapper: any, index: number) => (
            <div key={rapper.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-[var(--theme-background)] border border-[var(--theme-primary)]/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--theme-primary)] rounded-full flex items-center justify-center text-black font-bold text-sm font-[var(--theme-font-heading)]">
                  #{index + 1}
                </div>
                <RapperAvatar 
                  rapper={rapper}
                  size="md"
                  imageUrl={rapperImages?.[rapper.id]}
                  variant="square"
                />
                <div>
                  <h4 className="text-[var(--theme-text)] font-medium font-[var(--theme-font-body)]">{rapper.name}</h4>
                  <p className="text-[var(--theme-textMuted)] text-base font-[var(--theme-font-body)]">{rapper.rating_count} ratings</p>
                </div>
              </div>
              <div className="text-center sm:text-right w-full sm:w-auto">
                <p className="text-[var(--theme-text)] font-bold font-[var(--theme-font-heading)] text-2xl">{rapper.average_rating}</p>
                <p className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-base">Avg Rating</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MostRatedRappersCard;
