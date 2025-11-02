import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCategoryIcon } from "@/utils/categoryIconMap";
const CategoryPerformanceCard = () => {
  const isMobile = useIsMobile();
  const {
    data: categoryAnalytics,
    isLoading
  } = useQuery({
    queryKey: ["category-analytics"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.rpc("get_category_voting_analytics");
      if (error) throw error;
      // Filter out the 'Overall' category
      return data?.filter(category => category.name !== 'Overall') || [];
    }
  });
  if (isLoading) {
    return <Card className="bg-[var(--theme-surface)] border-[var(--theme-primary)] border-2 shadow-lg shadow-[var(--theme-primary)]/20 animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-[var(--theme-background)] rounded"></div>
        </CardContent>
      </Card>;
  }
  if (!categoryAnalytics || categoryAnalytics.length === 0) return null;
  return <Card className="bg-[var(--theme-surface)] border-[hsl(var(--theme-primary))] border-2 shadow-lg shadow-[var(--theme-primary)]/20 bg-black">
      <CardHeader>
        <CardTitle className="text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] flex items-center gap-2 text-3xl font-extrabold">
          <TrendingUp className="w-5 h-5" />
          Category Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categoryAnalytics.map((category: any) => {
            const IconComponent = getCategoryIcon(category.name);
            
            return (
              <div key={category.id} className={`p-3 bg-[var(--theme-background)] border border-[var(--theme-primary)]/20 rounded-lg ${isMobile ? 'flex flex-col space-y-3' : 'flex items-center justify-between'}`}>
                <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                  <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
                    {IconComponent && <IconComponent className="w-6 h-6 text-[var(--theme-primary)]" />}
                    <h4 className={`text-[var(--theme-text)] font-medium font-[var(--theme-font-body)] text-3xl`}>
                      {category.name}
                    </h4>
                  </div>
                  <p className={`text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-base ${isMobile ? 'text-center' : 'text-left'}`}>
                    {category.description}
                  </p>
                </div>
              <div className={`flex items-center gap-4 ${isMobile ? 'justify-center' : ''}`}>
                <div className="text-center">
                  <p className="text-[var(--theme-text)] font-bold font-[var(--theme-font-heading)] text-2xl">{category.total_votes}</p>
                  <p className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-base">Votes</p>
                </div>
                <div className="text-center">
                  <p className="text-[var(--theme-text)] font-bold font-[var(--theme-font-heading)] text-2xl">{category.unique_voters}</p>
                  <p className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-base">Voters</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border-[var(--theme-primary)]/30 text-lg">
                    {Number(category.average_rating || 0).toFixed(1)}
                  </Badge>
                  <p className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-base">Avg.</p>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </CardContent>
    </Card>;
};
export default CategoryPerformanceCard;