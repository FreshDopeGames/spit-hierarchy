import { ExternalLink, Newspaper } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { useRapperMediaMentions } from "@/hooks/useRapperMediaMentions";

interface RapperMediaMentionsProps {
  rapperId: string;
  rapperName: string;
}

const RapperMediaMentions = ({ rapperId, rapperName }: RapperMediaMentionsProps) => {
  const { data: mentions, isLoading } = useRapperMediaMentions(rapperId);

  if (isLoading || !mentions || mentions.length === 0) return null;

  return (
    <Card id="in-the-news" className="scroll-mt-20 bg-black border-4 border-[hsl(var(--theme-primary))]">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <Newspaper className="w-6 h-6 text-[hsl(var(--theme-primary))]" />
          <h2 className="text-2xl font-bold text-[var(--theme-text)] font-[var(--theme-fontPrimary)]">
            In The News
          </h2>
        </div>
        <p className="text-sm text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)] mb-5">
          Recent hip-hop media headlines mentioning {rapperName}
        </p>

        <ul className="space-y-3">
          {mentions.map((m) => (
            <li key={m.id}>
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group flex items-start gap-3 rounded-lg border border-[hsl(var(--theme-primary))]/30 hover:border-[hsl(var(--theme-primary))] bg-[var(--theme-surface)]/20 p-3 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mt-1 shrink-0 text-[hsl(var(--theme-primary))]" />
                <span className="min-w-0">
                  <span className="block text-[var(--theme-text)] font-[var(--theme-fontSecondary)] leading-snug group-hover:text-[hsl(var(--theme-primary))] transition-colors">
                    {m.title}
                  </span>
                  <span className="block text-xs text-[var(--theme-textMuted)] mt-1">
                    {m.source} ·{" "}
                    {formatDistanceToNow(new Date(m.published_at), { addSuffix: true })}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RapperMediaMentions;
