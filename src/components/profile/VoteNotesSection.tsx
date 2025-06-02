
import React from "react";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface VoteNotesSectionProps {
  voteNotes: any[];
}

const VoteNotesSection = ({ voteNotes }: VoteNotesSectionProps) => {
  return (
    <div className="bg-carbon-fiber/90 border border-rap-gold/30 rounded-lg p-6 shadow-lg shadow-rap-gold/20">
      <h3 className="text-xl font-mogra text-rap-gold mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Your Vote Notes
      </h3>
      
      {voteNotes && voteNotes.length > 0 ? (
        <div className="space-y-4">
          {voteNotes.map((voteNote) => (
            <div key={voteNote.id} className="bg-rap-carbon/30 border border-rap-gold/20 rounded-lg p-4">
              <div className="flex items-start gap-4">
                {voteNote.rappers?.image_url && (
                  <img
                    src={voteNote.rappers.image_url}
                    alt={voteNote.rappers.name}
                    className="w-12 h-12 rounded-full object-cover border border-rap-gold/30"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-rap-gold font-kaushan">
                      {voteNote.rappers?.name}
                    </span>
                    <span className="text-xs text-rap-smoke">
                      {format(new Date(voteNote.created_at), 'MMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                  <p className="text-rap-platinum font-kaushan">{voteNote.note}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-rap-smoke mx-auto mb-4" />
          <p className="text-rap-smoke font-kaushan">No vote notes yet</p>
          <p className="text-sm text-rap-smoke mt-2 font-kaushan">
            Start voting with notes to see your thoughts here!
          </p>
        </div>
      )}
    </div>
  );
};

export default VoteNotesSection;
