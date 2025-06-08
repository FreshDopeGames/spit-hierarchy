
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Check, X, Music } from "lucide-react";
import { Tables, Database } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;
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

interface StyleImageCardProps {
  rapper: Rapper;
  style: ImageStyle;
  imageUrl: string | null;
  isUploading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const StyleImageCard = ({ rapper, style, imageUrl, isUploading, onFileSelect }: StyleImageCardProps) => {
  const hasImage = !!imageUrl;

  return (
    <Card className={`bg-carbon-fiber transition-all duration-300 ${
      hasImage 
        ? 'border-rap-forest/40 hover:border-rap-forest/70' 
        : 'border-rap-burgundy/40 hover:border-rap-burgundy/70'
    }`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Image Preview */}
          <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-rap-carbon to-rap-carbon-light flex items-center justify-center">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={`${rapper.name} - ${styleLabels[style]}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="w-12 h-12 text-rap-platinum/50" />
            )}
          </div>

          {/* Rapper Info */}
          <div className="space-y-1">
            <h4 className="font-mogra text-rap-platinum text-sm leading-tight">
              {rapper.name}
            </h4>
            {rapper.real_name && (
              <p className="text-rap-smoke text-xs font-kaushan">
                {rapper.real_name}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <Badge 
            variant="secondary" 
            className={`text-xs font-kaushan w-full justify-center ${
              hasImage 
                ? 'bg-rap-forest/20 text-rap-forest border-rap-forest/30' 
                : 'bg-rap-burgundy/20 text-rap-burgundy border-rap-burgundy/30'
            }`}
          >
            {hasImage ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                {styleLabels[style]} Ready
              </>
            ) : (
              <>
                <X className="w-3 h-3 mr-1" />
                No {styleLabels[style]}
              </>
            )}
          </Badge>

          {/* Upload Button */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={onFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button
              className={`w-full ${
                hasImage 
                  ? 'bg-rap-forest/20 hover:bg-rap-forest/30 text-rap-forest border-rap-forest/30' 
                  : 'bg-rap-burgundy hover:bg-rap-burgundy-light text-rap-platinum'
              } font-kaushan`}
              variant={hasImage ? "outline" : "default"}
              disabled={isUploading}
              size="sm"
            >
              {isUploading ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {hasImage ? 'Replace' : 'Upload'} {styleLabels[style]}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StyleImageCard;
