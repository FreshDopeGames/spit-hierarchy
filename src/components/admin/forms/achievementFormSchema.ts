import { z } from "zod";

export const achievementFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  icon: z.string().min(1, "Icon is required"),
  type: z.enum(["voting", "engagement", "quality", "community", "time_based", "special"]),
  rarity: z.enum(["common", "rare", "epic", "legendary"]),
  points: z.number().min(1, "Points must be at least 1").max(1000, "Points must be less than 1000"),
  threshold_value: z.number().min(1).nullable(),
  threshold_field: z.string().nullable(),
  is_active: z.boolean(),
});

export type AchievementFormData = z.infer<typeof achievementFormSchema>;