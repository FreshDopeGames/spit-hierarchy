
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { RankingFormData } from "./rankingFormSchema";

type OfficialRanking = Tables<"official_rankings">;

interface UseRankingSubmissionProps {
  ranking?: OfficialRanking;
  onRankingCreated: () => void;
  form: UseFormReturn<RankingFormData>;
  setOpen: (open: boolean) => void;
  selectedTags: string[];
}

export const useRankingSubmission = ({
  ranking,
  onRankingCreated,
  form,
  setOpen,
  selectedTags
}: UseRankingSubmissionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (values: RankingFormData) => {
    setIsLoading(true);
    try {
      if (ranking) {
        // Update existing ranking
        const updateData = {
          title: values.title,
          description: values.description || "",
          category: values.category,
          slug: values.slug,
          display_order: values.display_order || 0,
          filter_criteria: values.filter_criteria || {}
        };
        const { error } = await supabase
          .from("official_rankings")
          .update(updateData)
          .eq("id", ranking.id);

        if (error) throw error;

        // Re-populate ranking with new filters if criteria changed
        if (values.filter_criteria) {
          const { error: populateError } = await supabase.rpc("populate_ranking_with_rappers", {
            ranking_uuid: ranking.id,
            filter_criteria: values.filter_criteria
          });

          if (populateError) {
            console.error("Error re-populating ranking:", populateError);
            toast.error("Ranking updated but failed to apply filters.");
          }
        }

        // Update tag assignments
        await updateTagAssignments(ranking.id, selectedTags);

        toast.success("Ranking updated successfully");
      } else {
        // Create new ranking
        const insertData = {
          title: values.title,
          description: values.description || "",
          category: values.category,
          slug: values.slug,
          display_order: values.display_order || 0,
          filter_criteria: values.filter_criteria || {}
        };
        const { data: newRanking, error } = await supabase
          .from("official_rankings")
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;

        // Add tag assignments for new ranking
        if (newRanking && selectedTags.length > 0) {
          await updateTagAssignments(newRanking.id, selectedTags);
        }

        // Populate the new ranking with filtered rappers
        if (newRanking) {
          const { error: populateError } = await supabase.rpc("populate_ranking_with_rappers", {
            ranking_uuid: newRanking.id,
            filter_criteria: values.filter_criteria || {}
          });

          if (populateError) {
            console.error("Error populating ranking with rappers:", populateError);
            toast.error("Ranking created but failed to populate with rappers. You can add them manually.");
          }
        }

        toast.success("Ranking created successfully with filters applied");
      }

      setOpen(false);
      form.reset();
      onRankingCreated();
    } catch (error) {
      console.error("Error saving ranking:", error);
      toast.error("Failed to save ranking");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTagAssignments = async (rankingId: string, tagIds: string[]) => {
    // Remove existing tag assignments
    const { error: deleteError } = await supabase
      .from("ranking_tag_assignments")
      .delete()
      .eq("ranking_id", rankingId);

    if (deleteError) throw deleteError;

    // Add new tag assignments
    if (tagIds.length > 0) {
      const assignments = tagIds.map(tagId => ({
        ranking_id: rankingId,
        tag_id: tagId
      }));

      const { error: insertError } = await supabase
        .from("ranking_tag_assignments")
        .insert(assignments);

      if (insertError) throw insertError;
    }
  };

  return { onSubmit, isLoading };
};
