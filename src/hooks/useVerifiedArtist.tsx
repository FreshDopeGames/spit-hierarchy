import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";

/**
 * Returns verified-artist status for the current user.
 * A verified artist is a user with an approved rapper_claims row.
 */
export const useVerifiedArtist = () => {
  const { user } = useSecureAuth();
  const userId = user?.id ?? null;

  const { data, isLoading } = useQuery({
    queryKey: ["verified-artist", userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rapper_claims")
        .select("rapper_id, status, rappers(id, name, slug)")
        .eq("user_id", userId!)
        .eq("status", "approved")
        .maybeSingle();

      if (error) {
        console.error("verified-artist lookup failed", error);
        return null;
      }
      return data;
    },
  });

  return {
    isVerifiedArtist: !!data,
    ownedRapperId: data?.rapper_id ?? null,
    ownedRapper: (data?.rappers as { id: string; name: string; slug: string } | null) ?? null,
    isLoading,
  };
};

/**
 * Looks up verified rapper info for a list of user IDs (used for comment styling).
 */
export const useVerifiedRappersForUsers = (userIds: string[]) => {
  const sortedIds = [...new Set(userIds)].sort();

  return useQuery({
    queryKey: ["verified-rappers-for-users", sortedIds],
    enabled: sortedIds.length > 0,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_verified_rappers_for_users", {
        _user_ids: sortedIds,
      });
      if (error) {
        console.error("verified rappers batch lookup failed", error);
        return [] as Array<{ user_id: string; rapper_id: string; rapper_name: string; rapper_slug: string }>;
      }
      return (data ?? []) as Array<{
        user_id: string;
        rapper_id: string;
        rapper_name: string;
        rapper_slug: string;
      }>;
    },
  });
};
