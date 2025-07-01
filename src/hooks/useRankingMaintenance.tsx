
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRankingMaintenance = () => {
  const recalculatePositions = useMutation({
    mutationFn: async (rankingId?: string) => {
      const { error } = await supabase.rpc('recalculate_ranking_positions', {
        target_ranking_id: rankingId || null
      });
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success("Ranking positions recalculated successfully!");
    },
    onError: (error) => {
      console.error("Error recalculating positions:", error);
      toast.error("Failed to recalculate ranking positions");
    }
  });

  const populateMissingRappers = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('populate_all_rankings_with_missing_rappers');
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success("Missing rappers populated successfully!");
    },
    onError: (error) => {
      console.error("Error populating missing rappers:", error);
      toast.error("Failed to populate missing rappers");
    }
  });

  const runFullMaintenance = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('daily_ranking_maintenance');
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success("Full ranking maintenance completed successfully!");
    },
    onError: (error) => {
      console.error("Error running full maintenance:", error);
      toast.error("Failed to run full maintenance");
    }
  });

  return {
    recalculatePositions,
    populateMissingRappers,
    runFullMaintenance
  };
};
