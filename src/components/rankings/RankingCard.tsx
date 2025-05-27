
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
  onClick: (id: string) => void;
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
  onClick
}: RankingCardProps) => {
  const borderColor = isOfficial ? "border-yellow-500/30 hover:border-yellow-400/50" : "border-purple-500/20 hover:border-purple-400/40";
  const hoverColor = isOfficial ? "group-hover:text-yellow-300" : "group-hover:text-purple-300";
  const rankColor = isOfficial ? "text-yellow-400" : "text-purple-400";

  return (
    <Card className={`bg-black/40 ${borderColor} transition-colors group cursor-pointer`}>
      <CardContent className="p-6" onClick={() => onClick(id)}>
        <div className="flex items-center gap-2 mb-3">
          {isOfficial && (
            <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300 text-xs">
              <Award className="w-3 h-3 mr-1" />
              Official
            </Badge>
          )}
          {tags.filter(tag => tag !== "Official").map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-purple-600/20 text-purple-300 text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <h2 className={`text-xl font-bold text-white mb-2 ${hoverColor} transition-colors`}>
          {title}
        </h2>
        
        <p className="text-gray-300 mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="space-y-2 mb-4">
          {rappers.slice(0, 3).map((rapper) => (
            <div key={rapper.rank} className="flex items-center gap-2 text-sm">
              <span className={`${rankColor} font-semibold`}>#{rapper.rank}</span>
              <span className="text-white">{rapper.name}</span>
            </div>
          ))}
          {rappers.length > 3 && (
            <div className="text-gray-400 text-sm">
              +{rappers.length - 3} more...
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-gray-400 text-sm border-t border-gray-700 pt-4">
          <div className="flex items-center gap-4">
            <span>by {author}</span>
            <span>{timeAgo}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>{likes}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RankingCard;
