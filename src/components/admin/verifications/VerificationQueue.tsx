import { useState } from "react";
import { useAdminRapperClaims, useReviewRapperClaim, RapperClaimStatus } from "@/hooks/useRapperClaim";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, BadgeCheck, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_TABS: { label: string; value: RapperClaimStatus | "all" }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
];

const VerificationQueue = () => {
  const [tab, setTab] = useState<RapperClaimStatus | "all">("pending");
  const { data: claims = [], isLoading } = useAdminRapperClaims(
    tab === "all" ? undefined : tab
  );
  const review = useReviewRapperClaim();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-bold ${
              tab === t.value
                ? "bg-[hsl(var(--theme-primary))] text-black"
                : "bg-[hsl(var(--theme-background))]/40 text-[hsl(var(--theme-textMuted))] border border-[hsl(var(--theme-border))]/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-[hsl(var(--theme-textMuted))]">Loading...</p>}
      {!isLoading && claims.length === 0 && (
        <p className="text-[hsl(var(--theme-textMuted))]">No claims in this view.</p>
      )}

      <div className="space-y-3">
        {claims.map((claim: any) => (
          <Card key={claim.id} className="bg-black border border-[hsl(var(--theme-primary))]/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[hsl(var(--theme-primary))]">
                      {claim.rappers?.name ?? "Unknown rapper"}
                    </h3>
                    <Badge
                      variant="outline"
                      className={
                        claim.status === "approved"
                          ? "border-green-500 text-green-400"
                          : claim.status === "rejected"
                          ? "border-red-500 text-red-400"
                          : "border-yellow-500 text-yellow-400"
                      }
                    >
                      {claim.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {claim.claim_method.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-[hsl(var(--theme-textMuted))] mt-1">
                    User: <span className="font-mono">{claim.user_id}</span>
                    {" · "}
                    {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}
                  </p>
                </div>
                {claim.status === "pending" && (
                  <div className="flex gap-2">
                    <ThemedButton
                      size="sm"
                      onClick={() =>
                        review.mutate({ claimId: claim.id, status: "approved" })
                      }
                      disabled={review.isPending}
                    >
                      <BadgeCheck className="w-4 h-4 mr-1" /> Approve
                    </ThemedButton>
                    <ThemedButton
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRejectingId(claim.id);
                        setRejectionReason("");
                      }}
                      disabled={review.isPending}
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </ThemedButton>
                  </div>
                )}
              </div>

              {claim.proof_url && (
                <a
                  href={claim.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[hsl(var(--theme-primary))] underline break-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> {claim.proof_url}
                </a>
              )}

              {claim.notes && (
                <p className="text-sm text-[hsl(var(--theme-text))] whitespace-pre-wrap">
                  <span className="text-[hsl(var(--theme-textMuted))] text-xs uppercase mr-2">Notes:</span>
                  {claim.notes}
                </p>
              )}

              {claim.rejection_reason && (
                <p className="text-sm text-red-400 whitespace-pre-wrap">
                  <span className="text-[hsl(var(--theme-textMuted))] text-xs uppercase mr-2">Rejection:</span>
                  {claim.rejection_reason}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!rejectingId} onOpenChange={(o) => !o && setRejectingId(null)}>
        <DialogContent className="bg-[hsl(var(--theme-background))] border-[hsl(var(--theme-primary))]/40">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--theme-primary))]">Reject claim</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason (shown to the user)"
            rows={3}
            className="bg-black text-white border-[hsl(var(--theme-primary))]/40"
          />
          <DialogFooter>
            <ThemedButton variant="outline" onClick={() => setRejectingId(null)}>
              Cancel
            </ThemedButton>
            <ThemedButton
              onClick={() => {
                if (!rejectingId) return;
                review.mutate(
                  { claimId: rejectingId, status: "rejected", rejectionReason },
                  { onSuccess: () => setRejectingId(null) }
                );
              }}
              disabled={review.isPending}
            >
              Reject
            </ThemedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerificationQueue;
