
import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Crown, Star, Trophy, Eye, Users, Lock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import OfficialRankingItems from "@/components/rankings/OfficialRankingItems";
import { RankingItemWithDelta } from "@/hooks/useRankingData";

interface UserRankingData {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  is_public: boolean;
  user_id: string;
  profiles: {
    username: string;
  } | null;
  user_ranking_items: Array<{
    id: string;
    position: number;
    reason: string | null;
    is_ranked: boolean;
    rapper: {
      id: string;
      name: string;
      real_name: string | null;
      origin: string | null;
      slug?: string | null;
      total_votes: number | null;
    };
  }>;
}

interface UserRankingDetailProps {
  overrideSlug?: string;
}

const UserRankingDetail = ({ overrideSlug }: UserRankingDetailProps) => {
  const { slug: paramSlug } = useParams();
  const slug = overrideSlug || paramSlug;
  const { user } = useAuth();
  const [ranking, setRanking] = useState<UserRankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState<number>(0);
  const [voteCount, setVoteCount] = useState<number>(0);
  const [displayCount, setDisplayCount] = useState(20);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track page view
  usePageViewTracking({
    contentType: 'ranking',
    contentId: ranking?.id,
    debounceMs: 1000
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (slug) {
      fetchUserRanking();
    }
  }, [slug, user]);

  const fetchUserRanking = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("user_rankings")
        .select(`
          id,
          title,
          description,
          category,
          created_at,
          is_public,
          user_id,
          views_count,
          profiles!inner(username),
          user_ranking_items!inner(
            id,
            position,
            reason,
            is_ranked,
            rapper:rappers!inner(
              id,
              name,
              real_name,
              origin,
              slug,
              total_votes
            )
          )
        `)
        .eq("slug", slug)
        .single();

      if (fetchError) {
        console.error("Error fetching user ranking:", fetchError);
        
        if (fetchError.code === 'PGRST116') {
          setError("Ranking not found or you don't have permission to view it.");
        } else {
          setError("Failed to load ranking. Please try again later.");
        }
        return;
      }

      if (!data) {
        setError("Ranking not found.");
        return;
      }

      // Check if user can access this ranking
      if (!data.is_public && (!user || user.id !== data.user_id)) {
        setError("This ranking is private and you don't have permission to view it.");
        return;
      }

      // Fetch vote counts from materialized view
      const { data: voteCounts } = await supabase
        .from('user_ranking_vote_counts')
        .select('rapper_id, total_vote_weight')
        .eq('user_ranking_id', data.id);
      
      // Create a map for quick vote count lookups
      const voteCountMap = new Map(
        (voteCounts || []).map(vc => [vc.rapper_id, vc.total_vote_weight])
      );
      
      // Store vote count map on the data object for use in transformation
      (data as any).voteCountMap = voteCountMap;
      
      setRanking(data);
      
      // Fetch view count (cached in the table)
      const viewsCount = (data as any).views_count || 0;
      setViewCount(viewsCount);
      
      // Fetch total votes using RPC
      const { data: totalVotes } = await supabase
        .rpc('get_user_ranking_vote_count', { ranking_uuid: data.id });
      setVoteCount(totalVotes || 0);
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
        <div className="text-rap-gold font-mogra text-xl">Loading ranking...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
        <HeaderNavigation isScrolled={false} />
        <div className="max-w-4xl mx-auto pt-20 px-4">
          <div className="mb-8">
            <Link to="/rankings" className="flex items-center space-x-2 text-rap-gold hover:text-rap-gold-light transition-colors font-kaushan">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Rankings</span>
            </Link>
          </div>
          
          <Alert className="bg-red-900/20 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200 font-merienda">
              {error}
            </AlertDescription>
          </Alert>

          {error.includes("permission") && !user && (
            <div className="mt-6 text-center">
              <p className="text-rap-smoke font-merienda mb-4">
                This content may require you to be logged in.
              </p>
              <Link 
                to="/auth" 
                className="text-rap-gold hover:text-rap-gold-light font-kaushan underline"
              >
                Sign in to continue
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!ranking) {
    return <Navigate to="/rankings" replace />;
  }

  const sortedItems = ranking.user_ranking_items.sort((a, b) => a.position - b.position);
  const isOwner = user && user.id === ranking.user_id;

  // Get vote count map from ranking data
  const voteCountMap = (ranking as any).voteCountMap || new Map();

  // Transform user ranking items to match RankingItemWithDelta interface
  const rankingItems: RankingItemWithDelta[] = sortedItems.map((item, index) => ({
    id: item.id,
    position: item.position,
    reason: item.reason,
    is_ranked: item.is_ranked,
    vote_velocity_7_days: 0,
    vote_velocity_24_hours: 0,
    rapper: {
      id: item.rapper.id,
      name: item.rapper.name,
      origin: item.rapper.origin,
      total_votes: item.rapper.total_votes,
      slug: item.rapper.slug
    },
    position_delta: 0,
    ranking_votes: voteCountMap.get(item.rapper.id) || 0,
    dynamic_position: item.position,
    visual_rank: item.position,
    display_index: index + 1 // Track display order for premium styling
  }));

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 20);
  };

  const hasMore = displayCount < rankingItems.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <HeaderNavigation isScrolled={isScrolled} />
      
      <div className="max-w-6xl mx-auto pt-20 px-4">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link to="/rankings" className="flex items-center space-x-2 text-rap-gold hover:text-rap-gold-light transition-colors font-kaushan">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Rankings</span>
          </Link>
        </div>

        {/* Ranking Header */}
        <Card className="bg-black border-rap-burgundy/40 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-rap-burgundy/20 text-rap-burgundy border-rap-burgundy/30 font-kaushan">
                <Users className="w-3 h-3 mr-1" />
                Community
              </Badge>
              {!ranking.is_public && (
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-kaushan">
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </Badge>
              )}
              <Badge variant="secondary" className="bg-rap-forest/20 text-rap-forest border-rap-forest/30 font-kaushan">
                {ranking.category}
              </Badge>
            </div>
            
            <h1 className="text-4xl font-bold text-rap-platinum mb-4 font-mogra">
              {ranking.title}
            </h1>
            
            {ranking.description && (
              <p className="text-rap-smoke text-lg mb-6 font-kaushan leading-relaxed">
                {ranking.description}
              </p>
            )}
            
            <div className="border-t border-rap-smoke/20 pt-6">
              {/* Author and Date Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 mb-4 sm:mb-0">
                <span className="font-kaushan text-sm sm:text-base">
                  by {user ? (
                    <Link 
                      to={`/user/${ranking.profiles?.username || "unknown"}`}
                      className="text-rap-gold hover:text-rap-gold-light transition-colors hover:underline"
                    >
                      {ranking.profiles?.username || "Unknown User"}
                    </Link>
                  ) : (
                    <span className="text-rap-gold">{ranking.profiles?.username || "Unknown User"}</span>
                  )}
                  {isOwner && <span className="text-rap-smoke ml-2">(You)</span>}
                </span>
                <span className="font-kaushan text-sm sm:text-base text-rap-smoke/80">
                  {new Date(ranking.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {/* Stats Row */}
              <div className="flex items-center gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-rap-smoke/10 sm:border-t-0">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-rap-smoke/70" />
                  <span className="font-kaushan text-sm">{viewCount.toLocaleString()}</span>
                  <span className="text-xs text-rap-smoke/60">views</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-rap-gold" />
                  <span className="font-kaushan text-sm">{voteCount.toLocaleString()}</span>
                  <span className="text-xs text-rap-smoke/60">votes</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ranking Items with Voting */}
        <OfficialRankingItems
          items={rankingItems}
          onVote={() => {}} // VoteButton handles everything internally
          userLoggedIn={!!user}
          hotThreshold={0} // No hot threshold for community rankings
          displayCount={displayCount}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loading={false}
          userRankingId={ranking.id}
        />
      </div>

      {/* Footer - positioned at the bottom of all page content */}
      <Footer />
    </div>
  );
};

export default UserRankingDetail;
