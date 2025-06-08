
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";
import { Tables, Database } from "@/integrations/supabase/types";
import StyleSelector from "./image-management/StyleSelector";
import CompletionOverview from "./image-management/CompletionOverview";
import StyleImageCard from "./image-management/StyleImageCard";
import { useImageUpload } from "./image-management/useImageUpload";

type Rapper = Tables<"rappers">;
type ImageStyle = Database["public"]["Enums"]["image_style"];
type RapperImage = Tables<"rapper_images">;

const styleLabels: Record<ImageStyle, string> = {
  photo_real: "Photo Real",
  comic_book: "Comic Book",
  anime: "Anime", 
  video_game: "Video Game",
  hardcore: "Hardcore",
  minimalist: "Minimalist",
  retro: "Retro"
};

const RapperImageManagement = () => {
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>("photo_real");

  const { data: rappers, isLoading: rappersLoading } = useQuery({
    queryKey: ["admin-rappers-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rappers")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: rapperImages, isLoading: imagesLoading } = useQuery({
    queryKey: ["rapper-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rapper_images")
        .select("*");
      
      if (error) throw error;
      return data;
    }
  });

  const { uploadingImages, handleFileSelect } = useImageUpload(rappers);

  const getImageForStyle = (rapperId: string, style: ImageStyle): string | null => {
    return rapperImages?.find(img => img.rapper_id === rapperId && img.style === style)?.image_url || null;
  };

  const getCompletionStats = (): Record<ImageStyle, number> => {
    const defaultStats: Record<ImageStyle, number> = {
      photo_real: 0,
      comic_book: 0,
      anime: 0,
      video_game: 0,
      hardcore: 0,
      minimalist: 0,
      retro: 0
    };

    if (!rappers || !rapperImages) return defaultStats;
    
    const stats: Record<ImageStyle, number> = { ...defaultStats };
    Object.keys(styleLabels).forEach(style => {
      stats[style as ImageStyle] = rapperImages.filter(img => img.style === style).length;
    });
    
    return stats;
  };

  const completionStats = getCompletionStats();

  if (rappersLoading || imagesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-rap-carbon-light rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-rap-carbon-light rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Style Selector and Stats */}
      <div className="space-y-4">
        <StyleSelector
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
          completionStats={completionStats}
          totalRappers={rappers?.length || 0}
        />

        {/* Completion Overview */}
        <CompletionOverview completionStats={completionStats} />
      </div>

      {/* Rappers Grid for Selected Style */}
      <Card className="bg-carbon-fiber border-rap-gold/30">
        <CardHeader>
          <CardTitle className="text-rap-gold font-mogra flex items-center gap-2">
            <Palette className="w-5 h-5" />
            {styleLabels[selectedStyle]} Images ({completionStats[selectedStyle] || 0}/{rappers?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rappers?.map((rapper) => (
              <StyleImageCard
                key={`${rapper.id}-${selectedStyle}`}
                rapper={rapper}
                style={selectedStyle}
                imageUrl={getImageForStyle(rapper.id, selectedStyle)}
                isUploading={uploadingImages.has(`${rapper.id}-${selectedStyle}`)}
                onFileSelect={(event) => handleFileSelect(rapper, selectedStyle, event)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RapperImageManagement;
