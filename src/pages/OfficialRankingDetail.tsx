
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import CommentBubble from "@/components/CommentBubble";
import HeaderNavigation from "@/components/HeaderNavigation";
import OfficialRankingHeader from "@/components/rankings/OfficialRankingHeader";
import OfficialRankingItems from "@/components/rankings/OfficialRankingItems";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

type Rapper = Tables<"rappers">;
type OfficialRanking = Tables<"official_rankings">;
type RankingItem = Tables<"ranking_items"> & {
  rapper: Rapper;
};

const OfficialRankingDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [ranking, setRanking] = useState<OfficialRanking | null>(null);
  const [rankingItems, setRankingItems] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllRappers, setShowAllRappers] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

      // Fetch all ranking items with rapper details
      const { data: itemsData, error: itemsError } = await supabase
        .from("ranking_items")
        .select(`
          *,
          rapper:rappers(*)
        `)
        .eq("ranking_id", rankingData.id)
        .order("position");

      if (itemsError) throw itemsError;
      setRankingItems(itemsData || []);
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
        <HeaderNavigation isScrolled={isScrolled} />
        <div className="text-rap-gold font-mogra text-xl pt-24">Loading...</div>
      </div>
    );
  }

  if (!ranking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
        <HeaderNavigation isScrolled={isScrolled} />
        <div className="text-rap-platinum font-mogra text-xl pt-24">Ranking not found</div>
      </div>
    );
  }

  const rankedItems = rankingItems.filter(item => item.is_ranked);
  const unrankedItems = rankingItems.filter(item => !item.is_ranked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <HeaderNavigation isScrolled={isScrolled} />
      
      <main className="max-w-4xl mx-auto p-6 pt-24">
        <OfficialRankingHeader
          title={ranking.title}
          description={ranking.description}
          category={ranking.category}
        />

        {/* Editorial Rankings - Always show these */}
        <OfficialRankingItems
          items={rankedItems}
          onVote={handleVote}
          onVoteWithNote={handleVoteWithNote}
          userLoggedIn={!!user}
          showAll={false}
          maxItems={20}
        />

        {/* Toggle for showing all rappers */}
        {unrankedItems.length > 0 && (
          <div className="mb-6 text-center">
            <Button
              onClick={() => setShowAllRappers(!showAllRappers)}
              variant="outline"
              className="border-rap-silver/30 text-rap-silver hover:bg-rap-silver/20 font-kaushan"
            >
              {showAllRappers 
                ? `Hide remaining ${unrankedItems.length} rappers` 
                : `Show all ${unrankedItems.length} remaining rappers`
              }
            </Button>
          </div>
        )}

        {/* All remaining rappers */}
        {showAllRappers && unrankedItems.length > 0 && (
          <OfficialRankingItems
            items={unrankedItems}
            onVote={handleVote}
            onVoteWithNote={handleVoteWithNote}
            userLoggedIn={!!user}
            showAll={true}
          />
        )}
      </main>

      <CommentBubble contentType="ranking" contentId={ranking.id} />
    </div>
  );
};

export default OfficialRankingDetail;
