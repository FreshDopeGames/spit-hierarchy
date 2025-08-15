import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTopRappersByCategory = () => {
  return useQuery({
    queryKey: ["top-rappers-by-category"],
    queryFn: async () => {
      try {
        // Get voting categories
        const { data: categories, error: categoriesError } = await supabase
          .from('voting_categories')
          .select('id, name')
          .in('name', ['lyrical_ability', 'flow', 'delivery']);

        if (categoriesError) throw categoriesError;

        const result: Record<string, any[]> = {};

        // For each category, get top rappers by average rating
        for (const category of categories || []) {
          const { data: votes, error: votesError } = await supabase
            .from('votes')
            .select(`
              rapper_id,
              rating,
              rappers!inner(id, name, slug)
            `)
            .eq('category_id', category.id)
            .order('rating', { ascending: false });

          if (votesError) throw votesError;

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

          // Calculate averages and sort
          const topRappers = Object.values(rapperStats)
            .filter(rapper => rapper.vote_count >= 3) // Minimum votes for reliability
            .map(rapper => ({
              rapper_id: rapper.rapper_id,
              rapper_name: rapper.rapper_name,
              slug: rapper.slug,
              average_rating: rapper.total_rating / rapper.vote_count,
              vote_count: rapper.vote_count
            }))
            .sort((a, b) => b.average_rating - a.average_rating)
            .slice(0, 3);

          result[category.name] = topRappers;
        }

        return result;
      } catch (error) {
        console.error('Error fetching top rappers by category:', error);
        // Fallback to empty data
        return {
          lyrical_ability: [],
          flow: [],
          delivery: []
        };
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};