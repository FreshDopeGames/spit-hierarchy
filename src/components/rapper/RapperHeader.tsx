import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { Badge } from "@/components/ui/badge";
import { Crown, MapPin, Calendar, Music, Instagram, Twitter } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { getZodiacSign, formatBirthdate } from "@/utils/zodiacUtils";
import { useRapperImage } from "@/hooks/useImageStyle";
import { useRapperTags } from "@/hooks/useRapperTags";
import { getContrastTextColor } from "@/lib/utils";

type Rapper = Tables<"rappers"> & {
  top5_count?: number;
};

interface RapperHeaderProps {
  rapper: Rapper;
  onVoteClick: () => void;
}

const RapperHeader = ({
  rapper,
  onVoteClick
}: RapperHeaderProps) => {
  const zodiacSign = getZodiacSign(rapper.birth_month, rapper.birth_day);
  const birthdate = formatBirthdate(rapper.birth_year, rapper.birth_month, rapper.birth_day);
  const { data: imageUrl } = useRapperImage(rapper.id, 'xlarge'); // Use xlarge for profile detail
  const { data: tags = [] } = useRapperTags(rapper.id);

  // Placeholder image from Supabase Storage
  const PLACEHOLDER_IMAGE = "https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images/Rapper_Placeholder_01.png";
  
  // Use rapper image if available and not empty, otherwise use placeholder
  const imageToDisplay = imageUrl && imageUrl.trim() !== "" ? imageUrl : PLACEHOLDER_IMAGE;

  return (
    <div className="space-y-6">
      <Card className="bg-[var(--theme-surface)] border-[var(--theme-secondary)]/40 relative overflow-hidden mb-8">
        {/* Theme accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--theme-secondary)] via-[var(--theme-accent)] to-[var(--theme-primary)]"></div>
        
        <CardContent className="p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Rapper Image */}
            <div className="md:col-span-1">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[var(--theme-secondary)] to-[var(--theme-accent)] flex items-center justify-center relative">
                {/* Loading spinner overlay */}
                <div className="absolute inset-0 flex items-center justify-center" aria-label="Loading avatar">
                  {/* Spinner shown until image fires onLoad */}
                  <div className="w-10 h-10 rounded-full border-2 border-[var(--theme-primary)]/30 border-t-[var(--theme-primary)] animate-spin"></div>
                </div>
                <img 
                  src={imageToDisplay} 
                  alt={rapper.name} 
                  className="w-full h-full object-cover" 
                  onLoad={(e) => {
                    // Hide spinner by removing the overlay
                    const parent = (e.target as HTMLImageElement).parentElement;
                    const overlay = parent?.querySelector('[aria-label="Loading avatar"]');
                    if (overlay) overlay.remove();
                  }}
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    if (target.src !== PLACEHOLDER_IMAGE) {
                      target.src = PLACEHOLDER_IMAGE;
                    }
                  }}
                />
              </div>
            </div>

            {/* Rapper Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-[var(--theme-text)] font-[var(--theme-font-heading)]">{rapper.name}</h1>
                  </div>
                  {rapper.real_name && <p className="text-[var(--theme-textMuted)] text-lg font-[var(--theme-font-body)]">{rapper.real_name}</p>}
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-gradient-to-r from-[hsl(var(--theme-secondary))]/30 to-[hsl(var(--theme-accent))]/30 px-4 py-2 rounded-lg border border-[hsl(var(--theme-border))]/20">
                  <Crown className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
                  <span className="text-[hsl(var(--theme-text))] font-semibold font-[var(--theme-font-body)]">
                    {rapper.top5_count || 0} Top 5{(rapper.top5_count || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-[hsl(var(--theme-accent))]/20 text-[hsl(var(--theme-text))] border-[hsl(var(--theme-accent))]/30 px-4 py-2 font-[var(--theme-font-body)]">
                  {rapper.total_votes || 0} votes
                </Badge>
                {zodiacSign && (
                  <Badge variant="secondary" className="bg-[hsl(var(--theme-secondary))]/20 text-[hsl(var(--theme-text))] border-[hsl(var(--theme-secondary))]/30 px-4 py-2 font-[var(--theme-font-body)]">
                    {zodiacSign}
                  </Badge>
                )}
              </div>

              {/* Location, Birth Info & Zodiac */}
              <div className="flex flex-wrap gap-4 text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)]">
                {rapper.origin && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{rapper.origin}</span>
                  </div>
                )}
                {birthdate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{birthdate}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)] mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="font-[var(--theme-font-body)]"
                        style={{ backgroundColor: tag.color, color: getContrastTextColor(tag.color) }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div className="flex flex-wrap gap-3">
                {rapper.instagram_handle && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-[var(--theme-gradient-primary)] border-2 border-[hsl(var(--theme-background))] text-[hsl(var(--theme-background))] hover:opacity-90 font-[var(--theme-font-body)] font-semibold shadow-lg"
                    asChild
                  >
                    <a 
                      href={`https://instagram.com/${rapper.instagram_handle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </a>
                  </Button>
                )}
                {rapper.twitter_handle && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-[var(--theme-gradient-primary)] border-2 border-[hsl(var(--theme-background))] text-[hsl(var(--theme-background))] hover:opacity-90 font-[var(--theme-font-body)] font-semibold shadow-lg"
                    asChild
                  >
                    <a 
                      href={`https://twitter.com/${rapper.twitter_handle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </a>
                  </Button>
                )}
                {rapper.spotify_id && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-[var(--theme-gradient-primary)] border-2 border-[hsl(var(--theme-background))] text-[hsl(var(--theme-background))] hover:opacity-90 font-[var(--theme-font-body)] font-semibold shadow-lg"
                    asChild
                  >
                    <a 
                      href={`https://open.spotify.com/artist/${rapper.spotify_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Music className="w-4 h-4 mr-2" />
                      Spotify
                    </a>
                  </Button>
                )}
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RapperHeader;
