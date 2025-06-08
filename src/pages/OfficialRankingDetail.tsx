
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import CommentBubble from "@/components/CommentBubble";
import HeaderNavigation from "@/components/HeaderNavigation";
import OfficialRankingHeader from "@/components/rankings/OfficialRankingHeader";
import OfficialRankingItems from "@/components/rankings/OfficialRankingItems";
import AllRappersSection from "@/components/rankings/AllRappersSection";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const ITEMS_PER_PAGE = 50;

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
          items={officialItems}
          onVote={handleVote}
          onVoteWithNote={handleVoteWithNote}
          userLoggedIn={!!user}
        />

        <AllRappersSection
          rappers={allRappers}
          officialItemsCount={officialItems.length}
          onVote={handleVote}
          onVoteWithNote={handleVoteWithNote}
          userLoggedIn={!!user}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      </main>

      <CommentBubble contentType="ranking" contentId={ranking.id} />
    </div>
  );
};

export default OfficialRankingDetail;
