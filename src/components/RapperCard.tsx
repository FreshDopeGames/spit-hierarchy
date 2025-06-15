
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
import { Star, Crown, Trophy, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { useRapperImage } from "@/hooks/useImageStyle";

type Rapper = Tables<"rappers">;

interface RapperCardProps {
  rapper: Rapper;
  position: number;
  compact?: boolean;
}

const RapperCard = ({ rapper, position, compact = false }: RapperCardProps) => {
  const { data: imageUrl } = useRapperImage(rapper.id);

  const getPositionIcon = (pos: number) => {
    switch (pos) {
      case 1:
        return <Crown className="w-5 h-5 text-rap-gold" />;
      case 2:
        return <Trophy className="w-5 h-5 text-rap-silver" />;
      case 3:
        return <Star className="w-5 h-5 text-orange-500" />;
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-rap-gold-dark via-rap-gold to-rap-gold-light shadow-lg">
            <span className="text-rap-carbon font-mogra text-sm font-bold">{pos}</span>
          </div>
        );
    }
  };

  const getPositionColors = (pos: number) => {
    switch (pos) {
      case 1:
        return "border-rap-gold/50 shadow-rap-gold/30";
      case 2:
        return "border-rap-silver/50 shadow-rap-silver/30";
      case 3:
        return "border-orange-500/50 shadow-orange-500/30";
      default:
        return "border-rap-platinum/50 shadow-rap-platinum/30";
    }
  };

  if (compact) {
    return (
      <Link to={`/rapper/${rapper.id}`}>
        <Card className={`bg-carbon-fiber ${getPositionColors(position)} transition-all duration-300 hover:scale-105 group cursor-pointer relative overflow-hidden`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-rap-gold"></div>
          
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getPositionIcon(position)}
              </div>
              <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30 text-xs font-kaushan">
                {position}
              </Badge>
            </div>
            
            <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gradient-to-br from-rap-carbon to-rap-carbon-light flex items-center justify-center">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={rapper.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                />
              ) : (
                <Music className="w-12 h-12 text-rap-platinum/50" />
              )}
            </div>
            
            <h3 className="text-rap-platinum font-mogra text-sm group-hover:text-rap-gold transition-colors leading-tight">
              {rapper.name}
            </h3>
            
            {rapper.real_name && (
              <p className="text-rap-smoke text-xs font-kaushan mt-1">
                {rapper.real_name}
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/rapper/${rapper.id}`}>
      <Card className={`bg-carbon-fiber ${getPositionColors(position)} transition-all duration-300 hover:scale-105 group cursor-pointer relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-rap-gold"></div>
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getPositionIcon(position)}
              <h3 className="text-xl font-mogra text-rap-platinum group-hover:text-rap-gold transition-colors">
                {rapper.name}
              </h3>
            </div>
            <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30 font-kaushan">
              {position}
            </Badge>
          </div>
          
          <div className="aspect-[4/3] mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-rap-carbon to-rap-carbon-light flex items-center justify-center">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={rapper.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
              />
            ) : (
              <Music className="w-16 h-16 text-rap-platinum/50" />
            )}
          </div>
          
          <div className="space-y-2">
            {rapper.real_name && (
              <p className="text-rap-smoke font-kaushan">
                <span className="text-rap-silver">Real Name:</span> {rapper.real_name}
              </p>
            )}
            
            {rapper.origin && (
              <p className="text-rap-smoke font-kaushan">
                <span className="text-rap-silver">Origin:</span> {rapper.origin}
              </p>
            )}
            
            <div className="flex items-center gap-4 pt-2 border-t border-rap-smoke/20">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-rap-gold" />
                <span className="text-rap-platinum font-kaushan text-sm">
                  {rapper.average_rating ? parseFloat(rapper.average_rating.toString()).toFixed(1) : "0.0"}
                </span>
              </div>
              <span className="text-rap-smoke font-kaushan text-sm">
                {rapper.total_votes || 0} votes
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RapperCard;
