
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

      // First, find the user ID by username using the secure function
      // Since we can't query profiles by username directly anymore, 
      // we need to find the user through a different approach
      
      // For now, we'll need to use a different strategy since the RLS policies
      // prevent direct username lookups. We'll create a public function for this.
      const { data: userLookup, error: lookupError } = await supabase
        .rpc('find_user_by_username' as any, { search_username: username }) as { data: any, error: any };
      
      if (lookupError || !userLookup || !Array.isArray(userLookup) || userLookup.length === 0) {
        console.error("Error finding user by username:", lookupError);
        setNotFound(true);
        return;
      }
      
      const userId = userLookup[0].id;
      
      // Now get the public profile data using our secure function
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_public_profile', { user_uuid: userId });

      if (profileError || !profileData || profileData.length === 0) {
        console.error("Error fetching profile:", profileError);
        setNotFound(true);
        return;
      }
      
      const profileInfo = profileData[0];

      // Fetch member stats separately with better error handling
      const { data: memberStatsData, error: memberStatsError } = await supabase
        .from("member_stats")
        .select("total_votes, status, consecutive_voting_days")
        .eq("id", userId)
        .single();

      if (memberStatsError) {
        console.log("Member stats not found for user, using defaults");
      }

      setProfile({
        ...profileInfo,
        id: userId,
        location: null, // Not included in public profile for security
        member_stats: memberStatsError ? null : memberStatsData
      });

      // Fetch user's public rankings with enhanced data
      const { data: rankingsData, error: rankingsError } = await supabase
        .from("user_rankings")
        .select("id, title, description, category, created_at, slug")
        .eq("user_id", userId)
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
