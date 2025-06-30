
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Users, Eye, Star, Calendar, User } from "lucide-react";
import { UnifiedRanking } from "@/types/rankings";

interface RankingCardProps {
  ranking: UnifiedRanking;
  isUserRanking?: boolean;
}

const RankingCard = ({
  ranking,
  isUserRanking = false
}: RankingCardProps) => {
  // Construct the proper link based on ranking type
  const rankingLink = isUserRanking && !ranking.isOfficial ? `/rankings/user/${ranking.slug}` : `/rankings/official/${ranking.slug}`;
  
  return (
    <Link to={rankingLink} className="block group">
      <Card className="h-full bg-gradient-to-br from-black via-rap-carbon to-rap-charcoal border-rap-silver/30 hover:border-rap-gold/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-rap-gold/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              {ranking.isOfficial ? (
                <Badge variant="default" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30 font-kaushan">
                  <Crown className="w-3 h-3 mr-1" />
                  Official
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-rap-burgundy/20 text-rap-burgundy border-rap-burgundy/30 font-kaushan">
                  <Users className="w-3 h-3 mr-1" />
                  Community
                </Badge>
              )}
              
              {ranking.category && (
                <Badge variant="outline" className="border-rap-smoke/30 text-rap-smoke font-kaushan text-xs">
                  {ranking.category}
                </Badge>
              )}
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-rap-platinum group-hover:text-rap-gold transition-colors font-mogra line-clamp-2">
            {ranking.title}
          </h3>
          
          {ranking.description && (
            <p className="text-rap-smoke text-sm font-merienda line-clamp-2 leading-relaxed">
              {ranking.description}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Top Rappers Preview */}
          {ranking.rappers && ranking.rappers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-rap-silver mb-2 font-merienda">
                Top {Math.min(ranking.rappers.length, 3)}:
              </h4>
              <div className="space-y-1">
                {ranking.rappers.slice(0, 3).map((rapper, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-rap-gold text-rap-carbon text-xs font-bold flex items-center justify-center font-mogra">
                      {rapper.rank}
                    </span>
                    <span className="text-rap-platinum font-merienda truncate">
                      {rapper.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Stats and Meta Information */}
          <div className="flex items-center justify-between text-xs text-rap-smoke border-t border-rap-smoke/20 pt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span className="font-merienda">{ranking.views || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-rap-gold" />
                <span className="font-merienda">{ranking.totalVotes || 0} votes</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-right">
              {!ranking.isOfficial && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span className="font-merienda truncate max-w-20">
                    {ranking.author}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="font-merienda">
                  {ranking.timeAgo}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RankingCard;
