
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
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-r-none border-r border-purple-400/20"
        >
          <ArrowUp className="w-4 h-4 mr-2" />
          Vote
        </Button>

        {/* Dropdown for Vote with Note */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={disabled}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-l-none border-l border-purple-400/20 px-2"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black/90 border-purple-500/30 text-white">
            <DropdownMenuItem
              onClick={() => setShowNoteModal(true)}
              className="hover:bg-purple-500/20 cursor-pointer"
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
