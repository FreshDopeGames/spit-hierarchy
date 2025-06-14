
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import RapperCard from "./RapperCard";

type Rapper = Tables<"rappers">;

interface RankingItem {
  position: number;
  reason: string;
  rapper: Rapper | null;
}

const TopRappersGrid = () => {
  const { data: topRappers, isLoading } = useQuery({
    queryKey: ["goat-top-5"],
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
          .eq("slug", "goat-top-5")
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
      <div className="mb-8 sm:mb-12">
        <div className="text-center mb-6 sm:mb-8 px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-rap-gold flex-shrink-0" />
            <h2 className="text-2xl sm:text-3xl font-ceviche text-rap-gold mb-0 animate-text-glow tracking-wider break-words">
              The Elite Five
            </h2>
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-rap-gold flex-shrink-0" />
          </div>
          <p className="text-rap-platinum font-kaushan text-base sm:text-lg">
            The supreme rulers of the rap realm
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="bg-carbon-fiber border-rap-gold/20 animate-pulse">
                <CardContent className="p-4 sm:p-6">
                  <div className="h-32 sm:h-48 bg-rap-carbon-light rounded-lg mb-4"></div>
                  <div className="h-4 bg-rap-carbon-light rounded mb-2"></div>
                  <div className="h-3 bg-rap-carbon-light rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="sm:col-span-2 lg:col-span-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 sm:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i + 2} className="bg-carbon-fiber border-rap-gold/20 animate-pulse">
                <CardContent className="p-4 sm:p-6">
                  <div className="h-32 sm:h-48 bg-rap-carbon-light rounded-lg mb-4"></div>
                  <div className="h-4 bg-rap-carbon-light rounded mb-2"></div>
                  <div className="h-3 bg-rap-carbon-light rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter out items where rapper is null to prevent errors
  const validTopRappers = topRappers?.filter(item => item.rapper !== null) || [];

  if (validTopRappers.length === 0) {
    return (
      <div className="mb-8 sm:mb-12">
        <div className="text-center mb-6 sm:mb-8 px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-rap-gold flex-shrink-0" />
            <h2 className="text-2xl sm:text-3xl font-ceviche text-rap-gold mb-0 animate-text-glow tracking-wider text-border break-words">
              THE GOATS 🐐
            </h2>
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-rap-gold flex-shrink-0" />
          </div>
          <p className="text-rap-platinum font-merienda text-base sm:text-lg">
            The supreme rulers of the rap realm
          </p>
        </div>
        <Card className="bg-carbon-fiber border border-rap-gold/40 shadow-2xl shadow-rap-gold/20">
          <CardContent className="p-6 sm:p-8 text-center">
            <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-rap-gold mx-auto mb-4" />
            <p className="text-rap-smoke font-merienda text-sm sm:text-base">The throne awaits its rightful rulers.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8 sm:mb-12">
      <div className="text-center mb-6 sm:mb-8 px-4">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
          <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-rap-gold flex-shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-ceviche text-rap-gold mb-0 animate-text-glow tracking-wider break-words">
            The Elite Five
          </h2>
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-rap-gold flex-shrink-0" />
        </div>
        <p className="text-rap-platinum font-kaushan text-base sm:text-lg">
          The supreme rulers of the rap realm
        </p>
      </div>

      {/* Pyramid layout: 2 on top, 3 on bottom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Top row - positions 1 & 2 */}
        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {validTopRappers.slice(0, 2).map(item => (
            <RapperCard 
              key={item.rapper!.id} 
              rapper={item.rapper!} 
              position={item.position} 
            />
          ))}
        </div>
        
        {/* Bottom row - positions 3, 4 & 5 */}
        <div className="sm:col-span-2 lg:col-span-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 sm:gap-6">
          {validTopRappers.slice(2, 5).map(item => (
            <RapperCard 
              key={item.rapper!.id} 
              rapper={item.rapper!} 
              position={item.position} 
            />
          ))}
        </div>
      </div>

      <div className="text-center mt-6 sm:mt-8 px-4">
        <Link to="/rankings/official/goat-top-5">
          <Button className="bg-gradient-to-r from-rap-gold to-rap-gold-light hover:from-rap-gold-light hover:to-rap-gold font-mogra shadow-xl shadow-rap-gold/40 border border-rap-gold/30 text-sm sm:text-base px-4 sm:px-6" size="lg">
            View Complete GOAT Rankings
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TopRappersGrid;
