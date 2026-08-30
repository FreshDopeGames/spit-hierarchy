import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RapperMediaMention {
  id: string;
  title: string;
  url: string;
  source: string;
  published_at: string;
}

export const useRapperMediaMentions = (rapperId: string | undefined) => {
  return useQuery({
    queryKey: ["rapper-media-mentions", rapperId],
    queryFn: async (): Promise<RapperMediaMention[]> => {
      if (!rapperId) return [];
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from("rapper_media_mentions")
        .select("id, title, url, source, published_at")
        .eq("rapper_id", rapperId)
        .gte("published_at", cutoff)
        .order("published_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!rapperId,
    staleTime: 15 * 60 * 1000,
  });
};
