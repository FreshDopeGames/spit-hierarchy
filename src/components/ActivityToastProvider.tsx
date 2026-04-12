import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

const ActivityToastProvider = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const lastToastTime = useRef<number>(0);
  const THROTTLE_MS = 5000;

  const persistNotification = async (
    type: string,
    title: string,
    message: string,
    linkUrl?: string
  ) => {
    if (!user?.id) return;

    try {
      // Dedup: skip if same title exists within last 30s
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', title)
        .gte('created_at', thirtySecondsAgo)
        .limit(1);

      if (existing && existing.length > 0) return;

      await supabase.from('notifications').insert({
        user_id: user.id,
        type,
        title,
        message,
        link_url: linkUrl || null,
      });

      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (error) {
      console.error('Error persisting activity notification:', error);
    }
  };

  useEffect(() => {
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
          if (user?.id === vote.user_id) return;

          const now = Date.now();
          if (now - lastToastTime.current < THROTTLE_MS) return;
          lastToastTime.current = now;

          try {
            const { data: profile } = await supabase
              .rpc('get_profiles_for_analytics', {
                profile_user_ids: [vote.user_id]
              });

            const { data: rapper } = await supabase
              .from('rappers')
              .select('name')
              .eq('id', vote.rapper_id)
              .single();

            const { data: ranking } = await supabase
              .from('official_rankings')
              .select('title, slug')
              .eq('id', vote.ranking_id)
              .single();

            const username = profile?.[0]?.username || 'Someone';
            const rapperName = rapper?.name || 'a rapper';
            const rankingName = ranking?.title || 'a ranking';

            const toastTitle = `🔥 ${username} just voted for ${rapperName} in ${rankingName}!`;

            toast.info(toastTitle, { duration: 4000 });

            await persistNotification(
              'ranking_vote',
              toastTitle,
              `${username} voted for ${rapperName}`,
              ranking?.slug ? `/rankings/${ranking.slug}` : undefined
            );
          } catch (error) {
            console.error('Error showing ranking vote toast:', error);
          }
        }
      )
      .subscribe();

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
          if (user?.id === vote.user_id) return;

          const now = Date.now();
          if (now - lastToastTime.current < THROTTLE_MS) return;
          lastToastTime.current = now;

          try {
            const { data: profile } = await supabase
              .rpc('get_profiles_for_analytics', {
                profile_user_ids: [vote.user_id]
              });

            const { data: rapper } = await supabase
              .from('rappers')
              .select('name, slug')
              .eq('id', vote.rapper_id)
              .single();

            const { data: category } = await supabase
              .from('voting_categories')
              .select('name')
              .eq('id', vote.category_id)
              .single();

            const username = profile?.[0]?.username || 'Someone';
            const rapperName = rapper?.name || 'a rapper';
            const categoryName = category?.name || 'a skill';

            const toastTitle = `⭐ ${username} just rated ${rapperName}'s ${categoryName}!`;

            toast.info(toastTitle, { duration: 4000 });

            await persistNotification(
              'skill_vote',
              toastTitle,
              `${username} rated ${rapperName}'s ${categoryName}`,
              rapper?.slug ? `/rappers/${rapper.slug}` : undefined
            );
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
