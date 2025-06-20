
import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import RankingCard from "@/components/rankings/RankingCard";
import { PublicProfile, RankingWithItems } from "@/types/publicProfile";

interface PublicProfileRankingsProps {
  profile: PublicProfile;
  rankings: RankingWithItems[];
}

const PublicProfileRankings = ({ profile, rankings }: PublicProfileRankingsProps) => {
  // Transform rankings for RankingCard component
  const transformedRankings = rankings.map(ranking => ({
    id: ranking.id,
    title: ranking.title,
    description: ranking.description,
    author: profile.username,
    authorId: profile.id,
    timeAgo: new Date(ranking.created_at).toLocaleDateString(),
    rappers: ranking.items
      .sort((a, b) => a.position - b.position)
      .slice(0, 5)
      .map(item => ({
        rank: item.position,
        name: item.rapper_name,
        reason: item.reason || ""
      })),
    likes: Math.floor(Math.random() * 200) + 50,
    views: Math.floor(Math.random() * 1000) + 100,
    isOfficial: false,
    tags: ["Community", ranking.category],
    slug: ranking.slug
  }));

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-rap-platinum mb-6 font-mogra">
        {profile.username}'s Rankings
      </h2>
      
      {transformedRankings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {transformedRankings.map(ranking => (
            <Link key={ranking.id} to={`/rankings/user/${ranking.slug}`}>
              <RankingCard {...ranking} />
            </Link>
          ))}
        </div>
      ) : (
        <Card className="bg-carbon-fiber border-rap-smoke/30">
          <CardContent className="p-8 text-center">
            <Trophy className="w-12 h-12 text-rap-smoke mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-rap-platinum mb-2 font-mogra">
              No Public Rankings
            </h3>
            <p className="text-rap-smoke font-kaushan">
              This user hasn't created any public rankings yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublicProfileRankings;
