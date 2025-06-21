
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { RankingFormData } from "./rankingFormSchema";

type OfficialRanking = Tables<"official_rankings">;

interface UseRankingSubmissionProps {
  ranking?: OfficialRanking;
  onRankingCreated: () => void;
  form: UseFormReturn<RankingFormData>;
  setOpen: (open: boolean) => void;
}

export const useRankingSubmission = ({
  ranking,
  onRankingCreated,
  form,
  setOpen
}: UseRankingSubmissionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (values: RankingFormData) => {
    setIsLoading(true);
    try {
      if (ranking) {
        // Update existing ranking - ensure all required fields are present
        const updateData = {
          title: values.title,
          description: values.description || "",
          category: values.category,
          slug: values.slug
        };
        const { error } = await supabase
          .from("official_rankings")
          .update(updateData)
          .eq("id", ranking.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Ranking updated successfully"
        });
      } else {
        // Create new ranking - ensure all required fields are present
        const insertData = {
          title: values.title,
          description: values.description || "",
          category: values.category,
          slug: values.slug
        };
        const { data: newRanking, error } = await supabase
          .from("official_rankings")
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;

        // Automatically populate the new ranking with all rappers
        if (newRanking) {
          const { error: populateError } = await supabase.rpc("populate_ranking_with_all_rappers", {
            ranking_uuid: newRanking.id
          });

          if (populateError) {
            console.error("Error populating ranking with rappers:", populateError);
            toast({
              title: "Warning",
              description: "Ranking created but failed to populate with rappers. You can add them manually.",
              variant: "destructive"
            });
          }
        }

        toast({
          title: "Success",
          description: "Ranking created successfully and populated with all rappers"
        });
      }

      setOpen(false);
      form.reset();
      onRankingCreated();
    } catch (error) {
      console.error("Error saving ranking:", error);
      toast({
        title: "Error",
        description: "Failed to save ranking",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { onSubmit, isLoading };
};
