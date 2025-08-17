import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { achievementFormSchema, type AchievementFormData } from "./achievementFormSchema";
import AchievementFormFields from "./AchievementFormFields";

type Achievement = Tables<"achievements">;

interface AchievementFormProps {
  achievement?: Achievement | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const AchievementForm = ({ achievement, onSuccess, onCancel }: AchievementFormProps) => {
  const form = useForm<AchievementFormData>({
    resolver: zodResolver(achievementFormSchema),
    defaultValues: {
      name: achievement?.name || "",
      description: achievement?.description || "",
      icon: achievement?.icon || "🏆",
      type: achievement?.type || "voting",
      rarity: achievement?.rarity || "common",
      points: achievement?.points || 10,
      threshold_value: achievement?.threshold_value || null,
      threshold_field: achievement?.threshold_field || null,
      is_active: achievement?.is_active ?? true,
    },
  });

  const onSubmit = async (data: AchievementFormData) => {
    try {
      const achievementData = {
        name: data.name,
        description: data.description,
        icon: data.icon,
        type: data.type,
        rarity: data.rarity,
        points: data.points,
        threshold_value: data.threshold_value,
        threshold_field: data.threshold_field,
        is_active: data.is_active,
      };

      if (achievement) {
        // Update existing achievement
        const { error } = await supabase
          .from("achievements")
          .update(achievementData)
          .eq("id", achievement.id);

        if (error) throw error;
        toast.success("Achievement updated successfully!");
      } else {
        // Create new achievement
        const { error } = await supabase
          .from("achievements")
          .insert(achievementData);

        if (error) throw error;
        toast.success("Achievement created successfully!");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving achievement:", error);
      toast.error(`Failed to save achievement: ${error.message}`);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <AchievementFormFields form={form} />
      
      <div className="flex justify-end space-x-4 pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-rap-gold/30 text-rap-gold hover:bg-rap-gold/20"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting}
          className="bg-rap-gold text-rap-carbon hover:bg-rap-gold/90"
        >
          {form.formState.isSubmitting 
            ? (achievement ? "Updating..." : "Creating...") 
            : (achievement ? "Update Achievement" : "Create Achievement")
          }
        </Button>
      </div>
    </form>
  );
};

export default AchievementForm;