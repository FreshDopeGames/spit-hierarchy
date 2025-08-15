import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CityStats {
  location: string;
  count: number;
}

export const useTopCitiesStats = () => {
  return useQuery({
    queryKey: ["top-cities-stats"],
    queryFn: async (): Promise<CityStats[]> => {
      const { data, error } = await supabase
        .from("rappers")
        .select("origin")
        .not("origin", "is", null);

      if (error) throw error;

      // Count occurrences of each location
      const locationCounts: { [key: string]: number } = {};
      data.forEach(rapper => {
        if (rapper.origin) {
          locationCounts[rapper.origin] = (locationCounts[rapper.origin] || 0) + 1;
        }
      });

      // Convert to array and sort by count
      const citiesArray = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count);

      return citiesArray;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};