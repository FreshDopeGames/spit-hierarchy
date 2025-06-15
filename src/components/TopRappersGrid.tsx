import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Trophy, Star, TrendingUp, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { useRapperImage } from "@/hooks/useImageStyle";

type Rapper = Tables<"rappers">;

interface TopRappersGridProps {
  title?: string;
  description?: string;
  rappers?: Rapper[];
  showViewAll?: boolean;
  viewAllLink?: string;
}

const RapperAvatar = ({ rapper }: { rapper: Rapper }) => {
  const { data: imageUrl } = useRapperImage(rapper.id);
  
  return (
    <Link to={`/rapper/${rapper.id}`} className="group" onClick={() => window.scrollTo(0, 0)}>
      <div className="flex flex-col items-center space-y-2">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-rap-carbon to-rap-carbon-light flex items-center justify-center border-2 border-rap-gold/30 group-hover:border-rap-gold transition-colors">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={rapper.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
            />
          ) : (
            <Music className="w-8 h-8 text-rap-platinum/50" />
          )}
        </div>
        <span className="text-rap-platinum text-sm font-mogra text-center group-hover:text-rap-gold transition-colors leading-tight">
          {rapper.name}
        </span>
      </div>
    </Link>
  );
};

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
      <Card className="bg-carbon-fiber border-rap-gold/30 shadow-lg shadow-rap-gold/20">
        <CardContent className="p-8">
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
              <Link to={viewAllLink} className="w-full sm:w-auto" onClick={() => window.scrollTo(0, 0)}>
                <Button 
                  className="w-full sm:w-auto bg-rap-gold text-rap-charcoal hover:bg-rap-gold/80 hover:text-rap-carbon font-mogra text-sm px-3 py-2"
                >
                  View Full Ranking
                </Button>
              </Link>
            )}
          </div>
          
          {/* Top 5 Rappers Display */}
          <div className="space-y-6">
            {/* Top 2 in one row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {rappers.slice(0, 2).map((rapper, index) => (
                <div key={rapper.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-rap-carbon-light/30 to-transparent rounded-lg border border-rap-gold/20">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rap-gold text-rap-charcoal font-mogra text-sm">
                    #{index + 1}
                  </div>
                  <RapperAvatar rapper={rapper} />
                  <div className="flex-1">
                    <Link to={`/rapper/${rapper.id}`} className="group" onClick={() => window.scrollTo(0, 0)}>
                      <h3 className="text-lg font-mogra text-rap-platinum group-hover:text-rap-gold transition-colors">
                        {rapper.name}
                      </h3>
                    </Link>
                    {rapper.real_name && (
                      <p className="text-rap-smoke text-sm font-kaushan">
                        {rapper.real_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Next 3 in one row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {rappers.slice(2, 5).map((rapper, index) => (
                <div key={rapper.id} className="flex flex-col items-center space-y-3 p-4 bg-gradient-to-b from-rap-carbon-light/20 to-transparent rounded-lg border border-rap-gold/10">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-rap-silver text-rap-charcoal font-mogra text-xs">
                    #{index + 3}
                  </div>
                  <RapperAvatar rapper={rapper} />
                  <div className="text-center">
                    <Link to={`/rapper/${rapper.id}`} className="group" onClick={() => window.scrollTo(0, 0)}>
                      <h4 className="text-base font-mogra text-rap-platinum group-hover:text-rap-gold transition-colors">
                        {rapper.name}
                      </h4>
                    </Link>
                    {rapper.real_name && (
                      <p className="text-rap-smoke text-xs font-kaushan mt-1">
                        {rapper.real_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default TopRappersGrid;
