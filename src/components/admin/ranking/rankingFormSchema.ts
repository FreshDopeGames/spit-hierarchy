
import * as z from "zod";

export const rankingFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  slug: z.string().min(1, "Slug is required")
});

export type RankingFormData = z.infer<typeof rankingFormSchema>;
