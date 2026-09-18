import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRapperRatingCount = (rapperId: string) => {
  return useQuery({
    queryKey: ["rapper-rating-count", rapperId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_rapper_rating_count", { p_rapper_id: rapperId });

      if (error) throw error;

      return Number(data) || 0;
    },
    enabled: !!rapperId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
