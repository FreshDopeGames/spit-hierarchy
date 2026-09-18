
import { useOptimizedQuery } from "./useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";

export const useTopRappersByCategory = () => {
  return useOptimizedQuery({
    queryKey: ["top-rappers-by-category"],
    priority: 'low',
    queryFn: async () => {
      try {
        console.log('Fetching voting categories...');
        
        // First, get all voting categories to see what's available
        const { data: allCategories, error: allCategoriesError } = await supabase
          .from('voting_categories')
          .select('id, name');

        if (allCategoriesError) {
          console.error('Error fetching all categories:', allCategoriesError);
          throw allCategoriesError;
        }

        console.log('Available voting categories:', allCategories);

        // Use all voting categories except "Overall"
        const skillCategories = (allCategories || []).filter(category => 
          category.name.toLowerCase() !== 'overall'
        );

        console.log('Filtered skill categories:', skillCategories);

        const result: Record<string, any[]> = {};

        // For each category, get top rappers by average rating
        for (const category of skillCategories) {
          try {
            console.log(`Fetching votes for category: ${category.name} (${category.id})`);
            
            const { data: categoryStats, error: votesError } = await supabase
              .rpc('get_category_rapper_ratings', { p_category_id: category.id });

            if (votesError) {
              console.error(`Error fetching votes for ${category.name}:`, votesError);
              // Continue to next category instead of failing entirely
              result[category.name.toLowerCase().replace(/\s+/g, '_')] = [];
              continue;
            }

            const rows = (categoryStats || []) as any[];
            console.log(`Found ${rows.length} rated rappers for ${category.name}`);

            // Sort with progressive minimum threshold (3, then 2, then 1)
            const allRappers = rows
              .map(row => ({
                rapper_id: row.rapper_id,
                rapper_name: row.rapper_name,
                slug: row.slug,
                average_rating: Number(row.average_rating),
                vote_count: Number(row.vote_count)
              }))
              .sort((a, b) => b.average_rating - a.average_rating);

            // Try threshold 3 first, fall back to 2, then 1
            let topRappers = allRappers.filter(r => r.vote_count >= 3).slice(0, 5);
            if (topRappers.length === 0) {
              topRappers = allRappers.filter(r => r.vote_count >= 2).slice(0, 5);
            }
            if (topRappers.length === 0) {
              topRappers = allRappers.filter(r => r.vote_count >= 1).slice(0, 5);
            }

            console.log(`Top rappers for ${category.name}:`, topRappers);

            // Use a clean category key
            const categoryKey = category.name.toLowerCase().replace(/\s+/g, '_');
            result[categoryKey] = topRappers;

          } catch (categoryError) {
            console.error(`Error processing category ${category.name}:`, categoryError);
            // Set empty array for this category and continue
            result[category.name.toLowerCase().replace(/\s+/g, '_')] = [];
          }
        }

        console.log('Final result with all categories:', result);
        return result;
      } catch (error) {
        console.error('Fatal error in useTopRappersByCategory:', error);
        // Return empty object instead of hardcoded categories
        return {};
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
