
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import RapperCard from "./RapperCard";

type Rapper = Tables<"rappers">;

interface OfficialRankingItem {
  position: number;
  reason: string;
  rappers: Rapper;
}

const TopRappersGrid = () => {
  const { data: officialRanking, isLoading } = useQuery({
    queryKey: ["official-goat-ranking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("official_ranking_items")
        .select(`
          position,
          reason,
          rappers (*)
        `)
        .eq("ranking_id", (
          await supabase
            .from("official_rankings")
            .select("id")
            .eq("slug", "goat-top-5")
            .single()
        ).data?.id)
        .order("position", { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data as OfficialRankingItem[];
    }
  });

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-ceviche text-rap-gold mb-2 animate-text-glow tracking-wider">
            The Supreme Council of Pharaohs
          </h2>
          <p className="text-rap-platinum font-kaushan text-lg">
            The most revered rulers of the lyrical kingdom
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="bg-carbon-fiber border-rap-gold/20 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-rap-carbon-light rounded-lg mb-4"></div>
                  <div className="h-4 bg-rap-carbon-light rounded mb-2"></div>
                  <div className="h-3 bg-rap-carbon-light rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-carbon-fiber border-rap-gold/20 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-rap-carbon-light rounded-lg mb-4"></div>
                  <div className="h-4 bg-rap-carbon-light rounded mb-2"></div>
                  <div className="h-3 bg-rap-carbon-light rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!officialRanking || officialRanking.length === 0) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-ceviche text-rap-gold mb-2 animate-text-glow tracking-wider">
            The Supreme Council of Pharaohs
          </h2>
          <p className="text-rap-platinum font-kaushan text-lg">
            The most revered rulers of the lyrical kingdom
          </p>
        </div>
        <Card className="bg-carbon-fiber border border-rap-burgundy/40 shadow-2xl shadow-rap-burgundy/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest"></div>
          <CardContent className="p-8 text-center">
            <Music className="w-16 h-16 text-rap-gold mx-auto mb-4 animate-glow-pulse" />
            <h3 className="text-xl font-mogra text-rap-silver mb-2">The Throne Awaits</h3>
            <p className="text-rap-smoke font-kaushan mb-4">No pharaohs have ascended yet. Contact the High Priests to begin the dynasty.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-ceviche text-rap-gold mb-2 animate-text-glow tracking-wider">
          The Supreme Council of Pharaohs
        </h2>
        <p className="text-rap-platinum font-kaushan text-lg">
          The most revered rulers of the lyrical kingdom
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Row - First 2 rappers (pyramid top) */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {officialRanking.slice(0, 2).map((item) => (
            <RapperCard 
              key={item.rappers.id} 
              rapper={item.rappers} 
              position={item.position} 
            />
          ))}
        </div>

        {/* Bottom Row - Last 3 rappers (pyramid base) */}
        {officialRanking.length > 2 && (
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            {officialRanking.slice(2, 5).map((item) => (
              <RapperCard 
                key={item.rappers.id} 
                rapper={item.rappers} 
                position={item.position} 
              />
            ))}
          </div>
        )}
      </div>

      {/* View All Button */}
      <div className="text-center mt-8">
        <Link to="/rankings/official/goat-top-5">
          <Button 
            className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra text-lg shadow-xl shadow-rap-gold/40 border border-rap-gold/30"
            size="lg"
          >
            View Full GOAT Rankings
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TopRappersGrid;
