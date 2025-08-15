
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTopRappersByCategory = () => {
  return useQuery({
    queryKey: ["top-rappers-by-category"],
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

        // Use all voting categories instead of just skill-related ones
        const skillCategories = allCategories || [];

        console.log('Filtered skill categories:', skillCategories);

        const result: Record<string, any[]> = {};

        // For each category, get top rappers by average rating
        for (const category of skillCategories) {
          try {
            console.log(`Fetching votes for category: ${category.name} (${category.id})`);
            
            const { data: votes, error: votesError } = await supabase
              .from('votes')
              .select(`
                rapper_id,
                rating,
                rappers!inner(id, name, slug)
              `)
              .eq('category_id', category.id);

            if (votesError) {
              console.error(`Error fetching votes for ${category.name}:`, votesError);
              // Continue to next category instead of failing entirely
              result[category.name.toLowerCase().replace(/\s+/g, '_')] = [];
              continue;
            }

            console.log(`Found ${votes?.length || 0} votes for ${category.name}`);

            // Group by rapper and calculate averages
            const rapperStats: Record<string, { 
              rapper_id: string; 
              rapper_name: string; 
              slug: string; 
              total_rating: number; 
              vote_count: number 
            }> = {};

            votes?.forEach(vote => {
              const rapperId = vote.rapper_id;
              const rapperName = (vote.rappers as any)?.name;
              const rapperSlug = (vote.rappers as any)?.slug;
              
              if (!rapperStats[rapperId]) {
                rapperStats[rapperId] = {
                  rapper_id: rapperId,
                  rapper_name: rapperName,
                  slug: rapperSlug,
                  total_rating: 0,
                  vote_count: 0
                };
              }
              rapperStats[rapperId].total_rating += vote.rating;
              rapperStats[rapperId].vote_count += 1;
            });

            // Calculate averages and sort (require at least 1 vote)
            const topRappers = Object.values(rapperStats)
              .filter(rapper => rapper.vote_count >= 1)
              .map(rapper => ({
                rapper_id: rapper.rapper_id,
                rapper_name: rapper.rapper_name,
                slug: rapper.slug,
                average_rating: rapper.total_rating / rapper.vote_count,
                vote_count: rapper.vote_count
              }))
              .sort((a, b) => b.average_rating - a.average_rating)
              .slice(0, 5);

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
