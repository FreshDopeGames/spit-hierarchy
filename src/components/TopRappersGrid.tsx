
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import RapperCard from "./RapperCard";

type Rapper = Tables<"rappers">;

const TopRappersGrid = () => {
  const { data: topRappers, isLoading } = useQuery({
    queryKey: ["top-rappers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rappers")
        .select("*")
        .order("average_rating", { ascending: false })
        .order("total_votes", { ascending: false })
        .order("name", { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data;
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6 md:px-16">
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
        </div>
      </div>
    );
  }

  if (!topRappers || topRappers.length === 0) {
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Row - First 3 rappers */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {topRappers.slice(0, 3).map((rapper, index) => (
            <RapperCard 
              key={rapper.id} 
              rapper={rapper} 
              position={index + 1} 
            />
          ))}
        </div>

        {/* Bottom Row - Last 2 rappers (if they exist) */}
        {topRappers.length > 3 && (
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 md:px-16">
            {topRappers.slice(3, 5).map((rapper, index) => (
              <RapperCard 
                key={rapper.id} 
                rapper={rapper} 
                position={index + 4} 
              />
            ))}
          </div>
        )}
      </div>

      {/* View All Button */}
      <div className="text-center mt-8">
        <Link to="/all-rappers">
          <Button 
            className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra text-lg shadow-xl shadow-rap-gold/40 border border-rap-gold/30"
            size="lg"
          >
            Enter the Full Pharaoh Court
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TopRappersGrid;
