
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
}

const StyleSelector = ({ selectedStyle, onStyleChange, completionStats, totalRappers }: StyleSelectorProps) => {
  return (
    <div className="flex items-center gap-4">
      <Palette className="w-6 h-6 text-rap-gold" />
      <h2 className="text-xl font-mogra text-rap-platinum">Image Style Management</h2>
      
      <Select value={selectedStyle} onValueChange={(value) => onStyleChange(value as ImageStyle)}>
        <SelectTrigger className="w-48 bg-carbon-fiber border-rap-gold/30 text-rap-platinum">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-carbon-fiber border-rap-gold/30">
          {Object.entries(styleLabels).map(([style, label]) => (
            <SelectItem key={style} value={style} className="text-rap-platinum hover:bg-rap-gold/20">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30 font-kaushan">
        {completionStats[selectedStyle] || 0} / {totalRappers} completed
      </Badge>
    </div>
  );
};

export default StyleSelector;
