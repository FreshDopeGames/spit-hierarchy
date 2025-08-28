import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { Badge } from "@/components/ui/badge";
import { Palette, Image } from "lucide-react";
import { useImageStyle } from "@/hooks/useImageStyle";
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
const styleDescriptions: Record<ImageStyle, string> = {
  photo_real: "Realistic photography style",
  comic_book: "Classic comic book art",
  anime: "Japanese animation style",
  video_game: "Gaming character design",
  hardcore: "Gritty street art style",
  minimalist: "Clean, simple design",
  retro: "Vintage hip-hop aesthetic"
};
interface ImageStyleSelectorProps {
  compact?: boolean;
  className?: string;
}
const ImageStyleSelector = ({
  compact = false,
  className = ""
}: ImageStyleSelectorProps) => {
  const {
    currentStyle,
    setImageStyle,
    isUpdating
  } = useImageStyle();
  if (compact) {
    return <div className={`flex items-center gap-2 ${className}`}>
        <Palette className="w-4 h-4 text-[var(--theme-primary)]" />
        <select value={currentStyle} onChange={e => setImageStyle(e.target.value as ImageStyle)} disabled={isUpdating} className="bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] text-sm rounded px-2 py-1 font-[var(--theme-font-body)]">
          {Object.entries(styleLabels).map(([style, label]) => <option key={style} value={style} className="bg-[var(--theme-surface)]">
              {label}
            </option>)}
        </select>
      </div>;
  }
  return <ThemedCard className={className}>
      <ThemedCardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Image className="w-6 h-6 text-[var(--theme-primary)]" />
          <h3 className="text-lg font-[var(--theme-font-heading)] text-[var(--theme-text)]">Image Style</h3>
          <Badge variant="secondary" className="bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border-[var(--theme-border)] font-[var(--theme-font-body)]">
            {styleLabels[currentStyle]}
          </Badge>
        </div>
        
        <p className="text-[var(--theme-textMuted)] text-sm mb-6 font-[var(--theme-font-body)]">
          Choose how you want to see rapper images displayed throughout the platform.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(styleLabels).map(([style, label]) => <ThemedButton key={style} variant={currentStyle === style ? "default" : "outline"} onClick={() => setImageStyle(style as ImageStyle)} disabled={isUpdating} className="p-3 h-auto flex flex-col items-center gap-2">
              <span className="font-semibold text-xs">{label}</span>
              <span className="text-xs opacity-70 text-center leading-tight">
                {styleDescriptions[style as ImageStyle]}
              </span>
            </ThemedButton>)}
        </div>
      </ThemedCardContent>
    </ThemedCard>;
};
export default ImageStyleSelector;