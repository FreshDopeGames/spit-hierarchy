import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { cn } from "@/lib/utils";

interface TrackVoteButtonProps {
  trackId: string;
  voteCount: number;
  hasVoted: boolean;
  onVote: (trackId: string) => Promise<any>;
  disabled?: boolean;
}

export const TrackVoteButton = ({
  trackId,
  voteCount,
  hasVoted,
  onVote,
  disabled = false,
}: TrackVoteButtonProps) => {
  const { user } = useSecureAuth();

  const handleClick = async () => {
    if (!user) {
      return;
    }
    await onVote(trackId);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={disabled || !user}
      className={cn(
        "gap-2 transition-colors",
        hasVoted && "text-primary hover:text-primary/80",
        !user && "cursor-not-allowed opacity-60"
      )}
      title={!user ? "Sign in to vote on tracks" : hasVoted ? "Remove vote" : "Vote for this track"}
    >
      <ThumbsUp
        className={cn(
          "h-4 w-4 transition-all",
          hasVoted && "fill-current"
        )}
      />
      <span className="font-medium">{voteCount}</span>
    </Button>
  );
};
