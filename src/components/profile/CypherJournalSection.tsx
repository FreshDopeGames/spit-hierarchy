import React from "react";
import { Mic2, Music, ThumbsUp, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useUserCypherJournal } from "@/hooks/useUserCypherJournal";
import { TextSkeleton } from "@/components/ui/skeleton";

interface CypherJournalSectionProps {
  userId: string;
}

const CypherJournalSection = ({ userId }: CypherJournalSectionProps) => {
  const { data, isLoading } = useUserCypherJournal(userId);

  if (isLoading) {
    return (
      <div className="bg-black border-4 border-[hsl(var(--theme-primary))] shadow-lg shadow-[hsl(var(--theme-primary))]/20 rounded-lg p-6">
        <h3 className="text-lg sm:text-xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] text-center mb-4">
          Cypher Journal
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <TextSkeleton key={i} width="w-full" height="h-20" />
          ))}
        </div>
      </div>
    );
  }

  // Don't render if user has no cypher verses
  if (!data || data.verses.length === 0) {
    return (
      <div className="bg-black border-4 border-[hsl(var(--theme-primary))] shadow-lg shadow-[hsl(var(--theme-primary))]/20 rounded-lg p-6">
        <h3 className="text-lg sm:text-xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] text-center mb-4">
          Cypher Journal
        </h3>
        <div className="text-center py-8">
          <Mic2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">
            No verses dropped yet. Hit the cypher and show what you got!
          </p>
          <Link 
            to="/cypher"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--theme-primary))] text-primary-foreground hover:opacity-90 transition-opacity font-medium"
          >
            <Music className="h-4 w-4" />
            Drop Your First Verse
          </Link>
        </div>
      </div>
    );
  }

  const { verses, stats } = data;

  return (
    <div className="bg-black border-4 border-[hsl(var(--theme-primary))] shadow-lg shadow-[hsl(var(--theme-primary))]/20 rounded-lg p-6">
      {/* Header */}
      <h3 className="text-lg sm:text-xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] text-center mb-4">
        Cypher Journal
      </h3>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-lg bg-[hsl(var(--theme-surface))]/50 border border-[hsl(var(--theme-primary))]/20">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Music className="h-4 w-4 text-[hsl(var(--theme-primary))]" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.totalVerses}</div>
          <div className="text-xs text-muted-foreground">Cypher Verses</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ThumbsUp className="h-4 w-4 text-[hsl(var(--theme-primary))]" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.totalBars}</div>
          <div className="text-xs text-muted-foreground">Total Bars</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--theme-primary))]" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.averageBarsPerVerse}</div>
          <div className="text-xs text-muted-foreground">Avg Bars/Verse</div>
        </div>
      </div>

      {/* Verses List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {verses.map((verse) => (
          <div 
            key={verse.id} 
            className="bg-[hsl(var(--theme-surface))] border-2 border-[hsl(var(--theme-primary))]/30 rounded-lg p-4 hover:border-[hsl(var(--theme-primary))]/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Verse text with preserved line breaks */}
                <p className="text-sm text-foreground whitespace-pre-wrap break-words mb-2">
                  {verse.comment_text}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{format(new Date(verse.created_at), 'MMM d, yyyy')}</span>
                  <Link 
                    to="/cypher"
                    className="hover:text-[hsl(var(--theme-primary))] transition-colors"
                  >
                    View in Cypher →
                  </Link>
                </div>
              </div>
              {/* Bars count badge */}
              <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full bg-[hsl(var(--theme-primary))]/10 text-[hsl(var(--theme-primary))]">
                <ThumbsUp className="h-3 w-3" />
                <span className="text-sm font-medium">{verse.bars_count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Link to cypher */}
      <div className="mt-4 pt-4 border-t border-[hsl(var(--theme-primary))]/20 text-center">
        <Link 
          to="/cypher"
          className="text-sm text-muted-foreground hover:text-[hsl(var(--theme-primary))] transition-colors"
        >
          Continue your legacy in the Community Cypher →
        </Link>
      </div>
    </div>
  );
};

export default CypherJournalSection;
