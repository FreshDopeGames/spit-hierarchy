import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { TextSkeleton } from "@/components/ui/skeleton";

interface PublicMemberJournalSectionProps {
  userId: string;
  username: string;
}

interface PublicJournalEntry {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  created_at: string;
}

const PublicMemberJournalSection = ({ userId, username }: PublicMemberJournalSectionProps) => {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["public-member-journal", userId],
    queryFn: async (): Promise<PublicJournalEntry[]> => {
      const { data, error } = await supabase
        .from("member_journal_entries")
        .select("id, title, excerpt, slug, created_at")
        .eq("user_id", userId)
        .eq("is_public", true)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="bg-black border-4 border-[hsl(var(--theme-primary))] shadow-lg shadow-[hsl(var(--theme-primary))]/20 rounded-lg p-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-[hsl(var(--theme-primary))]" />
          <h3 className="text-lg font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
            Hip-Hop Journal
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <TextSkeleton key={i} width="w-full" height="h-16" />
          ))}
        </div>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return null;
  }

  return (
    <div className="bg-black border-4 border-[hsl(var(--theme-primary))] shadow-lg shadow-[hsl(var(--theme-primary))]/20 rounded-lg p-6 mb-6 sm:mb-8">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-[hsl(var(--theme-primary))]" />
        <h3 className="text-lg font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
          {username}'s Hip-Hop Journal
        </h3>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {entries.map((entry) => (
          <Link
            key={entry.id}
            to={`/journal/${username}/${entry.slug}`}
            className="block bg-[hsl(var(--theme-surface))] border-2 border-[hsl(var(--theme-primary))]/30 rounded-lg p-4 hover:border-[hsl(var(--theme-primary))]/50 transition-colors"
          >
            <h4 className="font-bold text-foreground font-[var(--theme-font-heading)] truncate mb-1">
              {entry.title}
            </h4>
            {entry.excerpt && (
              <p className="text-sm text-[hsl(var(--theme-textMuted))] line-clamp-2 mb-1">
                {entry.excerpt}
              </p>
            )}
            <span className="text-xs text-[hsl(var(--theme-primary))] font-bold">
              {format(new Date(entry.created_at), "MMM d, yyyy")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PublicMemberJournalSection;
