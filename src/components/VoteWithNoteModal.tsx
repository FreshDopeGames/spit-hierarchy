
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowUp } from "lucide-react";

interface VoteWithNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
}

const VoteWithNoteModal = ({ isOpen, onClose, onSubmit }: VoteWithNoteModalProps) => {
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    onSubmit(note.trim());
    setNote("");
  };

  const handleClose = () => {
    setNote("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black/90 border-purple-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Vote with Note
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vote-note" className="text-gray-300">
              Why are you voting for this rapper? (Optional)
            </Label>
            <Textarea
              id="vote-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Share your thoughts on what makes this rapper stand out..."
              className="bg-black/50 border-purple-500/30 text-white placeholder-gray-400 min-h-[100px]"
              maxLength={500}
            />
            <div className="text-xs text-gray-400 text-right">
              {note.length}/500 characters
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <ArrowUp className="w-4 h-4 mr-2" />
              Submit Vote
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteWithNoteModal;
