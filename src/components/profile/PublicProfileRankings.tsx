
import { Link } from "react-router-dom";
import { Trophy, Users, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicProfile, RankingWithItems } from "@/types/publicProfile";

interface PublicProfileRankingsProps {
  profile: PublicProfile;
  rankings: RankingWithItems[];
}

const PublicProfileRankings = ({ profile, rankings }: PublicProfileRankingsProps) => {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'lyrical': 'bg-purple-500/20 text-purple-400 border-purple-400/30',
      'commercial': 'bg-green-500/20 text-green-400 border-green-400/30',
      'underground': 'bg-orange-500/20 text-orange-400 border-orange-400/30',
      'regional': 'bg-blue-500/20 text-blue-400 border-blue-400/30',
      'era': 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
      'style': 'bg-pink-500/20 text-pink-400 border-pink-400/30',
    };
    return colors[category.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-400/30';
  };

  if (rankings.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-rap-platinum mb-6 font-mogra">
          {profile.username}'s Rankings
        </h2>
        <Card className="bg-carbon-fiber border-rap-smoke/30">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 text-rap-smoke mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-rap-platinum mb-2 font-mogra">
              No Public Rankings Yet
            </h3>
            <p className="text-rap-smoke font-kaushan">
              This user hasn't created any public rankings yet. Check back later to see their contributions to the hip-hop community!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-rap-platinum mb-6 font-mogra">
        {profile.username}'s Rankings ({rankings.length})
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rankings.map(ranking => (
          <Link key={ranking.id} to={`/rankings/user/${ranking.slug}`} className="block">
            <Card className="bg-carbon-fiber border-rap-smoke/30 hover:border-rap-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-rap-gold/20 group">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-rap-platinum font-mogra group-hover:text-rap-gold transition-colors line-clamp-2">
                      {ranking.title}
                    </h3>
                    <p className="text-rap-smoke font-kaushan text-sm mt-1">
                      {new Date(ranking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={`font-kaushan border ${getCategoryColor(ranking.category)} flex-shrink-0`}>
                    {ranking.category}
                  </Badge>
                </div>

                {/* Description */}
                {ranking.description && (
                  <p className="text-rap-smoke font-kaushan text-sm mb-4 line-clamp-2">
                    {ranking.description}
                  </p>
                )}

                {/* Top rappers preview */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-semibold text-rap-platinum font-kaushan">
                    Top {Math.min(ranking.items.length, 5)} Rappers:
                  </h4>
                  <div className="space-y-1">
                    {ranking.items
                      .sort((a, b) => a.position - b.position)
                      .slice(0, 5)
                      .map((item, index) => (
                        <div key={`${item.position}-${item.rapper_name}`} className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 rounded-full bg-rap-gold/20 flex items-center justify-center text-rap-gold font-bold text-xs">
                            {item.position}
                          </div>
                          <span className="text-rap-platinum font-kaushan font-medium">
                            {item.rapper_name}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Footer stats */}
                <div className="flex items-center justify-between pt-4 border-t border-rap-smoke/20">
                  <div className="flex items-center gap-4 text-xs text-rap-smoke">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{ranking.items.length} rappers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>Public</span>
                    </div>
                  </div>
                  <div className="text-xs text-rap-gold font-kaushan">
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
