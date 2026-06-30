import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { toast } from "sonner";

export type RapperClaimStatus = "pending" | "approved" | "rejected";

export interface RapperClaim {
  id: string;
  rapper_id: string;
  user_id: string;
  status: RapperClaimStatus;
  claim_method: "self_request" | "admin_assigned";
  proof_url: string | null;
  notes: string | null;
  rejection_reason: string | null;
  created_at: string;
}

/** Get the current user's claim status for a specific rapper, if any. */
export const useMyClaimForRapper = (rapperId: string | undefined) => {
  const { user } = useSecureAuth();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: ["my-rapper-claim", userId, rapperId],
    enabled: !!userId && !!rapperId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rapper_claims")
        .select("*")
        .eq("user_id", userId!)
        .eq("rapper_id", rapperId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error("claim lookup failed", error);
        return null;
      }
      return data as RapperClaim | null;
    },
  });
};

/** Submit a self-claim for a rapper profile. */
export const useSubmitRapperClaim = () => {
  const { user } = useSecureAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rapperId,
      proofUrl,
      notes,
    }: {
      rapperId: string;
      proofUrl?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error("You must be signed in to claim a profile.");

      const { data, error } = await supabase
        .from("rapper_claims")
        .insert({
          rapper_id: rapperId,
          user_id: user.id,
          status: "pending",
          claim_method: "self_request",
          proof_url: proofUrl || null,
          notes: notes || null,
        })
        .select("id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["my-rapper-claim", user?.id, vars.rapperId] });
      qc.invalidateQueries({ queryKey: ["admin-rapper-claims"] });
      toast.success("Claim submitted. We'll review it shortly.");
    },
    onError: (err: Error) => {
      const msg = err.message?.includes("unique")
        ? "You already have a pending claim for this rapper."
        : err.message;
      toast.error(msg);
    },
  });
};

/** Admin: list all claims, optionally filtered by status. */
export const useAdminRapperClaims = (status?: RapperClaimStatus) => {
  return useQuery({
    queryKey: ["admin-rapper-claims", status ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("rapper_claims")
        .select("*, rappers(id, name, slug, image_url)")
        .order("created_at", { ascending: false });
      if (status) q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
};

/** Admin: approve/reject a claim. */
export const useReviewRapperClaim = () => {
  const { user } = useSecureAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      claimId,
      status,
      rejectionReason,
    }: {
      claimId: string;
      status: "approved" | "rejected";
      rejectionReason?: string;
    }) => {
      const { data, error } = await supabase
        .from("rapper_claims")
        .update({
          status,
          rejection_reason: status === "rejected" ? rejectionReason || null : null,
          reviewed_by: user?.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", claimId)
        .select("id")
        .single();
      if (error) throw error;
      if (!data) throw new Error("Update silently failed — check permissions.");
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-rapper-claims"] });
      qc.invalidateQueries({ queryKey: ["verified-artist"] });
      qc.invalidateQueries({ queryKey: ["verified-rappers-for-users"] });
      toast.success(`Claim ${vars.status}.`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

/** Admin: directly assign a user to a rapper (creates an approved claim). */
export const useAdminAssignClaim = () => {
  const { user } = useSecureAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ rapperId, userId, notes }: { rapperId: string; userId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from("rapper_claims")
        .insert({
          rapper_id: rapperId,
          user_id: userId,
          status: "approved",
          claim_method: "admin_assigned",
          notes: notes || null,
          reviewed_by: user?.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-rapper-claims"] });
      qc.invalidateQueries({ queryKey: ["verified-artist"] });
      qc.invalidateQueries({ queryKey: ["verified-rappers-for-users"] });
      toast.success("User linked as verified artist.");
    },
    onError: (err: Error) => {
      const msg = err.message?.includes("unique")
        ? "That user or rapper already has an approved claim."
        : err.message;
      toast.error(msg);
    },
  });
};
