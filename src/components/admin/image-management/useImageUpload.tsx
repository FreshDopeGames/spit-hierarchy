import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

export const useImageUpload = (rappers?: Rapper[]) => {
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

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

      toast.success(`${styleLabels[style]} image uploaded for ${rapper.name}`);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload image");
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
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please select an image smaller than 5MB");
      return;
    }

    handleImageUpload(rapper, style, file);
  };

  return {
    uploadingImages,
    handleFileSelect,
    isUploading: uploadImageMutation.isPending
  };
};
