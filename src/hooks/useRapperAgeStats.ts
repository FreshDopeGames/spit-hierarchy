import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RapperAgeStats {
  averageAge: number;
  totalWithBirthYear: number;
}

export const useRapperAgeStats = () => {
  return useQuery({
    queryKey: ["rapper-age-stats"],
    queryFn: async (): Promise<RapperAgeStats> => {
      const { data, error } = await supabase
        .from("rappers")
        .select("birth_year")
        .not("birth_year", "is", null);

      if (error) throw error;

      const currentYear = new Date().getFullYear();
      const ages = data.map(rapper => currentYear - rapper.birth_year);
      const averageAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;

      return {
        averageAge,
        totalWithBirthYear: data.length
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};