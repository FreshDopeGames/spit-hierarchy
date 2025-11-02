import { z } from "zod";

export const achievementFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  icon: z.string().min(1, "Icon is required"),
  type: z.enum(["voting", "engagement", "quality", "community", "time_based", "special"]),
  rarity: z.enum(["common", "rare", "epic", "legendary"]),
  points: z.number().min(1, "Points must be at least 1").max(2000, "Points must be less than 2000"),
  threshold_value: z.number().min(0).nullable(),
  threshold_field: z.string().nullable(),
  is_active: z.boolean(),
  series_name: z.string().nullable().optional(),
  tier_level: z.number().min(1).max(20).nullable().optional(),
  badge_color: z.string().nullable().optional(),
  is_hidden: z.boolean().optional(),
});

export type AchievementFormData = z.infer<typeof achievementFormSchema>;