import { useState } from "react";
import { ThemedButton } from "@/components/ui/themed-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useMyClaimForRapper, useSubmitRapperClaim } from "@/hooks/useRapperClaim";
import { useVerifiedArtist } from "@/hooks/useVerifiedArtist";
import { Link } from "react-router-dom";

interface ClaimProfileButtonProps {
  rapperId: string;
  rapperName: string;
}

const ClaimProfileButton = ({ rapperId, rapperName }: ClaimProfileButtonProps) => {
  const { user } = useSecureAuth();
  const { ownedRapperId } = useVerifiedArtist();
  const { data: myClaim } = useMyClaimForRapper(rapperId);
  const submit = useSubmitRapperClaim();
  const [open, setOpen] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [notes, setNotes] = useState("");

  if (!user) {
    return (
      <Link to="/auth" className="text-xs text-[hsl(var(--theme-textMuted))] underline">
        Sign in to claim this profile
      </Link>
    );
  }

  // Already owns this rapper
  if (ownedRapperId === rapperId) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[hsl(var(--theme-primary))] font-bold">
        <BadgeCheck className="w-4 h-4" /> You manage this profile
      </span>
    );
  }

  // Owns a different rapper – cannot claim more
  if (ownedRapperId && ownedRapperId !== rapperId) return null;

  if (myClaim?.status === "pending") {
    return (
      <span className="text-xs text-[hsl(var(--theme-textMuted))] italic">
        Claim pending admin review
      </span>
    );
  }

  if (myClaim?.status === "rejected") {
    return (
      <span className="text-xs text-[hsl(var(--theme-error))] italic">
        Previous claim rejected{myClaim.rejection_reason ? `: ${myClaim.rejection_reason}` : ""}
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-[hsl(var(--theme-primary))] hover:underline font-bold"
      >
        <ShieldCheck className="w-4 h-4" /> Are you {rapperName}? Claim this profile
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[hsl(var(--theme-background))] border-[hsl(var(--theme-primary))]/40">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--theme-primary))]">
              Claim {rapperName}'s profile
            </DialogTitle>
            <DialogDescription className="text-[hsl(var(--theme-textMuted))]">
              Verified artists get a highlighted comment card site-wide and can edit their bio
              and social links. Submit proof you're {rapperName} or their representative
              (e.g. a link to an Instagram post mentioning Spit Hierarchy).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="proof-url" className="text-[hsl(var(--theme-text))]">Proof URL (recommended)</Label>
              <Input
                id="proof-url"
                placeholder="https://instagram.com/p/..."
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="bg-black text-white border-[hsl(var(--theme-primary))]/40"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="claim-notes" className="text-[hsl(var(--theme-text))]">Notes</Label>
              <Textarea
                id="claim-notes"
                placeholder="Anything else we should know?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="bg-black text-white border-[hsl(var(--theme-primary))]/40"
              />
            </div>
          </div>

          <DialogFooter>
            <ThemedButton variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </ThemedButton>
            <ThemedButton
              onClick={() =>
                submit.mutate(
                  { rapperId, proofUrl, notes },
                  { onSuccess: () => setOpen(false) }
                )
              }
              disabled={submit.isPending}
            >
              {submit.isPending ? "Submitting..." : "Submit claim"}
            </ThemedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClaimProfileButton;
