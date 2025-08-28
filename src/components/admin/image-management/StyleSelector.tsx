import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Palette } from "lucide-react";
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

interface StyleSelectorProps {
  selectedStyle: ImageStyle;
  onStyleChange: (style: ImageStyle) => void;
  completionStats: Record<ImageStyle, number>;
  totalRappers: number;
  sortedStyles: [string, string][];
}

const StyleSelector = ({ selectedStyle, onStyleChange, completionStats, totalRappers, sortedStyles }: StyleSelectorProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-3">
        <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-primary)] flex-shrink-0" />
        <h2 className="text-lg sm:text-xl font-[var(--theme-font-heading)] text-[var(--theme-text)]">Image Style Management</h2>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
        <Select value={selectedStyle} onValueChange={(value) => onStyleChange(value as ImageStyle)}>
          <SelectTrigger className="w-full sm:w-48 bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[var(--theme-surface)] border-[var(--theme-border)]">
            {sortedStyles.map(([style, label]) => (
              <SelectItem key={style} value={style} className="text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/20">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Badge variant="secondary" className="bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border-[var(--theme-primary)]/30 font-[var(--theme-font-body)] text-xs sm:text-sm whitespace-nowrap">
          {completionStats[selectedStyle] || 0} / {totalRappers} completed
        </Badge>
      </div>
    </div>
  );
};

export default StyleSelector;