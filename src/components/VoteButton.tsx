
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import VoteWithNoteModal from "./VoteWithNoteModal";

interface VoteButtonProps {
  onVote: () => void;
  onVoteWithNote: (note: string) => void;
  disabled?: boolean;
  className?: string;
  rapperId?: string;
  rankingId?: string;
}

const VoteButton = ({ 
  onVote, 
  onVoteWithNote, 
  disabled = false, 
  className = "",
  rapperId,
  rankingId
}: VoteButtonProps) => {
  const [showNoteModal, setShowNoteModal] = useState(false);

  const handleVoteWithNote = (note: string) => {
    onVoteWithNote(note);
    setShowNoteModal(false);
  };

  return (
    <>
      <div className={`flex ${className}`}>
        {/* Main Vote Button */}
        <Button
          onClick={onVote}
          disabled={disabled}
          className="bg-gradient-to-r from-rap-burgundy to-rap-forest hover:from-rap-burgundy-light hover:to-rap-forest-light rounded-r-none border-r border-rap-gold/20 font-kaushan shadow-lg shadow-rap-burgundy/30"
        >
          <ArrowUp className="w-4 h-4 mr-2" />
          Vote
        </Button>

        {/* Dropdown for Vote with Note */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={disabled}
              className="bg-gradient-to-r from-rap-burgundy to-rap-forest hover:from-rap-burgundy-light hover:to-rap-forest-light rounded-l-none border-l border-rap-gold/20 px-2 shadow-lg shadow-rap-burgundy/30"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-carbon-fiber border-rap-gold/30 text-rap-silver">
            <DropdownMenuItem
              onClick={() => setShowNoteModal(true)}
              className="hover:bg-rap-burgundy/20 cursor-pointer font-kaushan"
            >
              Vote with Note
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <VoteWithNoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        onSubmit={handleVoteWithNote}
        rapperId={rapperId}
        rankingId={rankingId}
      />
    </>
  );
};

export default VoteButton;
