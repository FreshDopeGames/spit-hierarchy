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

      // First, find the user ID by username using our secure function
      const { data: userLookup, error: lookupError } = await supabase
        .rpc('find_user_by_username', { search_username: username });
      
      if (lookupError || !userLookup || userLookup.length === 0) {
        console.error("Error finding user by username:", lookupError);
        setNotFound(true);
        return;
      }
      
      const userId = userLookup[0].id;
      
      // Now get the full public profile data using our new secure function
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_public_profile_full', { profile_user_id: userId })
        .single();

      if (profileError || !profileData) {
        console.error("Error fetching profile:", profileError);
        setNotFound(true);
        return;
      }
      
      setProfile({
        id: profileData.id,
        username: profileData.username,
        avatar_url: profileData.avatar_url,
        bio: profileData.bio,
        created_at: profileData.created_at,
        member_stats: profileData.member_stats as {
          total_votes: number;
          status: string;
          consecutive_voting_days: number;
          total_comments: number;
          ranking_lists_created: number;
          top_five_created: number;
        }
      });

      // Fetch user's public rankings
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
              .rpc('get_user_ranking_preview_items', { 
                ranking_uuid: ranking.id, 
                item_limit: 10 
              });

            const simpleItems: SimpleRankingItem[] = (items || []).map(item => ({
              position: item.item_position,
              reason: item.reason,
              rapper_name: item.rapper_name
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