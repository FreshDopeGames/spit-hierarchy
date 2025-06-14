
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
        <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-rap-gold flex-shrink-0" />
        <h2 className="text-lg sm:text-xl font-mogra text-rap-platinum">Image Style Management</h2>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
        <Select value={selectedStyle} onValueChange={(value) => onStyleChange(value as ImageStyle)}>
          <SelectTrigger className="w-full sm:w-48 bg-carbon-fiber border-rap-gold/30 text-rap-platinum">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-carbon-fiber border-rap-gold/30">
            {sortedStyles.map(([style, label]) => (
              <SelectItem key={style} value={style} className="text-rap-platinum hover:bg-rap-gold/20">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30 font-kaushan text-xs sm:text-sm whitespace-nowrap">
          {completionStats[selectedStyle] || 0} / {totalRappers} completed
        </Badge>
      </div>
    </div>
  );
};

export default StyleSelector;
