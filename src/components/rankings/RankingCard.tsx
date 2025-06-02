
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Star, Award } from "lucide-react";

interface Rapper {
  rank: number;
  name: string;
  reason: string;
}

interface RankingCardProps {
  id: string;
  title: string;
  description: string;
  author: string;
  timeAgo: string;
  rappers: Rapper[];
  likes: number;
  views: number;
  isOfficial: boolean;
  tags: string[];
  onClick?: (id: string) => void;
  slug?: string;
}

const RankingCard = ({
  id,
  title,
  description,
  author,
  timeAgo,
  rappers,
  likes,
  views,
  isOfficial,
  tags,
  onClick,
  slug
}: RankingCardProps) => {
  const borderColor = isOfficial ? "border-rap-gold/40 hover:border-rap-gold/70" : "border-rap-burgundy/40 hover:border-rap-burgundy/70";
  const hoverColor = isOfficial ? "group-hover:text-rap-gold-light" : "group-hover:text-rap-silver";
  const rankColor = isOfficial ? "text-rap-gold" : "text-rap-burgundy";

  const handleClick = () => {
    if (onClick) {
      onClick(slug || id);
    }
  };

  return (
    <Card className={`bg-carbon-fiber ${borderColor} transition-colors group cursor-pointer relative overflow-hidden`}>
      {/* Rap culture accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rap-burgundy via-rap-forest to-rap-silver"></div>
      
      <CardContent className="p-6" onClick={handleClick}>
        <div className="flex items-center gap-2 mb-3">
          {isOfficial && (
            <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30 text-xs font-kaushan">
              <Award className="w-3 h-3 mr-1" />
              Official
            </Badge>
          )}
          {tags.filter(tag => tag !== "Official").map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-rap-burgundy/20 text-rap-platinum border-rap-burgundy/30 text-xs font-kaushan">
              {tag}
            </Badge>
          ))}
        </div>
        
        <h2 className={`text-xl font-bold text-rap-platinum mb-2 ${hoverColor} transition-colors font-mogra`}>
          {title}
        </h2>
        
        <p className="text-rap-smoke mb-4 line-clamp-2 font-kaushan">
          {description}
        </p>
        
        <div className="space-y-2 mb-4">
          {rappers.slice(0, 3).map((rapper) => (
            <div key={rapper.rank} className="flex items-center gap-2 text-sm">
              <span className={`${rankColor} font-semibold font-ceviche`}>#{rapper.rank}</span>
              <span className="text-rap-platinum font-kaushan">{rapper.name}</span>
            </div>
          ))}
          {rappers.length > 3 && (
            <div className="text-rap-smoke text-sm font-kaushan">
              +{rappers.length - 3} more...
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-rap-smoke text-sm border-t border-rap-silver/20 pt-4">
          <div className="flex items-center gap-4 font-kaushan">
            <span>by {author}</span>
            <span>{timeAgo}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="font-kaushan">{views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-rap-gold" />
              <span className="font-kaushan">{likes}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RankingCard;
