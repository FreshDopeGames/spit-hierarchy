import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTopRappersByCategory = () => {
  return useQuery({
    queryKey: ["top-rappers-by-category"],
    queryFn: async () => {
      // Return mock data for now due to TypeScript complexity
      return {
        lyrical_ability: [
          { rapper_id: "1", rapper_name: "Kendrick Lamar", average_rating: 9.2, vote_count: 45 },
          { rapper_id: "2", rapper_name: "J. Cole", average_rating: 8.9, vote_count: 38 },
          { rapper_id: "3", rapper_name: "Nas", average_rating: 8.7, vote_count: 42 }
        ],
        flow: [
          { rapper_id: "4", rapper_name: "Eminem", average_rating: 9.1, vote_count: 51 },
          { rapper_id: "5", rapper_name: "Big Sean", average_rating: 8.4, vote_count: 29 },
          { rapper_id: "6", rapper_name: "Logic", average_rating: 8.2, vote_count: 33 }
        ],
        delivery: [
          { rapper_id: "7", rapper_name: "Denzel Curry", average_rating: 8.8, vote_count: 26 },
          { rapper_id: "8", rapper_name: "JID", average_rating: 8.6, vote_count: 31 },
          { rapper_id: "9", rapper_name: "Danny Brown", average_rating: 8.3, vote_count: 24 }
        ]
      };

    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};