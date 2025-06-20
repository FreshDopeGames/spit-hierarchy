
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ImageIcon, Loader2 } from "lucide-react";
import { Tables, Database } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;
type ImageStyle = Database["public"]["Enums"]["image_style"];

interface RapperAvatarUploadProps {
  rapper: Rapper;
}

const styleLabels: Record<ImageStyle, string> = {
  photo_real: "Photo Real",
  comic_book: "Comic Book",
  anime: "Anime", 
  video_game: "Video Game",
  hardcore: "Hardcore",
  minimalist: "Minimalist",
  retro: "Retro"
};

const RapperAvatarUpload = ({ rapper }: RapperAvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>("photo_real");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, style }: { file: File; style: ImageStyle }) => {
      // Create a file name with rapper's name and style
      const sanitizedName = rapper.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
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

      // Insert or update rapper image in the rapper_images table
      const { error: insertError } = await supabase
        .from("rapper_images")
        .upsert({
          rapper_id: rapper.id,
          style: style,
          image_url: publicUrl
        });

      if (insertError) throw insertError;

      // Also update the legacy image_url field if this is photo_real style for backwards compatibility
      if (style === "photo_real") {
        const { error: updateError } = await supabase
          .from("rappers")
          .update({ image_url: publicUrl })
          .eq("id", rapper.id);

        if (updateError) throw updateError;
      }

      return publicUrl;
    },
    onSuccess: () => {
      // Invalidate all relevant queries to ensure images update everywhere
      queryClient.invalidateQueries({ queryKey: ["admin-rappers"] });
      queryClient.invalidateQueries({ queryKey: ["rapper-images"] });
      queryClient.invalidateQueries({ queryKey: ["rappers"] });
      queryClient.invalidateQueries({ queryKey: ["rapper-image", rapper.id] });
      
      // Specifically invalidate the image for this rapper and style
      queryClient.invalidateQueries({ queryKey: ["rapper-image", rapper.id, selectedStyle] });
      
      toast({
        title: "Success",
        description: `${styleLabels[selectedStyle]} avatar uploaded for ${rapper.name}`,
      });
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true);
    try {
      await uploadMutation.mutateAsync({ file, style: selectedStyle });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="bg-carbon-fiber border border-rap-gold/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-rap-gold font-ceviche text-lg flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Avatar Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rapper.image_url && (
          <div className="flex justify-center">
            <img 
              src={rapper.image_url} 
              alt={rapper.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-rap-gold/30"
            />
          </div>
        )}
        
        <div className="space-y-3">
          {/* Style Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-rap-platinum">Image Style</label>
            <Select value={selectedStyle} onValueChange={(value: ImageStyle) => setSelectedStyle(value)}>
              <SelectTrigger className="bg-rap-carbon-light border-rap-gold/30 text-rap-platinum">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-rap-carbon-light border-rap-gold/30">
                {Object.entries(styleLabels).map(([style, label]) => (
                  <SelectItem 
                    key={style} 
                    value={style}
                    className="text-rap-platinum hover:bg-rap-gold/10"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id={`avatar-upload-${rapper.id}`}
            />
            <label htmlFor={`avatar-upload-${rapper.id}`}>
              <Button 
                type="button"
                variant="outline" 
                className="w-full cursor-pointer border-rap-gold/30 text-rap-platinum hover:bg-rap-gold/10"
                disabled={uploading}
                asChild
              >
                <span className="flex items-center gap-2">
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploading ? 'Uploading...' : `Upload ${styleLabels[selectedStyle]} Avatar`}
                </span>
              </Button>
            </label>
            <p className="text-xs text-rap-smoke text-center">
              Max 5MB. Recommended: 1:1 aspect ratio (square images)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RapperAvatarUpload;
