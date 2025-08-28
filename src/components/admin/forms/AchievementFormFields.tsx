import { UseFormReturn } from "react-hook-form";
import { ThemedInput } from "@/components/ui/themed-input";
import { ThemedTextarea } from "@/components/ui/themed-textarea";
import { ThemedLabel } from "@/components/ui/themed-label";
import { ThemedSelect, ThemedSelectContent, ThemedSelectItem, ThemedSelectTrigger, ThemedSelectValue } from "@/components/ui/themed-select";
import { Switch } from "@/components/ui/switch";
import { AchievementFormData } from "./achievementFormSchema";

interface AchievementFormFieldsProps {
  form: UseFormReturn<AchievementFormData>;
}

const ACHIEVEMENT_TYPES = [
  { value: "voting", label: "Voting" },
  { value: "engagement", label: "Engagement" },
  { value: "quality", label: "Quality" },
  { value: "community", label: "Community" },
  { value: "time_based", label: "Time Based" },
  { value: "special", label: "Special" },
];

const ACHIEVEMENT_RARITIES = [
  { value: "common", label: "Common" },
  { value: "rare", label: "Rare" },
  { value: "epic", label: "Epic" },
  { value: "legendary", label: "Legendary" },
];

const THRESHOLD_FIELDS = [
  { value: "total_votes", label: "Total Votes" },
  { value: "total_comments", label: "Total Comments" },
  { value: "consecutive_voting_days", label: "Consecutive Voting Days" },
  { value: "ranking_lists_created", label: "Ranking Lists Created" },
  { value: "total_upvotes", label: "Total Upvotes" },
];

const AchievementFormFields = ({ form }: AchievementFormFieldsProps) => {
  const { register, setValue, watch, formState: { errors } } = form;
  const watchedType = watch("type");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        {/* Name */}
        <div>
          <ThemedLabel htmlFor="name">Name *</ThemedLabel>
          <ThemedInput
            id="name"
            {...register("name")}
            placeholder="Achievement name"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <ThemedLabel htmlFor="description">Description *</ThemedLabel>
          <ThemedTextarea
            id="description"
            {...register("description")}
            placeholder="Achievement description"
            rows={3}
          />
          {errors.description && (
            <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Icon */}
        <div>
          <ThemedLabel htmlFor="icon">Icon *</ThemedLabel>
          <ThemedInput
            id="icon"
            {...register("icon")}
            placeholder="🏆"
          />
          {errors.icon && (
            <p className="text-red-400 text-sm mt-1">{errors.icon.message}</p>
          )}
        </div>

        {/* Points */}
        <div>
          <ThemedLabel htmlFor="points">Points *</ThemedLabel>
          <ThemedInput
            id="points"
            type="number"
            {...register("points", { valueAsNumber: true })}
            placeholder="10"
          />
          {errors.points && (
            <p className="text-rap-burgundy text-sm mt-1">{errors.points.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Type */}
        <div>
          <ThemedLabel>Type *</ThemedLabel>
          <ThemedSelect value={watch("type")} onValueChange={(value) => setValue("type", value as any)}>
            <ThemedSelectTrigger>
              <ThemedSelectValue placeholder="Select achievement type" />
            </ThemedSelectTrigger>
            <ThemedSelectContent>
              {ACHIEVEMENT_TYPES.map((type) => (
                <ThemedSelectItem key={type.value} value={type.value}>
                  {type.label}
                </ThemedSelectItem>
              ))}
            </ThemedSelectContent>
          </ThemedSelect>
          {errors.type && (
            <p className="text-red-400 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Rarity */}
        <div>
          <ThemedLabel>Rarity *</ThemedLabel>
          <ThemedSelect value={watch("rarity")} onValueChange={(value) => setValue("rarity", value as any)}>
            <ThemedSelectTrigger>
              <ThemedSelectValue placeholder="Select rarity" />
            </ThemedSelectTrigger>
            <ThemedSelectContent>
              {ACHIEVEMENT_RARITIES.map((rarity) => (
                <ThemedSelectItem key={rarity.value} value={rarity.value}>
                  {rarity.label}
                </ThemedSelectItem>
              ))}
            </ThemedSelectContent>
          </ThemedSelect>
          {errors.rarity && (
            <p className="text-red-400 text-sm mt-1">{errors.rarity.message}</p>
          )}
        </div>

        {/* Threshold Value */}
        <div>
          <ThemedLabel htmlFor="threshold_value">Threshold Value</ThemedLabel>
          <ThemedInput
            id="threshold_value"
            type="number"
            {...register("threshold_value", { 
              valueAsNumber: true,
              setValueAs: (value) => value === "" ? null : Number(value)
            })}
            placeholder="e.g., 10"
          />
          {errors.threshold_value && (
            <p className="text-red-400 text-sm mt-1">{errors.threshold_value.message}</p>
          )}
        </div>

        {/* Threshold Field */}
        <div>
          <ThemedLabel>Threshold Field</ThemedLabel>
          <ThemedSelect 
            value={watch("threshold_field") || ""} 
            onValueChange={(value) => setValue("threshold_field", value || null)}
          >
            <ThemedSelectTrigger>
              <ThemedSelectValue placeholder="Select field to track" />
            </ThemedSelectTrigger>
            <ThemedSelectContent>
              <ThemedSelectItem value="">
                None
              </ThemedSelectItem>
              {THRESHOLD_FIELDS.map((field) => (
                <ThemedSelectItem key={field.value} value={field.value}>
                  {field.label}
                </ThemedSelectItem>
              ))}
            </ThemedSelectContent>
          </ThemedSelect>
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={watch("is_active")}
            onCheckedChange={(checked) => setValue("is_active", checked)}
          />
          <ThemedLabel htmlFor="is_active">
            Active
          </ThemedLabel>
        </div>
      </div>
    </div>
  );
};

export default AchievementFormFields;