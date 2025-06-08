
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import RapperCard from "./RapperCard";

type Rapper = Tables<"rappers">;

interface RankingItem {
  position: number;
  reason: string;
  rapper: Rapper | null;
}

const RisingLegendsSection = () => {
  const { data: risingLegends, isLoading } = useQuery({
    queryKey: ["rising-legends-2024"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ranking_items")
        .select(`
          position,
          reason,
          rapper:rappers (*)
        `)
        .eq("ranking_id", (await supabase
          .from("official_rankings")
          .select("id")
          .eq("slug", "rising-legends-2024")
          .single()).data?.id)
        .eq("is_ranked", true) // Only get manually ranked items
        .order("position", { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data as RankingItem[];
    }
  });

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-rap-forest" />
            <h2 className="text-3xl font-ceviche text-rap-forest mb-0 animate-text-glow tracking-wider">
              Rising Legends of 2024
            </h2>
            <Crown className="w-6 h-6 text-rap-forest" />
          </div>
          <p className="text-rap-platinum font-kaushan text-lg">
            The next generation ascending to greatness
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-carbon-fiber border-rap-forest/20 animate-pulse">
              <CardContent className="p-4">
                <div className="h-32 bg-rap-carbon-light rounded-lg mb-3"></div>
                <div className="h-3 bg-rap-carbon-light rounded mb-2"></div>
                <div className="h-2 bg-rap-carbon-light rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Filter out items where rapper is null to prevent errors
  const validRisingLegends = risingLegends?.filter(item => item.rapper !== null) || [];

  if (validRisingLegends.length === 0) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-rap-forest" />
            <h2 className="text-3xl font-ceviche text-rap-forest mb-0 animate-text-glow tracking-wider text-border">
              Rising Legends of 2025
            </h2>
            <Crown className="w-6 h-6 text-rap-forest" />
          </div>
          <p className="text-rap-platinum font-merienda text-lg">
            The next generation ascending to greatness
          </p>
        </div>
        <Card className="bg-carbon-fiber border border-rap-forest/40 shadow-2xl shadow-rap-forest/20">
          <CardContent className="p-8 text-center">
            <TrendingUp className="w-16 h-16 text-rap-forest mx-auto mb-4" />
            <p className="text-rap-smoke font-merienda">The rising stars are yet to be crowned.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-rap-forest" />
          <h2 className="text-3xl font-ceviche text-rap-forest mb-0 animate-text-glow tracking-wider">
            Rising Legends of 2024
          </h2>
          <Crown className="w-6 h-6 text-rap-forest" />
        </div>
        <p className="text-rap-platinum font-kaushan text-lg">
          The next generation ascending to greatness
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {validRisingLegends.map(item => (
          <RapperCard 
            key={item.rapper!.id} 
            rapper={item.rapper!} 
            position={item.position} 
            compact={true} 
          />
        ))}
      </div>

      <div className="text-center mt-8">
        <Link to="/rankings/official/rising-legends-2024">
          <Button className="bg-gradient-to-r from-rap-forest to-rap-forest-light hover:from-rap-forest-light hover:to-rap-forest font-mogra shadow-xl shadow-rap-forest/40 border border-rap-forest/30" size="lg">
            View Complete Rising Legends List
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default RisingLegendsSection;
