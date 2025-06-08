
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
  // Sort styles: those with images first, then those without images
  const sortedStyles = Object.entries(styleLabels).sort(([styleA], [styleB]) => {
    const statsA = completionStats[styleA as ImageStyle] || 0;
    const statsB = completionStats[styleB as ImageStyle] || 0;
    
    // If both have images or both have no images, sort alphabetically
    if ((statsA > 0 && statsB > 0) || (statsA === 0 && statsB === 0)) {
      return styleLabels[styleA as ImageStyle].localeCompare(styleLabels[styleB as ImageStyle]);
    }
    
    // Styles with images come first
    return statsB > 0 ? 1 : -1;
  });

  return (
    <div className="flex items-center gap-4">
      <Palette className="w-6 h-6 text-rap-gold" />
      <h2 className="text-xl font-mogra text-rap-platinum">Image Style Management</h2>
      
      <Select value={selectedStyle} onValueChange={(value) => onStyleChange(value as ImageStyle)}>
        <SelectTrigger className="w-48 bg-carbon-fiber border-rap-gold/30 text-rap-platinum">
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
      
      <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30 font-kaushan">
        {completionStats[selectedStyle] || 0} / {totalRappers} completed
      </Badge>
    </div>
  );
};

export default StyleSelector;
