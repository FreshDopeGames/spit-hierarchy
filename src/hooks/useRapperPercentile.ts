
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRapperPercentile = (rapperId: string) => {
  return useQuery({
    queryKey: ["rapper-percentile", rapperId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("calculate_rapper_percentile", { rapper_uuid: rapperId });

      if (error) throw error;
      return data as number | null;
    },
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });
};
