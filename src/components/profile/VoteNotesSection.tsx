import React from "react";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";
interface VoteNotesSectionProps {
  voteNotes: any[];
}
const VoteNotesSection = ({
  voteNotes
}: VoteNotesSectionProps) => {
  if (!voteNotes || voteNotes.length === 0) {
    return;
  }
  return <div className="bg-card rounded-lg p-6 border">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Vote Notes ({voteNotes.length})</h3>
      </div>
      <div className="space-y-4">
        {voteNotes.map((note, index) => <div key={index} className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{note.rappers?.name || 'Unknown Rapper'}</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(note.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{note.note}</p>
              </div>
            </div>
          </div>)}
      </div>
    </div>;
};
export default VoteNotesSection;