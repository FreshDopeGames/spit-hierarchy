
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PublicProfile, RankingWithItems, SimpleRankingItem } from "@/types/publicProfile";

export const usePublicUserData = () => {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [rankings, setRankings] = useState<RankingWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchUserData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setNotFound(false);

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
  }, []);

  return {
    profile,
    rankings,
    loading,
    notFound,
    fetchUserData
  };
};
