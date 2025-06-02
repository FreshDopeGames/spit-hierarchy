import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Star, Users, Calendar, Eye, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import CommentBubble from "@/components/CommentBubble";
import VoteButton from "@/components/VoteButton";
import HotBadge from "@/components/analytics/HotBadge";
import BillboardAd from "@/components/BillboardAd";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

type Rapper = Tables<"rappers">;
type OfficialRanking = Tables<"official_rankings">;
type OfficialRankingItem = Tables<"official_ranking_items"> & {
  rapper: Rapper;
};

const OfficialRankingDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [ranking, setRanking] = useState<OfficialRanking | null>(null);
  const [officialItems, setOfficialItems] = useState<OfficialRankingItem[]>([]);
  const [allRappers, setAllRappers] = useState<Rapper[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    if (slug) {
      fetchRankingData();
    }
  }, [slug]);

  const fetchRankingData = async () => {
    try {
      // Fetch the ranking details
      const { data: rankingData, error: rankingError } = await supabase
        .from("official_rankings")
        .select("*")
        .eq("slug", slug)
        .single();

      if (rankingError) throw rankingError;
      setRanking(rankingData);

      // Fetch official ranking items with rapper details
      const { data: itemsData, error: itemsError } = await supabase
        .from("official_ranking_items")
        .select(`
          *,
          rapper:rappers(*)
        `)
        .eq("ranking_id", rankingData.id)
        .order("position");

      if (itemsError) throw itemsError;
      setOfficialItems(itemsData || []);

      // Fetch first batch of all rappers (excluding those in official ranking)
      const validRapperIds = (itemsData || [])
        .map(item => item.rapper_id)
        .filter(id => id !== null && id !== undefined) as string[];
      
      await fetchMoreRappers(0, validRapperIds);
    } catch (error) {
      console.error("Error fetching ranking data:", error);
      toast({
        title: "Error",
        description: "Failed to load ranking data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreRappers = async (pageNum: number, excludeIds: string[] = []) => {
    setLoadingMore(true);
    try {
      const from = pageNum * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("rappers")
        .select("*")
        .order("average_rating", { ascending: false })
        .range(from, to);

      // Only add the exclusion filter if we have valid UUIDs to exclude
      if (excludeIds.length > 0) {
        query = query.not("id", "in", `(${excludeIds.join(",")})`);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (pageNum === 0) {
        setAllRappers(data || []);
      } else {
        setAllRappers(prev => [...prev, ...(data || [])]);
      }

      setHasMore((data || []).length === ITEMS_PER_PAGE);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching rappers:", error);
      toast({
        title: "Error",
        description: "Failed to load additional rappers.",
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const validExcludeIds = officialItems
        .map(item => item.rapper_id)
        .filter(id => id !== null && id !== undefined) as string[];
      fetchMoreRappers(page + 1, validExcludeIds);
    }
  };

  const handleVote = (rapperName: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote for rappers.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Vote submitted!",
      description: `Your vote for ${rapperName} has been recorded.`,
    });
  };

  const handleVoteWithNote = (rapperName: string, note: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote for rappers.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Vote with note submitted!",
      description: `Your vote for ${rapperName} with note has been recorded.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
        <div className="text-rap-gold font-mogra text-xl">Loading...</div>
      </div>
    );
  }

  if (!ranking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
        <div className="text-rap-platinum font-mogra text-xl">Ranking not found</div>
      </div>
    );
  }

  const shouldShowAd = (index: number) => (index + 1) % 50 === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      {/* Header */}
      <header className="bg-carbon-fiber/90 border-b border-rap-gold/30 p-4 shadow-lg shadow-rap-gold/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/official-rankings">
            <Button
              variant="ghost"
              className="text-rap-gold hover:text-rap-gold-light font-kaushan"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Official Rankings
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30 font-kaushan">
              <Award className="w-3 h-3 mr-1" />
              Official
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Ranking Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="bg-rap-burgundy/20 text-rap-platinum border-rap-burgundy/30 font-kaushan">
              {ranking.category}
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-rap-platinum mb-4 leading-tight font-ceviche">
            {ranking.title}
          </h1>
          
          <p className="text-xl text-rap-smoke mb-6 leading-relaxed font-kaushan">
            {ranking.description}
          </p>
        </div>

        {/* Official Ranking Items */}
        {officialItems.length > 0 && (
          <Card className="bg-carbon-fiber border-rap-gold/40 mb-8 shadow-2xl shadow-rap-gold/20">
            <CardHeader>
              <CardTitle className="text-rap-gold flex items-center gap-2 font-mogra">
                <Trophy className="w-5 h-5" />
                Official Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {officialItems.map((item) => {
                const isHot = item.position <= 2;
                const voteVelocity = isHot ? Math.floor(Math.random() * 15) + 5 : 0;
                
                return (
                  <div 
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-rap-carbon/30 rounded-lg hover:bg-rap-carbon/50 transition-colors relative border border-rap-gold/20"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-rap-gold to-rap-burgundy rounded-full flex items-center justify-center">
                      <span className="text-rap-carbon font-bold text-lg font-mogra">#{item.position}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-rap-platinum font-semibold text-lg font-mogra">{item.rapper?.name}</h3>
                        {isHot && (
                          <HotBadge isHot={isHot} voteVelocity={voteVelocity} variant="compact" />
                        )}
                      </div>
                      <p className="text-rap-smoke font-kaushan">{item.reason}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <VoteButton
                        onVote={() => handleVote(item.rapper?.name || "")}
                        onVoteWithNote={(note) => handleVoteWithNote(item.rapper?.name || "", note)}
                        disabled={!user}
                      />
                      <Link to={`/rapper/${item.rapper?.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rap-gold hover:text-rap-gold-light font-kaushan"
                        >
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* All Other Rappers */}
        <Card className="bg-carbon-fiber border-rap-silver/40 shadow-2xl shadow-rap-silver/20">
          <CardHeader>
            <CardTitle className="text-rap-silver flex items-center gap-2 font-mogra">
              <Star className="w-5 h-5" />
              All Rappers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allRappers.map((rapper, index) => {
              const globalIndex = officialItems.length + index + 1;
              
              return (
                <div key={rapper.id}>
                  <div className="flex items-center gap-4 p-4 bg-rap-carbon/30 rounded-lg hover:bg-rap-carbon/50 transition-colors relative">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-rap-silver to-rap-platinum rounded-full flex items-center justify-center">
                      <span className="text-rap-carbon font-bold text-lg font-mogra">#{globalIndex}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-rap-platinum font-semibold text-lg font-mogra">{rapper.name}</h3>
                      </div>
                      <p className="text-rap-smoke font-kaushan">{rapper.real_name} • {rapper.origin}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-4 h-4 text-rap-gold" />
                        <span className="text-rap-platinum font-kaushan text-sm">
                          {rapper.average_rating ? parseFloat(rapper.average_rating.toString()).toFixed(1) : "0.0"}
                        </span>
                        <span className="text-rap-smoke font-kaushan text-sm">
                          ({rapper.total_votes || 0} votes)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <VoteButton
                        onVote={() => handleVote(rapper.name)}
                        onVoteWithNote={(note) => handleVoteWithNote(rapper.name, note)}
                        disabled={!user}
                      />
                      <Link to={`/rapper/${rapper.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rap-silver hover:text-rap-platinum font-kaushan"
                        >
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Show billboard ad after every 50 rappers */}
                  {shouldShowAd(index + 1) && (
                    <div className="my-6">
                      <BillboardAd />
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-6">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra shadow-xl shadow-rap-gold/40 border border-rap-gold/30"
                >
                  {loadingMore ? "Loading..." : "Load More Rappers"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Comment Bubble */}
      <CommentBubble contentType="ranking" contentId={ranking.id} />
    </div>
  );
};

export default OfficialRankingDetail;
