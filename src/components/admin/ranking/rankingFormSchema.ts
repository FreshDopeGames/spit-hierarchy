
import * as z from "zod";

export const rankingFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  slug: z.string().min(1, "Slug is required"),
  display_order: z.number().min(0, "Display order must be 0 or greater").default(0),
  tags: z.array(z.string()).default([])
});

export type RankingFormData = z.infer<typeof rankingFormSchema>;
