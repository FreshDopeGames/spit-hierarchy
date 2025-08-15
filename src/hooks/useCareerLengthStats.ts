import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CareerLengthStats {
  averageCareerLength: number;
  totalWithCareerData: number;
}

export const useCareerLengthStats = () => {
  return useQuery({
    queryKey: ["career-length-stats"],
    queryFn: async (): Promise<CareerLengthStats> => {
      const { data, error } = await supabase
        .from("rappers")
        .select("career_start_year, career_end_year")
        .not("career_start_year", "is", null);

      if (error) throw error;

      const currentYear = new Date().getFullYear();
      const careerLengths = data.map(item => {
        const endYear = item.career_end_year || currentYear;
        return endYear - (item.career_start_year || 0);
      }).filter(length => length > 0);

      const averageCareerLength = careerLengths.length > 0
        ? careerLengths.reduce((sum, length) => sum + length, 0) / careerLengths.length
        : 0;

      return {
        averageCareerLength,
        totalWithCareerData: data.length
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};