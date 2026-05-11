import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useFeaturedPolls } from "@/hooks/usePolls";
import { useUserPollVotes } from "@/hooks/usePollResults";
import PollWidget from "./PollWidget";

const STORAGE_PREFIX = "poll-modal-shown-";

const SessionPollModal = () => {
  const { user } = useSecureAuth();
  const location = useLocation();
  const { data: polls } = useFeaturedPolls();
  const poll = polls?.[0];
  const { data: userVotes } = useUserPollVotes(poll?.id || "");
  const [open, setOpen] = useState(false);

  const suppressedRoute =
    location.pathname.startsWith("/auth") ||
    location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!user || !poll || suppressedRoute) return;
    if (userVotes === undefined) return; // wait for vote check
    if (userVotes.length > 0) return; // already voted

    const key = `${STORAGE_PREFIX}${poll.id}`;
    if (sessionStorage.getItem(key)) return;

    const timer = setTimeout(() => {
      // Avoid stacking on top of another open dialog (onboarding/username)
      if (document.querySelector('[role="dialog"]')) return;
      sessionStorage.setItem(key, "1");
      setOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, poll, userVotes, suppressedRoute]);

  // Auto-close once the user submits a vote
  useEffect(() => {
    if (open && userVotes && userVotes.length > 0) {
      const t = setTimeout(() => setOpen(false), 2500);
      return () => clearTimeout(t);
    }
  }, [open, userVotes]);

  if (!poll) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg bg-rap-carbon border-rap-gold/40 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-rap-gold font-ceviche text-3xl tracking-wider">
            Quick Poll
          </DialogTitle>
        </DialogHeader>
        <PollWidget poll={poll as any} />
      </DialogContent>
    </Dialog>
  );
};

export default SessionPollModal;
