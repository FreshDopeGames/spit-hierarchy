
import { Link } from "react-router-dom";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader } from "@/components/ui/themed-card";
import { Badge } from "@/components/ui/badge";
import { Crown, Users, Eye, Star, Calendar, User } from "lucide-react";
import { UnifiedRanking } from "@/types/rankings";
import RapperMosaic from "@/components/ui/RapperMosaic";
import { useState, useEffect, useRef } from "react";

interface RankingCardProps {
  ranking: UnifiedRanking;
  isUserRanking?: boolean;
}

const RankingCard = ({
  ranking,
  isUserRanking = false
}: RankingCardProps) => {
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);

  // Lazy loading observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Debug data removed for production
  
  // Construct the proper link based on ranking type
  const rankingLink = isUserRanking && !ranking.isOfficial ? `/rankings/user/${ranking.slug}` : `/rankings/official/${ranking.slug}`;
  
  return (
    <Link ref={cardRef} to={rankingLink} className="block group">
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
          {/* Top 5 Rappers Grid - Only render when in view for lazy loading */}
          {isInView && ranking.rappers && ranking.rappers.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-[var(--theme-textMuted)] mb-4 font-[var(--theme-fontSecondary)]">
                Top {Math.min(ranking.rappers.length, 5)}:
              </h4>
              
              <div className="space-y-4">
                {/* Top 2 Cards - Larger */}
                {ranking.rappers.slice(0, 2).length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {ranking.rappers.slice(0, 2).map((rapper, index) => (
                      <div key={`${rapper.rank}-${rapper.name}`} className="relative">
                        <div className="bg-[var(--theme-surface)]/50 border border-[var(--theme-border)]/30 rounded-lg p-3 hover:bg-[var(--theme-surface)]/70 transition-colors">
                          {/* Position indicator */}
                          <div className="absolute -top-2 -left-2 bg-[var(--theme-primary)] text-[var(--theme-background)] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold font-[var(--theme-fontSecondary)] z-10">
                            {index + 1}
                          </div>
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-[var(--theme-accent)]/20 rounded-full flex items-center justify-center border border-[var(--theme-border)]/30">
                              <span className="text-xs font-bold text-[var(--theme-accent)]">
                                {rapper.name.charAt(0)}
                              </span>
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-medium text-[var(--theme-text)] font-[var(--theme-fontSecondary)] truncate max-w-16">
                                {rapper.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Cards 3-5 - Smaller Grid */}
                {ranking.rappers.slice(2, 5).length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {ranking.rappers.slice(2, 5).map((rapper, index) => (
                      <div key={`${rapper.rank}-${rapper.name}`} className="relative">
                        <div className="bg-[var(--theme-surface)]/50 border border-[var(--theme-border)]/30 rounded-lg p-2 hover:bg-[var(--theme-surface)]/70 transition-colors">
                          {/* Position indicator */}
                          <div className="absolute -top-1 -left-1 bg-[var(--theme-primary)] text-[var(--theme-background)] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold font-[var(--theme-fontSecondary)] z-10">
                            {index + 3}
                          </div>
                          <div className="flex flex-col items-center space-y-1">
                            <div className="w-8 h-8 bg-[var(--theme-accent)]/20 rounded-full flex items-center justify-center border border-[var(--theme-border)]/30">
                              <span className="text-xs font-bold text-[var(--theme-accent)]">
                                {rapper.name.charAt(0)}
                              </span>
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-medium text-[var(--theme-text)] font-[var(--theme-fontSecondary)] truncate max-w-12">
                                {rapper.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading placeholder when not in view */}
          {!isInView && ranking.rappers && ranking.rappers.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-[var(--theme-textMuted)] mb-4 font-[var(--theme-fontSecondary)]">
                Top {Math.min(ranking.rappers.length, 5)}:
              </h4>
              <div className="space-y-4">
                <div className="h-20 bg-[var(--theme-surface)]/30 border border-[var(--theme-border)]/30 rounded-md animate-pulse" />
                <div className="h-16 bg-[var(--theme-surface)]/30 border border-[var(--theme-border)]/30 rounded-md animate-pulse" />
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
