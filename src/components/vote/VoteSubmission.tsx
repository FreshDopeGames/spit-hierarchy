
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
      <div className="flex items-center gap-2 text-rap-gold justify-center">
        <Star className="w-5 h-5 fill-current" />
        <span className="font-semibold font-kaushan text-lg">
          {rating}/10
        </span>
      </div>

      <Button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full bg-rap-burgundy hover:bg-rap-burgundy/80 text-rap-platinum font-kaushan"
      >
        {isSubmitting ? "Submitting..." : existingVote ? "Update Vote" : "Submit Vote"}
      </Button>
    </div>
  );
};

export default VoteSubmission;
