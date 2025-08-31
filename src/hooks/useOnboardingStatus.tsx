import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useOnboardingStatus = () => {
  const { user } = useAuth();

  const { data: memberStats, isLoading } = useQuery({
    queryKey: ["member-stats-onboarding", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("member_stats")
        .select("top_five_created")
        .eq("id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const needsOnboarding = memberStats ? memberStats.top_five_created === 0 : false;
  
  return {
    needsOnboarding,
    isLoading,
    memberStats
  };
};