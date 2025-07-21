
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PublicProfile, RankingWithItems, SimpleRankingItem } from "@/types/publicProfile";

export const usePublicUserData = () => {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [rankings, setRankings] = useState<RankingWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchUserData = useCallback(async (username: string) => {
    try {
      setLoading(true);
      setNotFound(false);

      // Fetch user profile by username with enhanced error handling
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, full_name, created_at, bio, location, avatar_url")
        .eq("username", username)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setNotFound(true);
        return;
      }

      // Fetch member stats separately with better error handling
      const { data: memberStatsData, error: memberStatsError } = await supabase
        .from("member_stats")
        .select("total_votes, status, consecutive_voting_days")
        .eq("id", profileData.id)
        .single();

      if (memberStatsError) {
        console.log("Member stats not found for user, using defaults");
      }

      setProfile({
        ...profileData,
        member_stats: memberStatsError ? null : memberStatsData
      });

      // Fetch user's public rankings with enhanced data
      const { data: rankingsData, error: rankingsError } = await supabase
        .from("user_rankings")
        .select("id, title, description, category, created_at, slug")
        .eq("user_id", profileData.id)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (rankingsError) {
        console.error("Error fetching rankings:", rankingsError);
        setRankings([]);
      } else if (rankingsData) {
        // Fetch ranking items with enhanced rapper data
        const rankingsWithItems: RankingWithItems[] = await Promise.all(
          rankingsData.map(async (ranking) => {
            const { data: items } = await supabase
              .from("user_ranking_items")
              .select(`
                position,
                reason,
                rapper:rappers!inner(name, real_name, origin)
              `)
              .eq("ranking_id", ranking.id)
              .order("position");

            const simpleItems: SimpleRankingItem[] = (items || []).map(item => ({
              position: item.position,
              reason: item.reason,
              rapper_name: (item.rapper as { name: string; real_name?: string; origin?: string }).name
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
