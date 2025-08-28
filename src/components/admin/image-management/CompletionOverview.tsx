import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { Database } from "@/integrations/supabase/types";

type ImageStyle = Database["public"]["Enums"]["image_style"];

const styleLabels: Record<ImageStyle, string> = {
  photo_real: "Photo Real",
  comic_book: "Comic Book",
  anime: "Anime", 
  video_game: "Video Game",
  hardcore: "Hardcore",
  minimalist: "Minimalist",
  retro: "Retro"
};

interface CompletionOverviewProps {
  completionStats: Record<ImageStyle, number>;
}

const CompletionOverview = ({ completionStats }: CompletionOverviewProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
      {Object.entries(styleLabels).map(([style, label]) => (
        <ThemedCard key={style}>
          <ThemedCardContent className="p-2 sm:p-3 text-center">
            <div className="text-base sm:text-lg font-bold text-[var(--theme-primary)]">{completionStats[style as ImageStyle] || 0}</div>
            <div className="text-xs sm:text-sm text-[var(--theme-text)] font-[var(--theme-font-body)] leading-tight">{label}</div>
          </ThemedCardContent>
        </ThemedCard>
      ))}
    </div>
  );
};

export default CompletionOverview;