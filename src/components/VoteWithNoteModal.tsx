
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
import { toast } from "sonner";

interface VoteWithNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
  rapperId?: string;
  rankingId?: string;
}

const VoteWithNoteModal = ({ isOpen, onClose, onSubmit, rapperId, rankingId }: VoteWithNoteModalProps) => {
  const [note, setNote] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const saveVoteNoteMutation = useMutation({
    mutationFn: async ({ note, rapperId, rankingId }: { note: string; rapperId: string; rankingId: string }) => {
      if (!user) throw new Error("Must be logged in to save vote notes");

      const { data, error } = await supabase
        .from("vote_notes")
        .insert({
          user_id: user.id,
          rapper_id: rapperId,
          ranking_id: rankingId,
          note: note.trim()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vote-notes"] });
      toast.success("Your vote and note have been recorded.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save vote note");
    }
  });

  const handleSubmit = async () => {
    const trimmedNote = note.trim();
    
    // Call the original onSubmit for the vote
    onSubmit(trimmedNote);
    
    // Save the note to database if we have the required info and note is not empty
    if (user && rapperId && rankingId && trimmedNote) {
      await saveVoteNoteMutation.mutateAsync({
        note: trimmedNote,
        rapperId,
        rankingId
      });
    }
    
    setNote("");
  };

  const handleClose = () => {
    setNote("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[var(--theme-background)]/90 border-[var(--theme-border)]/30 text-[var(--theme-text)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] bg-clip-text text-transparent">
            Vote with Note
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vote-note" className="text-[var(--theme-textMuted)]">
              Why are you voting for this rapper? (Optional)
            </Label>
            <Textarea
              id="vote-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Share your thoughts on what makes this rapper stand out..."
              className="bg-[var(--theme-background)]/50 border-[var(--theme-border)]/30 text-[var(--theme-text)] placeholder-[var(--theme-textMuted)] min-h-[100px]"
              maxLength={500}
            />
            <div className="text-xs text-[var(--theme-textMuted)] text-right">
              {note.length}/500 characters
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-[var(--theme-border)]/30 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saveVoteNoteMutation.isPending}
              className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] hover:from-[var(--theme-primaryDark)] hover:to-[var(--theme-accentDark)]"
            >
              <ArrowUp className="w-4 h-4 mr-2" />
              {saveVoteNoteMutation.isPending ? "Submitting..." : "Submit Vote"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteWithNoteModal;
