
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
import { useRankingData, useHotThreshold } from "@/hooks/useRankingData";

type OfficialRanking = Tables<"official_rankings">;

const ITEMS_PER_PAGE = 20;

const OfficialRankingDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [ranking, setRanking] = useState<OfficialRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
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
      const { data: rankingData, error: rankingError } = await supabase
        .from("official_rankings")
        .select("*")
        .eq("slug", slug)
        .single();

      if (rankingError) throw rankingError;
      setRanking(rankingData);
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

  const { data: rankingItems = [], isLoading: itemsLoading } = useRankingData(ranking?.id || "");
  const hotThreshold = useHotThreshold(rankingItems);

  const handleVote = (rapperName: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote for rappers.",
        variant: "destructive",
      });
      return;
    }

    // This is now handled by the weighted voting system in VoteButton
    toast({
      title: "Vote submitted!",
      description: `Your vote for ${rapperName} has been recorded.`,
    });
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

  if (loading || itemsLoading) {
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

  const hasMore = displayCount < rankingItems.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <HeaderNavigation isScrolled={isScrolled} />
      
      <main className="max-w-4xl mx-auto p-6 pt-24">
        <OfficialRankingHeader
          title={ranking.title}
          description={ranking.description}
          category={ranking.category}
        />

        <OfficialRankingItems
          items={rankingItems}
          onVote={handleVote}
          userLoggedIn={!!user}
          hotThreshold={hotThreshold}
          displayCount={displayCount}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loading={false}
          rankingId={ranking.id}
        />
      </main>

      <CommentBubble contentType="ranking" contentId={ranking.id} />
    </div>
  );
};

export default OfficialRankingDetail;
