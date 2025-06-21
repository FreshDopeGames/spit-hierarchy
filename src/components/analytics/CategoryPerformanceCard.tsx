import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
const CategoryPerformanceCard = () => {
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
      return data;
    }
  });
  if (isLoading) {
    return <Card className="bg-carbon-fiber/90 border-rap-gold border-2 shadow-lg shadow-rap-gold/20 animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-rap-carbon-light rounded"></div>
        </CardContent>
      </Card>;
  }
  if (!categoryAnalytics || categoryAnalytics.length === 0) return null;
  return <Card className="bg-carbon-fiber/90 border-rap-gold border-2 shadow-lg shadow-rap-gold/20">
      <CardHeader>
        <CardTitle className="text-rap-gold font-merienda flex items-center gap-2 text-3xl font-extrabold">
          <TrendingUp className="w-5 h-5" />
          Category Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categoryAnalytics.map((category: any) => <div key={category.id} className="flex items-center justify-between p-3 bg-rap-carbon/30 border border-rap-gold/20 rounded-lg">
              <div className="flex-1">
                <h4 className="text-rap-platinum font-medium font-kaushan text-3xl text-center">{category.name}</h4>
                <p className="text-rap-smoke font-kaushan text-base text-center">{category.description}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-rap-platinum font-bold font-mogra">{category.total_votes}</p>
                  <p className="text-rap-smoke font-kaushan">Votes</p>
                </div>
                <div className="text-center">
                  <p className="text-rap-platinum font-bold font-mogra">{category.unique_voters}</p>
                  <p className="text-rap-smoke font-kaushan">Voters</p>
                </div>
                <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30">
                  {Number(category.average_rating || 0).toFixed(1)}
                </Badge>
              </div>
            </div>)}
        </div>
      </CardContent>
    </Card>;
};
export default CategoryPerformanceCard;