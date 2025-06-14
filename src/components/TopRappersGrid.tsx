
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Trophy, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import RapperCard from "./RapperCard";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface TopRappersGridProps {
  title?: string;
  description?: string;
  rappers?: Rapper[];
  showViewAll?: boolean;
  viewAllLink?: string;
}

const TopRappersGrid = ({ 
  title = "The GOATs", 
  description = "The undisputed legends who shaped the culture",
  rappers: providedRappers,
  showViewAll = false,
  viewAllLink = "/all-rappers"
}: TopRappersGridProps) => {
  // Only fetch default data if no rappers are provided
  const { data: fetchedRappers = [], isLoading } = useQuery({
    queryKey: ["top-rappers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rappers")
        .select("*")
        .order("average_rating", { ascending: false })
        .order("total_votes", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !providedRappers // Only run query if no rappers provided
  });

  const rappers = providedRappers || fetchedRappers;

  if (isLoading && !providedRappers) {
    return (
      <section className="mb-16">
        <div className="animate-pulse">
          <div className="h-8 bg-rap-carbon-light rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-64 bg-rap-carbon-light rounded"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-rap-gold" />;
      case 2:
        return <Trophy className="w-6 h-6 text-rap-silver" />;
      case 3:
        return <Star className="w-6 h-6 text-orange-500" />;
      default:
        return <TrendingUp className="w-6 h-6 text-rap-platinum" />;
    }
  };

  return (
    <section className="mb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          {getPositionIcon(1)}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-rap-platinum font-mogra">{title}</h2>
            <p className="text-rap-smoke font-merienda text-sm sm:text-base mt-1">
              {description}
            </p>
          </div>
          <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30 font-kaushan text-xs sm:text-sm">
            Top 5
          </Badge>
        </div>
        
        {showViewAll && (
          <Link to={viewAllLink} className="w-full sm:w-auto">
            <Button 
              className="w-full sm:w-auto bg-rap-gold text-rap-charcoal hover:bg-rap-gold/80 hover:text-rap-carbon font-mogra text-sm px-3 py-2"
            >
              View Full Ranking
            </Button>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {rappers.slice(0, 5).map((rapper, index) => (
          <RapperCard 
            key={rapper.id} 
            rapper={rapper} 
            position={index + 1}
            compact={true}
          />
        ))}
      </div>
    </section>
  );
};

export default TopRappersGrid;
