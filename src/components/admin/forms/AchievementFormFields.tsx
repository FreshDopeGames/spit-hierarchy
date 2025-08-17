import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
          <Label htmlFor="name" className="text-rap-platinum font-bold">Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Achievement name"
            className="bg-rap-carbon border-rap-gold/30 text-rap-platinum"
          />
          {errors.name && (
            <p className="text-rap-burgundy text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-rap-platinum font-bold">Description *</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Achievement description"
            className="bg-rap-carbon border-rap-gold/30 text-rap-platinum resize-none"
            rows={3}
          />
          {errors.description && (
            <p className="text-rap-burgundy text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Icon */}
        <div>
          <Label htmlFor="icon" className="text-rap-platinum font-bold">Icon *</Label>
          <Input
            id="icon"
            {...register("icon")}
            placeholder="🏆"
            className="bg-rap-carbon border-rap-gold/30 text-rap-platinum"
          />
          {errors.icon && (
            <p className="text-rap-burgundy text-sm mt-1">{errors.icon.message}</p>
          )}
        </div>

        {/* Points */}
        <div>
          <Label htmlFor="points" className="text-rap-platinum font-bold">Points *</Label>
          <Input
            id="points"
            type="number"
            {...register("points", { valueAsNumber: true })}
            placeholder="10"
            className="bg-rap-carbon border-rap-gold/30 text-rap-platinum"
          />
          {errors.points && (
            <p className="text-rap-burgundy text-sm mt-1">{errors.points.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Type */}
        <div>
          <Label className="text-rap-platinum font-bold">Type *</Label>
          <Select value={watch("type")} onValueChange={(value) => setValue("type", value as any)}>
            <SelectTrigger className="bg-rap-carbon border-rap-gold/30 text-rap-platinum">
              <SelectValue placeholder="Select achievement type" />
            </SelectTrigger>
            <SelectContent className="bg-rap-carbon border-rap-gold/30">
              {ACHIEVEMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-rap-platinum hover:bg-rap-gold/20">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-rap-burgundy text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Rarity */}
        <div>
          <Label className="text-rap-platinum font-bold">Rarity *</Label>
          <Select value={watch("rarity")} onValueChange={(value) => setValue("rarity", value as any)}>
            <SelectTrigger className="bg-rap-carbon border-rap-gold/30 text-rap-platinum">
              <SelectValue placeholder="Select rarity" />
            </SelectTrigger>
            <SelectContent className="bg-rap-carbon border-rap-gold/30">
              {ACHIEVEMENT_RARITIES.map((rarity) => (
                <SelectItem key={rarity.value} value={rarity.value} className="text-rap-platinum hover:bg-rap-gold/20">
                  {rarity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.rarity && (
            <p className="text-rap-burgundy text-sm mt-1">{errors.rarity.message}</p>
          )}
        </div>

        {/* Threshold Value */}
        <div>
          <Label htmlFor="threshold_value" className="text-rap-platinum font-bold">Threshold Value</Label>
          <Input
            id="threshold_value"
            type="number"
            {...register("threshold_value", { 
              valueAsNumber: true,
              setValueAs: (value) => value === "" ? null : Number(value)
            })}
            placeholder="e.g., 10"
            className="bg-rap-carbon border-rap-gold/30 text-rap-platinum"
          />
          {errors.threshold_value && (
            <p className="text-rap-burgundy text-sm mt-1">{errors.threshold_value.message}</p>
          )}
        </div>

        {/* Threshold Field */}
        <div>
          <Label className="text-rap-platinum font-bold">Threshold Field</Label>
          <Select 
            value={watch("threshold_field") || ""} 
            onValueChange={(value) => setValue("threshold_field", value || null)}
          >
            <SelectTrigger className="bg-rap-carbon border-rap-gold/30 text-rap-platinum">
              <SelectValue placeholder="Select field to track" />
            </SelectTrigger>
            <SelectContent className="bg-rap-carbon border-rap-gold/30">
              <SelectItem value="" className="text-rap-platinum hover:bg-rap-gold/20">
                None
              </SelectItem>
              {THRESHOLD_FIELDS.map((field) => (
                <SelectItem key={field.value} value={field.value} className="text-rap-platinum hover:bg-rap-gold/20">
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={watch("is_active")}
            onCheckedChange={(checked) => setValue("is_active", checked)}
          />
          <Label htmlFor="is_active" className="text-rap-platinum font-bold">
            Active
          </Label>
        </div>
      </div>
    </div>
  );
};

export default AchievementFormFields;