
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Trophy, Calendar, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import HeaderNavigation from "@/components/HeaderNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RankingCard from "@/components/rankings/RankingCard";

interface MemberStats {
  total_votes: number;
  status: string;
  consecutive_voting_days: number;
}

interface PublicProfile {
  id: string;
  username: string;
  full_name: string | null;
  created_at: string;
  member_stats: MemberStats | null;
}

interface SimpleRanking {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  slug: string;
}

interface SimpleRankingItem {
  position: number;
  reason: string | null;
  rapper_name: string;
}

interface RankingWithItems extends SimpleRanking {
  items: SimpleRankingItem[];
}

const PublicUserProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [rankings, setRankings] = useState<RankingWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, full_name, created_at")
        .eq("id", id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setNotFound(true);
        return;
      }

      // Fetch member stats separately
      const { data: memberStatsData } = await supabase
        .from("member_stats")
        .select("total_votes, status, consecutive_voting_days")
        .eq("id", id)
        .single();

      setProfile({
        ...profileData,
        member_stats: memberStatsData
      });

      // Fetch user's public rankings
      const { data: rankingsData, error: rankingsError } = await supabase
        .from("user_rankings")
        .select("id, title, description, category, created_at, slug")
        .eq("user_id", id)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (rankingsError) {
        console.error("Error fetching rankings:", rankingsError);
        setRankings([]);
      } else if (rankingsData) {
        // Fetch ranking items separately
        const rankingsWithItems: RankingWithItems[] = await Promise.all(
          rankingsData.map(async (ranking) => {
            const { data: items } = await supabase
              .from("user_ranking_items")
              .select(`
                position,
                reason,
                rapper:rappers!inner(name)
              `)
              .eq("ranking_id", ranking.id)
              .order("position");

            const simpleItems: SimpleRankingItem[] = (items || []).map(item => ({
              position: item.position,
              reason: item.reason,
              rapper_name: (item.rapper as { name: string }).name
            }));

            return {
              ...ranking,
              items: simpleItems
            };
          })
        );
        
        setRankings(rankingsWithItems);
      }
    } catch (error) {
      console.error("Error:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
        <div className="text-rap-gold font-mogra text-xl">Loading profile...</div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
        <HeaderNavigation isScrolled={false} />
        <div className="max-w-4xl mx-auto pt-20 px-4">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-rap-platinum mb-4 font-mogra">User Not Found</h1>
            <p className="text-rap-smoke mb-6 font-kaushan">This user profile doesn't exist.</p>
            <Link to="/rankings" className="text-rap-gold hover:text-rap-gold-light font-kaushan">
              ← Back to Rankings
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <HeaderNavigation isScrolled={false} />
      
      <div className="max-w-6xl mx-auto pt-20 px-4">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link to="/rankings" className="flex items-center space-x-2 text-rap-gold hover:text-rap-gold-light transition-colors font-kaushan">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Rankings</span>
          </Link>
        </div>

        {/* Profile Header */}
        <Card className="bg-carbon-fiber border-rap-burgundy/40 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rap-gold-dark via-rap-gold to-rap-gold-light flex items-center justify-center">
                <User className="w-8 h-8 text-rap-carbon" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-rap-platinum font-mogra">
                  {profile.username}
                </h1>
                {profile.full_name && (
                  <p className="text-rap-smoke font-kaushan text-lg">
                    {profile.full_name}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <Badge className={`font-kaushan ${
                    profile.member_stats?.status === 'diamond' ? 'bg-blue-500/20 text-blue-400' :
                    profile.member_stats?.status === 'platinum' ? 'bg-gray-300/20 text-gray-300' :
                    profile.member_stats?.status === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                    profile.member_stats?.status === 'silver' ? 'bg-gray-400/20 text-gray-400' :
                    'bg-orange-600/20 text-orange-400'
                  }`}>
                    <Trophy className="w-3 h-3 mr-1" />
                    {profile.member_stats?.status || 'Bronze'} Member
                  </Badge>
                  <div className="flex items-center gap-1 text-rap-smoke font-kaushan text-sm">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-rap-smoke/20 pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-rap-gold font-mogra">
                  {profile.member_stats?.total_votes || 0}
                </div>
                <div className="text-rap-smoke font-kaushan text-sm">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-rap-gold font-mogra">
                  {rankings.length}
                </div>
                <div className="text-rap-smoke font-kaushan text-sm">Public Rankings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-rap-gold font-mogra">
                  {profile.member_stats?.consecutive_voting_days || 0}
                </div>
                <div className="text-rap-smoke font-kaushan text-sm">Voting Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Rankings */}
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
      </div>
    </div>
  );
};

export default PublicUserProfile;
