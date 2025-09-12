
import { Link } from "react-router-dom";
import { Trophy, Users, Eye } from "lucide-react";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { Badge } from "@/components/ui/badge";
import { PublicProfile, RankingWithItems } from "@/types/publicProfile";

interface PublicProfileRankingsProps {
  profile: PublicProfile;
  rankings: RankingWithItems[];
}

const PublicProfileRankings = ({ profile, rankings }: PublicProfileRankingsProps) => {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'lyrical': 'bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] border-[var(--theme-accent)]/30',
      'commercial': 'bg-[var(--theme-secondary)]/20 text-[var(--theme-secondary)] border-[var(--theme-secondary)]/30',
      'underground': 'bg-[var(--theme-primaryDark)]/20 text-[var(--theme-primaryDark)] border-[var(--theme-primaryDark)]/30',
      'regional': 'bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border-[var(--theme-primary)]/30',
      'era': 'bg-[var(--theme-primaryLight)]/20 text-[var(--theme-primaryLight)] border-[var(--theme-primaryLight)]/30',
      'style': 'bg-[var(--theme-secondaryLight)]/20 text-[var(--theme-secondaryLight)] border-[var(--theme-secondaryLight)]/30',
    };
    return colors[category.toLowerCase()] || 'bg-[var(--theme-textMuted)]/20 text-[var(--theme-textMuted)] border-[var(--theme-textMuted)]/30';
  };

  if (rankings.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--theme-text)] mb-6 font-[var(--theme-font-heading)]">
          {profile.username}'s Rankings
        </h2>
        <Card className="bg-[var(--theme-surface)] border-[var(--theme-textMuted)]/30">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 text-[var(--theme-textMuted)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--theme-text)] mb-2 font-[var(--theme-font-heading)]">
              No Public Rankings Yet
            </h3>
            <p className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)]">
              This user hasn't created any public rankings yet. Check back later to see their contributions to the hip-hop community!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-[var(--theme-text)] mb-6 font-[var(--theme-font-heading)]">
        {profile.username}'s Rankings ({rankings.length})
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rankings.map(ranking => (
          <Link key={ranking.id} to={`/rankings/community-rankings/${ranking.slug}`} className="block">
            <Card className="bg-[var(--theme-surface)] border-[var(--theme-textMuted)]/30 hover:border-[var(--theme-primary)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--theme-primary)]/20 group">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--theme-text)] font-[var(--theme-font-heading)] group-hover:text-[var(--theme-primary)] transition-colors line-clamp-2">
                      {ranking.title}
                    </h3>
                    <p className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-sm mt-1">
                      {new Date(ranking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={`font-[var(--theme-font-body)] border ${getCategoryColor(ranking.category)} flex-shrink-0`}>
                    {ranking.category}
                  </Badge>
                </div>

                {/* Description */}
                {ranking.description && (
                  <p className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-sm mb-4 line-clamp-2">
                    {ranking.description}
                  </p>
                )}

                {/* Top rappers preview */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-semibold text-[var(--theme-text)] font-[var(--theme-font-body)]">
                    Top {Math.min(ranking.items.length, 5)} Rappers:
                  </h4>
                  <div className="space-y-1">
                    {ranking.items
                      .sort((a, b) => a.position - b.position)
                      .slice(0, 5)
                      .map((item, index) => (
                        <div key={`${item.position}-${item.rapper_name}`} className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 rounded-full bg-[var(--theme-primary)]/20 flex items-center justify-center text-[var(--theme-primary)] font-bold text-xs">
                            {item.position}
                          </div>
                          <span className="text-[var(--theme-text)] font-[var(--theme-font-body)] font-medium">
                            {item.rapper_name}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Footer stats */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--theme-textMuted)]/20">
                  <div className="flex items-center gap-4 text-xs text-[var(--theme-textMuted)]">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{ranking.items.length} rappers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>Public</span>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--theme-primary)] font-[var(--theme-font-body)]">
                    View Full Ranking →
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PublicProfileRankings;
