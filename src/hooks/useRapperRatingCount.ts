import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRapperRatingCount = (rapperId: string) => {
  return useQuery({
    queryKey: ["rapper-rating-count", rapperId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("votes")
        .select("user_id")
        .eq("rapper_id", rapperId)
        .not("user_id", "is", null);

      if (error) throw error;

      // Count unique users who rated this rapper
      const uniqueUsers = new Set(data?.map((v) => v.user_id) || []);
      return uniqueUsers.size;
    },
    enabled: !!rapperId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
