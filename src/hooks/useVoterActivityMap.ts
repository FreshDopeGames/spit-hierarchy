import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getLocationCentroid, Centroid } from "@/utils/locationCentroids";

export interface ActivityLocation {
  label: string;
  count: number;
  coordinates: Centroid | null;
  countryCode: string | null;
  region: string | null;
}

export const useVoterActivityMap = () => {
  return useQuery({
    queryKey: ["voter-activity-map"],
    queryFn: async (): Promise<ActivityLocation[]> => {
      const { data, error } = await supabase
        .from("voter_locations")
        .select("country, country_code, region");

      if (error) throw error;
      if (!data) return [];

      // Aggregate: US users by state, others by country
      const counts: Record<string, { count: number; countryCode: string | null; region: string | null }> = {};

      data.forEach((row: any) => {
        const cc = row.country_code;
        let key: string;
        let region: string | null = null;

        if (cc === "US" && row.region) {
          key = `${row.region}, US`;
          region = row.region;
        } else {
          key = row.country || cc || "Unknown";
        }

        if (!counts[key]) {
          counts[key] = { count: 0, countryCode: cc, region };
        }
        counts[key].count++;
      });

      return Object.entries(counts)
        .map(([label, { count, countryCode, region }]) => ({
          label,
          count,
          coordinates: getLocationCentroid(countryCode, region),
          countryCode,
          region,
        }))
        .sort((a, b) => b.count - a.count);
    },
    staleTime: 1000 * 60 * 15,
  });
};
