
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare } from "lucide-react";
import VoteWithNoteModal from "./VoteWithNoteModal";

interface VoteButtonProps {
  onVote: () => void;
  onVoteWithNote: (note: string) => void;
  disabled?: boolean;
  className?: string;
}

const VoteButton = ({ onVote, onVoteWithNote, disabled = false, className = "" }: VoteButtonProps) => {
  const [showNoteModal, setShowNoteModal] = useState(false);

  const handleVoteWithNote = (note: string) => {
    onVoteWithNote(note);
    setShowNoteModal(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={onVote}
          disabled={disabled}
          size="sm"
          className={`bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-bold text-lg px-6 py-3 ${className}`}
        >
          <ThumbsUp className="w-4 h-4 mr-2" />
          Vote
        </Button>
        
        <Button
          onClick={() => setShowNoteModal(true)}
          disabled={disabled}
          variant="outline"
          size="sm"
          className="border-rap-gold text-rap-gold hover:bg-rap-gold/20"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
      </div>

      <VoteWithNoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        onSubmit={handleVoteWithNote}
      />
    </>
  );
};

export default VoteButton;
