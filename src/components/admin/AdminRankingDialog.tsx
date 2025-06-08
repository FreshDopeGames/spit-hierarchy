
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import RankingTagSelector from "./RankingTagSelector";

interface RankingFormData {
  title: string;
  description: string;
  category: string;
  slug: string;
  display_order: number;
  is_featured: boolean;
}

interface AdminRankingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ranking?: any;
  onSuccess: () => void;
}

const AdminRankingDialog = ({ open, onOpenChange, ranking, onSuccess }: AdminRankingDialogProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<RankingFormData>({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      slug: "",
      display_order: 0,
      is_featured: false,
    }
  });

  const watchedTitle = watch("title");

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !ranking) {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue("slug", slug);
    }
  }, [watchedTitle, setValue, ranking]);

  // Set form values when editing
  useEffect(() => {
    if (ranking && open) {
      setValue("title", ranking.title);
      setValue("description", ranking.description || "");
      setValue("category", ranking.category);
      setValue("slug", ranking.slug);
      setValue("display_order", ranking.display_order);
      setValue("is_featured", ranking.is_featured);
      
      // Set selected tags
      const tagIds = ranking.ranking_tag_assignments?.map((assignment: any) => assignment.tag_id) || [];
      setSelectedTags(tagIds);
    } else if (!ranking && open) {
      reset();
      setSelectedTags([]);
    }
  }, [ranking, open, setValue, reset]);

  const createMutation = useMutation({
    mutationFn: async (data: RankingFormData) => {
      // First create the ranking
      const { data: newRanking, error } = await supabase
        .from("official_rankings")
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      // Then assign tags
      if (selectedTags.length > 0) {
        const tagAssignments = selectedTags.map(tagId => ({
          ranking_id: newRanking.id,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from("ranking_tag_assignments")
          .insert(tagAssignments);

        if (tagError) throw tagError;
      }

      return newRanking;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Ranking created successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create ranking",
        variant: "destructive",
      });
      console.error("Error creating ranking:", error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: RankingFormData) => {
      // Update the ranking
      const { error } = await supabase
        .from("official_rankings")
        .update(data)
        .eq("id", ranking.id);

      if (error) throw error;

      // Delete existing tag assignments
      await supabase
        .from("ranking_tag_assignments")
        .delete()
        .eq("ranking_id", ranking.id);

      // Insert new tag assignments
      if (selectedTags.length > 0) {
        const tagAssignments = selectedTags.map(tagId => ({
          ranking_id: ranking.id,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from("ranking_tag_assignments")
          .insert(tagAssignments);

        if (tagError) throw tagError;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Ranking updated successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update ranking",
        variant: "destructive",
      });
      console.error("Error updating ranking:", error);
    }
  });

  const onSubmit = (data: RankingFormData) => {
    if (ranking) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-carbon-fiber border border-rap-gold/30">
        <DialogHeader>
          <DialogTitle className="text-rap-gold font-mogra text-xl">
            {ranking ? "Edit Ranking" : "Create New Ranking"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-rap-platinum font-kaushan">
                Title *
              </Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                className="bg-rap-carbon border-rap-gold/30 text-rap-platinum"
                placeholder="Enter ranking title"
              />
              {errors.title && (
                <p className="text-red-400 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-rap-platinum font-kaushan">
                Category *
              </Label>
              <Input
                id="category"
                {...register("category", { required: "Category is required" })}
                className="bg-rap-carbon border-rap-gold/30 text-rap-platinum"
                placeholder="e.g., Greatest of All Time"
              />
              {errors.category && (
                <p className="text-red-400 text-sm">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-rap-platinum font-kaushan">
              Description
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              className="bg-rap-carbon border-rap-gold/30 text-rap-platinum min-h-[100px]"
              placeholder="Enter ranking description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-rap-platinum font-kaushan">
                URL Slug *
              </Label>
              <Input
                id="slug"
                {...register("slug", { required: "Slug is required" })}
                className="bg-rap-carbon border-rap-gold/30 text-rap-platinum"
                placeholder="url-friendly-slug"
              />
              {errors.slug && (
                <p className="text-red-400 text-sm">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order" className="text-rap-platinum font-kaushan">
                Display Order
              </Label>
              <Input
                id="display_order"
                type="number"
                {...register("display_order", { valueAsNumber: true })}
                className="bg-rap-carbon border-rap-gold/30 text-rap-platinum"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-rap-platinum font-kaushan">Tags</Label>
            <RankingTagSelector
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              {...register("is_featured")}
              onCheckedChange={(checked) => setValue("is_featured", checked)}
            />
            <Label htmlFor="is_featured" className="text-rap-platinum font-kaushan">
              Featured Ranking
            </Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-rap-gold/30 text-rap-platinum hover:bg-rap-gold/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-rap-gold text-rap-carbon hover:bg-rap-gold-light font-kaushan"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {ranking ? "Update" : "Create"} Ranking
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminRankingDialog;
