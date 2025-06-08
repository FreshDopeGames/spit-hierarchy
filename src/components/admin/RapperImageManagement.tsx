
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Check, X, Music, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tables, Database } from "@/integrations/supabase/types";

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
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>("photo_real");
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const uploadImageMutation = useMutation({
    mutationFn: async ({ rapperId, style, file }: { rapperId: string; style: ImageStyle; file: File }) => {
      // Create a file name with rapper's name and style
      const rapper = rappers?.find(r => r.id === rapperId);
      const sanitizedName = rapper?.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown';
      const fileExt = file.name.split('.').pop();
      const fileName = `${sanitizedName}-${style}-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('rapper-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('rapper-images')
        .getPublicUrl(uploadData.path);

      // Insert or update rapper image
      const { error: insertError } = await supabase
        .from("rapper_images")
        .upsert({
          rapper_id: rapperId,
          style: style,
          image_url: publicUrl
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rapper-images"] });
      queryClient.invalidateQueries({ queryKey: ["admin-rappers-images"] });
      queryClient.invalidateQueries({ queryKey: ["rappers"] });
    }
  });

  const handleImageUpload = async (rapper: Rapper, style: ImageStyle, file: File) => {
    const uploadKey = `${rapper.id}-${style}`;
    
    try {
      setUploadingImages(prev => new Set(prev).add(uploadKey));

      await uploadImageMutation.mutateAsync({
        rapperId: rapper.id,
        style,
        file
      });

      toast({
        title: "Success",
        description: `${styleLabels[style]} image uploaded for ${rapper.name}`,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(uploadKey);
        return newSet;
      });
    }
  };

  const handleFileSelect = (rapper: Rapper, style: ImageStyle, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    handleImageUpload(rapper, style, file);
  };

  const getImageForStyle = (rapperId: string, style: ImageStyle): string | null => {
    return rapperImages?.find(img => img.rapper_id === rapperId && img.style === style)?.image_url || null;
  };

  const getCompletionStats = () => {
    if (!rappers || !rapperImages) return {};
    
    const stats: Record<ImageStyle, number> = {} as Record<ImageStyle, number>;
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
        <div className="flex items-center gap-4">
          <Palette className="w-6 h-6 text-rap-gold" />
          <h2 className="text-xl font-mogra text-rap-platinum">Image Style Management</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedStyle} onValueChange={(value) => setSelectedStyle(value as ImageStyle)}>
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
            {completionStats[selectedStyle] || 0} / {rappers?.length || 0} completed
          </Badge>
        </div>

        {/* Completion Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(styleLabels).map(([style, label]) => (
            <Card key={style} className="bg-carbon-fiber border-rap-gold/30">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-rap-gold">{completionStats[style as ImageStyle] || 0}</div>
                <div className="text-xs text-rap-platinum font-kaushan">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
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
                onFileSelect={(file) => handleFileSelect(rapper, selectedStyle, file)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
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

export default RapperImageManagement;
