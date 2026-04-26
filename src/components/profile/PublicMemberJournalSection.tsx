import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { TextSkeleton } from "@/components/ui/skeleton";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useMemo } from "react";

interface PublicMemberJournalSectionProps {
  userId: string;
  username: string;
}

interface PublicJournalEntry {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  slug: string;
  created_at: string;
}

// Extract the first iframe src (e.g. YouTube embed) from raw content/markdown.
const extractFirstEmbedUrl = (content: string): string | null => {
  if (!content) return null;
  const match = content.match(/<iframe[^>]*\ssrc=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
};

const isAllowedEmbedUrl = (url: string): boolean => {
  try {
    const u = new URL(url, window.location.origin);
    const allowed = [
      "youtube.com",
      "www.youtube.com",
      "youtube-nocookie.com",
      "www.youtube-nocookie.com",
      "player.vimeo.com",
      "w.soundcloud.com",
      "open.spotify.com",
    ];
    return allowed.includes(u.hostname);
  } catch {
    return false;
  }
};

const JournalPreview = ({ entry, username }: { entry: PublicJournalEntry; username: string }) => {
  const embedUrl = useMemo(() => {
    const url = extractFirstEmbedUrl(entry.content);
    return url && isAllowedEmbedUrl(url) ? url : null;
  }, [entry.content]);

  const sanitizedExcerpt = useMemo(() => {
    if (!entry.excerpt) return null;
    const html = marked.parse(entry.excerpt, { async: false }) as string;
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "br", "p"], ALLOWED_ATTR: ["href"] });
  }, [entry.excerpt]);

  return (
    <Link
      to={`/journal/${username}/${entry.slug}`}
      className="block bg-[hsl(var(--theme-surface))] border-2 border-[hsl(var(--theme-primary))]/30 rounded-lg p-4 hover:border-[hsl(var(--theme-primary))]/50 transition-colors"
    >
      <h4 className="font-bold text-foreground font-[var(--theme-font-heading)] truncate mb-1">
        {entry.title}
      </h4>
      <span className="block text-xs text-[hsl(var(--theme-primary))] font-bold mb-2">
        {format(new Date(entry.created_at), "MMM d, yyyy")}
      </span>
      {embedUrl && (
        <div
          className="relative w-full mb-2 overflow-hidden rounded-md bg-black max-w-[640px] aspect-video"
          onClick={(e) => e.stopPropagation()}
        >
          <iframe
            src={embedUrl}
            title={entry.title}
            className="absolute inset-0 w-full h-full"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}
      {sanitizedExcerpt && (
        <div
          className="text-sm text-[hsl(var(--theme-textMuted))] line-clamp-2 mb-1 prose prose-sm prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedExcerpt }}
        />
      )}
    </Link>
  );
};

const PublicMemberJournalSection = ({ userId, username }: PublicMemberJournalSectionProps) => {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["public-member-journal", userId],
    queryFn: async (): Promise<PublicJournalEntry[]> => {
      const { data, error } = await supabase
        .from("member_journal_entries")
        .select("id, title, excerpt, content, slug, created_at")
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

      <div className="space-y-3 max-h-[40rem] overflow-y-auto">
        {entries.map((entry) => (
          <JournalPreview key={entry.id} entry={entry} username={username} />
        ))}
      </div>
    </div>
  );
};

export default PublicMemberJournalSection;
