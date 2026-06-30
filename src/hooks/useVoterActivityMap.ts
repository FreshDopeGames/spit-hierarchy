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
      const { data, error } = await supabase.rpc("get_voter_activity_map");

      if (error) throw error;
      if (!data) return [];

      const counts: Record<string, { count: number; countryCode: string | null; region: string | null }> = {};

      (data as Array<{ country: string | null; country_code: string | null; region: string | null; voter_count: number }>).forEach((row) => {
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
        counts[key].count += Number(row.voter_count) || 0;
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
