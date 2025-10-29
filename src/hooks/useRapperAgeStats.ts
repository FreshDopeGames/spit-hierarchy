import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GenerationBreakdown {
  generation: 'Boomers' | 'Gen X' | 'Millennials' | 'Gen Z';
  count: number;
  birthYearRange: string;
}

interface RapperAgeStats {
  averageAge: number;
  totalWithBirthYear: number;
  generationBreakdown: GenerationBreakdown[];
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

      // Count by generation
      const generationCounts = {
        boomers: 0,
        genX: 0,
        millennials: 0,
        genZ: 0
      };

      data.forEach(rapper => {
        const birthYear = rapper.birth_year;
        if (birthYear >= 1946 && birthYear <= 1964) generationCounts.boomers++;
        else if (birthYear >= 1965 && birthYear <= 1980) generationCounts.genX++;
        else if (birthYear >= 1981 && birthYear <= 1996) generationCounts.millennials++;
        else if (birthYear >= 1997 && birthYear <= 2012) generationCounts.genZ++;
      });

      // Build breakdown array (only include generations with artists)
      const generationBreakdown: GenerationBreakdown[] = [];
      if (generationCounts.boomers > 0) {
        generationBreakdown.push({
          generation: 'Boomers',
          count: generationCounts.boomers,
          birthYearRange: '1946-1964'
        });
      }
      if (generationCounts.genX > 0) {
        generationBreakdown.push({
          generation: 'Gen X',
          count: generationCounts.genX,
          birthYearRange: '1965-1980'
        });
      }
      if (generationCounts.millennials > 0) {
        generationBreakdown.push({
          generation: 'Millennials',
          count: generationCounts.millennials,
          birthYearRange: '1981-1996'
        });
      }
      if (generationCounts.genZ > 0) {
        generationBreakdown.push({
          generation: 'Gen Z',
          count: generationCounts.genZ,
          birthYearRange: '1997-2012'
        });
      }

      return {
        averageAge,
        totalWithBirthYear: data.length,
        generationBreakdown
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};