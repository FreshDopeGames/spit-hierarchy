
import React from "react";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";

type Vote = Tables<"votes">;

interface VoteSubmissionProps {
  onSubmit: () => void;
  isPending: boolean;
  categoryId: string;
  existingVote: Vote | null | undefined;
}

const VoteSubmission = ({ onSubmit, isPending, categoryId, existingVote }: VoteSubmissionProps) => {
  return (
    <div className="space-y-4">
      {existingVote && (
        <div className="text-sm text-rap-gold font-kaushan">
          You previously rated this rapper {existingVote.rating}/10 in this category.
        </div>
      )}

      <Button
        onClick={onSubmit}
        disabled={isPending || !categoryId}
        className="w-full bg-gradient-to-r from-rap-gold-dark to-rap-gold-light hover:from-rap-gold to-rap-gold-dark text-rap-carbon font-bold font-mogra"
      >
        {isPending 
          ? "Submitting..." 
          : existingVote 
            ? "Update Vote" 
            : "Submit Vote"
        }
      </Button>
    </div>
  );
};

export default VoteSubmission;
