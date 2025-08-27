
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface VoteSubmissionProps {
  rating: number;
  onSubmit: () => void;
  isSubmitting: boolean;
  existingVote?: any;
}

const VoteSubmission = ({ rating, onSubmit, isSubmitting, existingVote }: VoteSubmissionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[var(--theme-primary)] justify-center">
        <Star className="w-5 h-5 fill-current" />
        <span className="font-semibold font-[var(--theme-fontSecondary)] text-lg">
          {rating}/10
        </span>
      </div>

      <Button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full bg-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/80 text-[var(--theme-textLight)] font-[var(--theme-fontSecondary)]"
      >
        {isSubmitting ? "Submitting..." : existingVote ? "Update Vote" : "Submit Vote"}
      </Button>
    </div>
  );
};

export default VoteSubmission;
