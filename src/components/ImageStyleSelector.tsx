
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const ImageStyleSelector = ({ compact = false, className = "" }: ImageStyleSelectorProps) => {
  const { currentStyle, setImageStyle, isUpdating } = useImageStyle();

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Palette className="w-4 h-4 text-rap-gold" />
        <select
          value={currentStyle}
          onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
          disabled={isUpdating}
          className="bg-carbon-fiber border border-rap-gold/30 text-rap-platinum text-sm rounded px-2 py-1 font-kaushan"
        >
          {Object.entries(styleLabels).map(([style, label]) => (
            <option key={style} value={style} className="bg-carbon-fiber">
              {label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <Card className={`bg-carbon-fiber border-rap-gold/30 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Image className="w-6 h-6 text-rap-gold" />
          <h3 className="text-lg font-mogra text-rap-platinum">Image Style</h3>
          <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30 font-kaushan">
            {styleLabels[currentStyle]}
          </Badge>
        </div>
        
        <p className="text-rap-smoke text-sm mb-6 font-kaushan">
          Choose how you want to see rapper images displayed throughout the platform.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(styleLabels).map(([style, label]) => (
            <Button
              key={style}
              variant={currentStyle === style ? "default" : "outline"}
              onClick={() => setImageStyle(style as ImageStyle)}
              disabled={isUpdating}
              className={`p-3 h-auto flex flex-col items-center gap-2 font-kaushan ${
                currentStyle === style
                  ? "bg-gradient-to-r from-rap-gold to-rap-gold-light text-rap-carbon"
                  : "border-rap-gold/30 text-rap-platinum hover:bg-rap-gold/10"
              }`}
            >
              <span className="font-semibold text-xs">{label}</span>
              <span className="text-xs opacity-70 text-center leading-tight">
                {styleDescriptions[style as ImageStyle]}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageStyleSelector;
