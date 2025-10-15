import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemedInput } from "@/components/ui/themed-input";
import { ThemedTextarea } from "@/components/ui/themed-textarea";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedLabel } from "@/components/ui/themed-label";
import { useSuggestionSubmit } from "@/hooks/useRapperSuggestions";
import {
  rapperSuggestionSchema,
  type RapperSuggestionFormData,
} from "@/components/admin/rapperSuggestionSchema";

interface RapperSuggestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRapperName?: string;
}

const RapperSuggestionModal = ({
  open,
  onOpenChange,
  defaultRapperName = "",
}: RapperSuggestionModalProps) => {
  const submitSuggestion = useSuggestionSubmit();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RapperSuggestionFormData>({
    resolver: zodResolver(rapperSuggestionSchema),
    defaultValues: {
      rapper_name: defaultRapperName || "",
      additional_info: "",
    },
  });

  const onSubmit = async (data: RapperSuggestionFormData) => {
    await submitSuggestion.mutateAsync({
      rapper_name: data.rapper_name,
      additional_info: data.additional_info,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[hsl(var(--theme-surface))] border-[hsl(var(--theme-primary))]">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] text-2xl">
            Suggest a Rapper
          </DialogTitle>
          <DialogDescription className="text-[hsl(var(--theme-text-muted))]">
            Can't find the rapper you're looking for? Suggest them to our admins.
            You can make up to 5 suggestions per day.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <ThemedLabel htmlFor="rapper_name">Rapper Name *</ThemedLabel>
            <ThemedInput
              id="rapper_name"
              {...register("rapper_name")}
              placeholder="Enter rapper name"
              className="mt-1"
            />
            {errors.rapper_name && (
              <p className="text-red-500 text-sm mt-1">{errors.rapper_name.message}</p>
            )}
          </div>

          <div>
            <ThemedLabel htmlFor="additional_info">
              Additional Information (Optional)
            </ThemedLabel>
            <ThemedTextarea
              id="additional_info"
              {...register("additional_info")}
              placeholder="Any additional details about the rapper (real name, origin, notable works, etc.)"
              className="mt-1 min-h-[100px]"
            />
            {errors.additional_info && (
              <p className="text-red-500 text-sm mt-1">
                {errors.additional_info.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <ThemedButton
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={submitSuggestion.isPending}
            >
              Cancel
            </ThemedButton>
            <ThemedButton type="submit" disabled={submitSuggestion.isPending}>
              {submitSuggestion.isPending ? "Submitting..." : "Submit Suggestion"}
            </ThemedButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RapperSuggestionModal;
