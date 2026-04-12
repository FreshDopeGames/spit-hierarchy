import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useVoterGeolocation = (userId: string | undefined) => {
  const hasTriggered = useRef(false);

  const { data: existingLocation } = useQuery({
    queryKey: ["voter-location", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from("voter_locations")
        .select("id, country, country_code, region, city")
        .eq("user_id", userId)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!userId || existingLocation || hasTriggered.current) return;
    hasTriggered.current = true;

    // Call edge function silently
    supabase.functions.invoke("geolocate-voter").catch((err) => {
      console.error("Geolocation failed silently:", err);
    });
  }, [userId, existingLocation]);

  return existingLocation;
};
