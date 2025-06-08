
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";

interface VoteButtonProps {
  onVote: () => void;
  disabled?: boolean;
  className?: string;
}

const VoteButton = ({ onVote, disabled = false, className = "" }: VoteButtonProps) => {
  return (
    <Button
      onClick={onVote}
      disabled={disabled}
      size="sm"
      className={`bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-bold flex-1 sm:flex-none text-sm sm:text-lg px-3 py-2 sm:px-6 sm:py-3 ${className}`}
    >
      <ThumbsUp className="w-4 h-4 mr-2" />
      Vote
    </Button>
  );
};

export default VoteButton;
