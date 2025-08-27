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
      <Card className="h-full bg-gradient-to-br from-[var(--theme-background)] via-[var(--theme-surface)] to-[var(--theme-backgroundLight)] border-[var(--theme-border)] hover:border-[var(--theme-primary)]/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[var(--theme-primary)]/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              {ranking.isOfficial ? (
                <Badge variant="default" className="bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border-[var(--theme-primary)]/30 font-[var(--theme-fontSecondary)]">
                  <Crown className="w-3 h-3 mr-1" />
                  Official
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] border-[var(--theme-accent)]/30 font-[var(--theme-fontSecondary)]">
                  <Users className="w-3 h-3 mr-1" />
                  Community
                </Badge>
              )}
              
              {ranking.category && (
                <Badge variant="outline" className="border-[var(--theme-textMuted)]/30 text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)] text-xs">
                  {ranking.category}
                </Badge>
              )}
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-primary)] transition-colors font-[var(--theme-fontPrimary)] line-clamp-2">
            {ranking.title}
          </h3>
          
          {ranking.description && (
            <p className="text-[var(--theme-textMuted)] text-sm font-[var(--theme-fontSecondary)] line-clamp-2 leading-relaxed">
              {ranking.description}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Top Rappers Preview */}
          {ranking.rappers && ranking.rappers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-[var(--theme-textMuted)] mb-2 font-[var(--theme-fontSecondary)]">
                Top {Math.min(ranking.rappers.length, 3)}:
              </h4>
              <div className="space-y-1">
                {ranking.rappers.slice(0, 3).map((rapper, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-[var(--theme-primary)] text-[var(--theme-background)] text-xs font-bold flex items-center justify-center font-[var(--theme-fontPrimary)]">
                      {rapper.rank}
                    </span>
                    <span className="text-[var(--theme-text)] font-[var(--theme-fontSecondary)] truncate">
                      {rapper.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Stats and Meta Information */}
          <div className="flex items-center justify-between text-xs text-[var(--theme-textMuted)] border-t border-[var(--theme-border)] pt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span className="font-[var(--theme-fontSecondary)]">{ranking.views || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-[var(--theme-primary)]" />
                <span className="font-[var(--theme-fontSecondary)]">{ranking.totalVotes || 0} votes</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-right">
              {!ranking.isOfficial && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span className="font-[var(--theme-fontSecondary)] truncate max-w-20">
                    {ranking.author}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="font-[var(--theme-fontSecondary)]">
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
