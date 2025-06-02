
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenTool, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import RapperCard from "./RapperCard";

type Rapper = Tables<"rappers">;

interface OfficialRankingItem {
  position: number;
  reason: string;
  rappers: Rapper;
}

const LyricalMastersSection = () => {
  const { data: lyricalMasters, isLoading } = useQuery({
    queryKey: ["lyrical-masters"],
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
            .eq("slug", "lyrical-masters")
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <PenTool className="w-6 h-6 text-rap-burgundy" />
            <h2 className="text-3xl font-ceviche text-rap-burgundy mb-0 animate-text-glow tracking-wider">
              Lyrical Masters
            </h2>
            <Mic className="w-6 h-6 text-rap-burgundy" />
          </div>
          <p className="text-rap-platinum font-kaushan text-lg">
            The wordsmiths who paint with poetry
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-carbon-fiber border-rap-burgundy/20 animate-pulse">
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

  if (!lyricalMasters || lyricalMasters.length === 0) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PenTool className="w-6 h-6 text-rap-burgundy" />
            <h2 className="text-3xl font-ceviche text-rap-burgundy mb-0 animate-text-glow tracking-wider">
              Lyrical Masters
            </h2>
            <Mic className="w-6 h-6 text-rap-burgundy" />
          </div>
          <p className="text-rap-platinum font-kaushan text-lg">
            The wordsmiths who paint with poetry
          </p>
        </div>
        <Card className="bg-carbon-fiber border border-rap-burgundy/40 shadow-2xl shadow-rap-burgundy/20">
          <CardContent className="p-8 text-center">
            <PenTool className="w-16 h-16 text-rap-burgundy mx-auto mb-4" />
            <p className="text-rap-smoke font-kaushan">The masters of words await recognition.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <PenTool className="w-6 h-6 text-rap-burgundy" />
          <h2 className="text-3xl font-ceviche text-rap-burgundy mb-0 animate-text-glow tracking-wider">
            Lyrical Masters
          </h2>
          <Mic className="w-6 h-6 text-rap-burgundy" />
        </div>
        <p className="text-rap-platinum font-kaushan text-lg">
          The wordsmiths who paint with poetry
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {lyricalMasters.map((item) => (
          <RapperCard 
            key={item.rappers.id} 
            rapper={item.rappers} 
            position={item.position}
            compact={true}
          />
        ))}
      </div>

      <div className="text-center mt-8">
        <Link to="/rankings/official/lyrical-masters">
          <Button 
            className="bg-gradient-to-r from-rap-burgundy to-rap-burgundy-light hover:from-rap-burgundy-light hover:to-rap-burgundy font-mogra shadow-xl shadow-rap-burgundy/40 border border-rap-burgundy/30"
            size="lg"
          >
            View All Lyrical Masters
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LyricalMastersSection;
