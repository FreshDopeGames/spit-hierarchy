import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const ActivityToastProvider = () => {
  const { user } = useAuth();
  const lastToastTime = useRef<number>(0);
  const THROTTLE_MS = 5000; // 5 seconds

  useEffect(() => {
    // Subscribe to ranking votes
    const rankingVotesChannel = supabase
      .channel('ranking-votes-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ranking_votes'
        },
        async (payload) => {
          const vote = payload.new as any;
          
          // Don't show own votes
          if (user?.id === vote.user_id) return;
          
          // Throttle toasts
          const now = Date.now();
          if (now - lastToastTime.current < THROTTLE_MS) return;
          lastToastTime.current = now;

          try {
            // Fetch user profile
            const { data: profile } = await supabase
              .rpc('get_profiles_for_analytics', { 
                profile_user_ids: [vote.user_id] 
              });

            // Fetch rapper name
            const { data: rapper } = await supabase
              .from('rappers')
              .select('name')
              .eq('id', vote.rapper_id)
              .single();

            // Fetch ranking name
            const { data: ranking } = await supabase
              .from('official_rankings')
              .select('title')
              .eq('id', vote.ranking_id)
              .single();

            const username = profile?.[0]?.username || 'Someone';
            const rapperName = rapper?.name || 'a rapper';
            const rankingName = ranking?.title || 'a ranking';

            toast.info(`🔥 ${username} just voted for ${rapperName} in ${rankingName}!`, {
              duration: 4000,
            });
          } catch (error) {
            console.error('Error showing ranking vote toast:', error);
          }
        }
      )
      .subscribe();

    // Subscribe to skill votes
    const skillVotesChannel = supabase
      .channel('skill-votes-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes'
        },
        async (payload) => {
          const vote = payload.new as any;
          
          // Don't show own votes
          if (user?.id === vote.user_id) return;
          
          // Throttle toasts
          const now = Date.now();
          if (now - lastToastTime.current < THROTTLE_MS) return;
          lastToastTime.current = now;

          try {
            // Fetch user profile
            const { data: profile } = await supabase
              .rpc('get_profiles_for_analytics', { 
                profile_user_ids: [vote.user_id] 
              });

            // Fetch rapper name
            const { data: rapper } = await supabase
              .from('rappers')
              .select('name')
              .eq('id', vote.rapper_id)
              .single();

            // Fetch category name
            const { data: category } = await supabase
              .from('voting_categories')
              .select('name')
              .eq('id', vote.category_id)
              .single();

            const username = profile?.[0]?.username || 'Someone';
            const rapperName = rapper?.name || 'a rapper';
            const categoryName = category?.name || 'a skill';

            toast.info(`⭐ ${username} just rated ${rapperName}'s ${categoryName}!`, {
              duration: 4000,
            });
          } catch (error) {
            console.error('Error showing skill vote toast:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(rankingVotesChannel);
      supabase.removeChannel(skillVotesChannel);
    };
  }, [user?.id]);

  return null;
};

export default ActivityToastProvider;
