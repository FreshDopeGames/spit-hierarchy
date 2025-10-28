
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { rankingFormSchema, RankingFormData, FilterCriteria } from "./ranking/rankingFormSchema";
import RankingFormFields from "./ranking/RankingFormFields";
import RankingDialogTrigger from "./ranking/RankingDialogTrigger";
import { useRankingSubmission } from "./ranking/useRankingSubmission";

type OfficialRanking = Tables<"official_rankings">;

interface AdminRankingDialogProps {
  onRankingCreated: () => void;
  ranking?: OfficialRanking;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

const AdminRankingDialog = ({
  onRankingCreated,
  ranking,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true
}: AdminRankingDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const form = useForm<RankingFormData>({
    resolver: zodResolver(rankingFormSchema),
    defaultValues: {
      title: ranking?.title || "",
      description: ranking?.description || "",
      category: ranking?.category || "",
      slug: ranking?.slug || "",
      display_order: ranking?.display_order || 0,
      tags: [],
      filter_criteria: (ranking?.filter_criteria as FilterCriteria) || {
        locations: [],
        decades: [],
        artist_types: [],
        tag_ids: []
      }
    }
  });

  // Load existing tags when editing a ranking
  const { data: existingTags } = useQuery({
    queryKey: ["ranking-tags", ranking?.id],
    queryFn: async () => {
      if (!ranking?.id) return [];
      
      const { data, error } = await supabase
        .from("ranking_tag_assignments")
        .select("tag_id")
        .eq("ranking_id", ranking.id);
      
      if (error) throw error;
      return data.map(assignment => assignment.tag_id);
    },
    enabled: !!ranking?.id && open
  });

  // Set selected tags when data loads
  useEffect(() => {
    if (existingTags) {
      setSelectedTags(existingTags);
      form.setValue("tags", existingTags);
    }
  }, [existingTags, form]);

  // Reset form and tags when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedTags([]);
    } else if (ranking) {
      form.reset({
        title: ranking.title,
        description: ranking.description || "",
        category: ranking.category,
        slug: ranking.slug,
        display_order: ranking.display_order || 0,
        tags: [],
        filter_criteria: (ranking.filter_criteria as FilterCriteria) || {
          locations: [],
          decades: [],
          artist_types: [],
          tag_ids: []
        }
      });
    }
  }, [open, ranking, form]);

  const handleTagsChange = (tagIds: string[]) => {
    setSelectedTags(tagIds);
    form.setValue("tags", tagIds);
  };

  const { onSubmit, isLoading } = useRankingSubmission({
    ranking,
    onRankingCreated,
    form,
    setOpen,
    selectedTags
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && <RankingDialogTrigger ranking={ranking} />}
      <DialogContent className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-[var(--theme-font-heading)] text-[var(--theme-primary)]">
            {ranking ? "Edit Ranking" : "Create New Ranking"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <RankingFormFields 
              form={form} 
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
            />
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-surface)]"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primaryLight)] text-[var(--theme-background)] font-[var(--theme-font-heading)]"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {ranking ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminRankingDialog;
