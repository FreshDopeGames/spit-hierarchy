import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useCanSuggestRappers = () => {
  const { user } = useAuth();

  const { data: canSuggest = false, isLoading } = useQuery({
    queryKey: ["can-suggest-rappers", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      // Check if user has a member_stats record (meaning they're a member)
      const { data, error } = await supabase
        .from("member_stats")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking member status:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!user?.id,
  });

  return { canSuggest, isLoading };
};
