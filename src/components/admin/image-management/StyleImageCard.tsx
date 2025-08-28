import { useState } from "react";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
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
    <ThemedCard className={`transition-all duration-300 ${
      hasImage 
        ? 'border-[var(--theme-success)]/40 hover:border-[var(--theme-success)]/70' 
        : 'border-[var(--theme-error)]/40 hover:border-[var(--theme-error)]/70'
    }`}>
      <ThemedCardContent className="p-3 sm:p-4">
        <div className="space-y-3">
          {/* Image Preview */}
          <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-[var(--theme-background)] to-[var(--theme-backgroundLight)] flex items-center justify-center">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={`${rapper.name} - ${styleLabels[style]}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <Music className="w-8 h-8 sm:w-12 sm:h-12 text-[var(--theme-textMuted)]" />
            )}
          </div>

          {/* Rapper Info */}
          <div className="space-y-1">
            <h4 className="font-[var(--theme-font-heading)] text-[var(--theme-text)] text-xs sm:text-sm leading-tight line-clamp-2">
              {rapper.name}
            </h4>
            {rapper.real_name && (
              <p className="text-[var(--theme-textMuted)] text-xs font-[var(--theme-font-body)] line-clamp-1">
                {rapper.real_name}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <Badge 
            variant="secondary" 
            className={`text-xs font-[var(--theme-font-body)] w-full justify-center py-1 ${
              hasImage 
                ? 'bg-[var(--theme-success)]/20 text-[var(--theme-success)] border-[var(--theme-success)]/30' 
                : 'bg-[var(--theme-error)]/20 text-[var(--theme-error)] border-[var(--theme-error)]/30'
            }`}
          >
            {hasImage ? (
              <>
                <Check className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{styleLabels[style]} Ready</span>
              </>
            ) : (
              <>
                <X className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">No {styleLabels[style]}</span>
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
            <ThemedButton
              className={`w-full min-h-[44px] ${
                hasImage 
                  ? 'bg-[var(--theme-success)]/20 hover:bg-[var(--theme-success)]/30 text-[var(--theme-success)] border-[var(--theme-success)]/30' 
                  : ''
              } font-[var(--theme-font-body)] text-xs sm:text-sm`}
              variant={hasImage ? "outline" : "default"}
              disabled={isUploading}
              size="sm"
            >
              {isUploading ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2 flex-shrink-0" />
              ) : (
                <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
              )}
              <span className="truncate">
                {hasImage ? 'Replace' : 'Upload'} {styleLabels[style]}
              </span>
            </ThemedButton>
          </div>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default StyleImageCard;