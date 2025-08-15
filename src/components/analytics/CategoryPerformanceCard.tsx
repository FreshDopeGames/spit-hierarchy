
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
    return <Card className="bg-carbon-gradient border-rap-gold border-2 shadow-lg shadow-rap-gold/20 animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-rap-carbon-light rounded"></div>
        </CardContent>
      </Card>;
  }

  if (!categoryAnalytics || categoryAnalytics.length === 0) return null;

  return <Card className="bg-carbon-gradient border-rap-gold border-2 shadow-lg shadow-rap-gold/20">
      <CardHeader>
        <CardTitle className="text-rap-gold font-merienda flex items-center gap-2 text-3xl font-extrabold">
          <TrendingUp className="w-5 h-5" />
          Category Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categoryAnalytics.map((category: any) => (
            <div 
              key={category.id} 
              className={`p-3 bg-black border border-rap-gold/20 rounded-lg ${
                isMobile 
                  ? 'flex flex-col space-y-3' 
                  : 'flex items-center justify-between'
              }`}
            >
              <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                <h4 className={`text-rap-platinum font-medium font-kaushan text-3xl ${
                  isMobile ? 'text-center' : 'text-left'
                }`}>
                  {category.name}
                </h4>
                <p className={`text-rap-smoke font-kaushan text-base ${
                  isMobile ? 'text-center' : 'text-left'
                }`}>
                  {category.description}
                </p>
              </div>
              <div className={`flex items-center gap-4 ${
                isMobile ? 'justify-center' : ''
              }`}>
                <div className="text-center">
                  <p className="text-rap-platinum font-bold font-mogra text-2xl">{category.total_votes}</p>
                  <p className="text-rap-smoke font-kaushan text-base">Votes</p>
                </div>
                <div className="text-center">
                  <p className="text-rap-platinum font-bold font-mogra text-2xl">{category.unique_voters}</p>
                  <p className="text-rap-smoke font-kaushan text-base">Voters</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30 text-lg">
                    {Number(category.average_rating || 0).toFixed(1)}
                  </Badge>
                  <p className="text-rap-smoke font-kaushan text-base">Avg.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>;
};

export default CategoryPerformanceCard;
