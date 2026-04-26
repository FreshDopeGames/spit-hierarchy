import { Link } from "react-router-dom";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { useMemo } from "react";

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

interface MemberJournalCardProps {
  entry: {
    id: string;
    title: string;
    excerpt: string | null;
    content?: string | null;
    slug: string;
    created_at: string;
    profiles: {
      username: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  };
}

const MemberJournalCard = ({ entry }: MemberJournalCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch {
      return "Unknown date";
    }
  };

  const username = entry.profiles?.username || "unknown";
  const displayName = entry.profiles?.full_name || username;

  const embedUrl = useMemo(() => {
    const url = extractFirstEmbedUrl(entry.content || "");
    return url && isAllowedEmbedUrl(url) ? url : null;
  }, [entry.content]);

  return (
    <Card className="bg-black border-4 border-[hsl(var(--theme-primary))] overflow-hidden shadow-xl shadow-[var(--theme-primary)]/20 hover:shadow-[var(--theme-primary)]/40 transition-all duration-300 group">
      <CardContent className="p-6">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border border-[var(--theme-primary)]/30 font-[var(--theme-fontSecondary)]">
            <BookOpen className="w-3 h-3 mr-1" />
            Member Journal
          </Badge>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)] text-sm mb-3">
          <User className="w-3 h-3" />
          <Link to={`/user/${username}`} className="hover:text-[var(--theme-primary)] transition-colors">
            {displayName}
          </Link>
          <span>•</span>
          <Calendar className="w-3 h-3" />
          <span>{formatDate(entry.created_at)}</span>
        </div>

        {/* Title */}
        <Link to={`/journal/${username}/${entry.slug}`}>
          <h3 className="font-[var(--theme-fontPrimary)] text-[var(--theme-text)] hover:text-[var(--theme-primary)] transition-colors cursor-pointer mb-3 leading-tight text-2xl">
            {entry.title}
          </h3>
        </Link>

        {/* Embed preview */}
        {embedUrl && (
          <div
            className="relative w-full mb-4 overflow-hidden rounded-md bg-black"
            style={{ paddingBottom: "56.25%" }}
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

        {/* Excerpt */}
        <p className="text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)] leading-relaxed mb-4 line-clamp-3">
          {entry.excerpt || entry.title}
        </p>

        {/* Read More */}
        <Link to={`/journal/${username}/${entry.slug}`}>
          <Button
            variant="outline"
            className="bg-[var(--theme-backgroundLight)] border-2 border-[var(--theme-primary)]/50 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/20 group"
          >
            Read More
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default MemberJournalCard;
