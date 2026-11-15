import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { useRapperBlogPosts } from "@/hooks/useRapperBlogPosts";

interface RapperBlogMentionsProps {
  rapperId: string;
  rapperSlug: string;
  rapperName: string;
}

/** featured_image_url is either a plain URL or a JSON object of responsive sizes. */
const pickThumbnail = (raw: string | null): string | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed.medium || parsed.thumbnail || parsed.large || parsed.hero || parsed.original || null;
    }
    return typeof parsed === "string" ? parsed : null;
  } catch {
    return raw;
  }
};

const RapperBlogMentions = ({ rapperId, rapperSlug, rapperName }: RapperBlogMentionsProps) => {
  const { data: posts, isLoading } = useRapperBlogPosts(rapperId, rapperSlug);

  if (isLoading || !posts || posts.length === 0) return null;

  return (
    <Card id="slick-talk" className="scroll-mt-20 bg-black border-4 border-[hsl(var(--theme-primary))]">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-[hsl(var(--theme-primary))]" />
          <h2 className="text-2xl font-bold text-[var(--theme-text)] font-[var(--theme-fontPrimary)]">
            Slick Talk Blog
          </h2>
        </div>
        <p className="text-sm text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)] mb-5">
          Articles and reviews featuring {rapperName}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map((post) => {
            const thumb = pickThumbnail(post.featured_image_url);
            return (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-[hsl(var(--theme-primary))]/30 hover:border-[hsl(var(--theme-primary))] bg-[var(--theme-surface)]/20 transition-colors"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-[var(--theme-surface)]">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="w-10 h-10 text-[hsl(var(--theme-primary))]/40" />
                    </div>
                  )}
                  {post.isAlbumReview && (
                    <span className="absolute top-2 left-2 rounded bg-[hsl(var(--theme-primary))] px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[hsl(var(--theme-background))]">
                      Album Review
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-[var(--theme-text)] font-[var(--theme-fontSecondary)] font-semibold leading-snug line-clamp-2 group-hover:text-[hsl(var(--theme-primary))] transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-[var(--theme-textMuted)] line-clamp-2">{post.excerpt}</p>
                  )}
                  <span className="mt-auto pt-3 text-xs text-[var(--theme-textMuted)]">
                    {formatInTimeZone(new Date(post.published_at), "America/Los_Angeles", "MMM d, yyyy")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RapperBlogMentions;
