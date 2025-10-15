import { z } from 'zod';

export const rapperSuggestionSchema = z.object({
  rapper_name: z.string()
    .trim()
    .min(2, 'Rapper name must be at least 2 characters')
    .max(100, 'Rapper name must be less than 100 characters'),
  additional_info: z.string()
    .trim()
    .max(500, 'Additional info must be less than 500 characters')
    .optional()
});

export type RapperSuggestionFormData = z.infer<typeof rapperSuggestionSchema>;
