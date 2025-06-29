
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, ImageIcon, Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { generateRapperImageSizes } from "@/utils/imageUtils";

type Rapper = Tables<"rappers">;

interface RapperAvatarUploadProps {
  rapper: Rapper;
}

const RapperAvatarUpload = ({ rapper }: RapperAvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Create a sanitized name for the rapper folder
      const sanitizedName = rapper.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // Convert file to blob for processing
      const blob = new Blob([file], { type: file.type });
      
      // Generate multiple resolutions
      console.log('Generating rapper image sizes...');
      const resizedImages = await generateRapperImageSizes(blob);
      console.log('Generated sizes:', resizedImages.map(img => img.name));

      // Upload original image
      const originalFileName = `${sanitizedName}/original.jpg`;
      const originalFile = new File([blob], originalFileName, { type: 'image/jpeg' });

      console.log('Uploading original to:', originalFileName);
      const { error: originalUploadError } = await supabase.storage
        .from('rapper-images')
        .upload(originalFileName, originalFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (originalUploadError) throw originalUploadError;

      // Upload resized versions
      console.log('Uploading resized versions...');
      await Promise.all(
        resizedImages.map(async ({ name, blob: resizedBlob }) => {
          const fileName = `${sanitizedName}/${name}.jpg`;
          const file = new File([resizedBlob], fileName, { type: 'image/jpeg' });
          
          console.log(`Uploading ${name} to:`, fileName);
          const { error } = await supabase.storage
            .from('rapper-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (error) {
            console.error(`Upload failed for ${name}:`, error);
            throw error;
          }
        })
      );

      // Store the base path (folder name) in rapper_images table
      const basePath = sanitizedName;

      // Check if a comic_book style image already exists for this rapper
      const { data: existingImage } = await supabase
        .from("rapper_images")
        .select("id")
        .eq("rapper_id", rapper.id)
        .eq("style", "comic_book")
        .single();

      if (existingImage) {
        // Update existing record with base path
        const { error: updateError } = await supabase
          .from("rapper_images")
          .update({ image_url: basePath })
          .eq("id", existingImage.id);

        if (updateError) throw updateError;
      } else {
        // Insert new record with base path
        const { error: insertError } = await supabase
          .from("rapper_images")
          .insert({
            rapper_id: rapper.id,
            style: "comic_book",
            image_url: basePath
          });

        if (insertError) throw insertError;
      }

      // Update the legacy image_url field for backwards compatibility (full URL to original)
      const fullOriginalUrl = `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images/${originalFileName}`;
      const { error: updateError } = await supabase
        .from("rappers")
        .update({ image_url: fullOriginalUrl })
        .eq("id", rapper.id);

      if (updateError) throw updateError;

      return basePath;
    },
    onSuccess: () => {
      // Invalidate all relevant queries to ensure images update everywhere
      queryClient.invalidateQueries({ queryKey: ["admin-rappers"] });
      queryClient.invalidateQueries({ queryKey: ["rapper-images"] });
      queryClient.invalidateQueries({ queryKey: ["rappers"] });
      queryClient.invalidateQueries({ queryKey: ["rapper-image", rapper.id] });
      
      toast.success(`Avatar uploaded for ${rapper.name}`);
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload avatar");
    }
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="bg-carbon-fiber border border-rap-gold/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-rap-gold font-ceviche text-lg font-normal flex items-center gap-2">
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
              className="w-64 h-64 object-cover border-2 border-rap-gold/30"
            />
          </div>
        )}
        
        <div className="space-y-3">
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
                className="w-full cursor-pointer bg-rap-gold text-rap-charcoal border-rap-gold hover:bg-rap-gold/90"
                disabled={uploading}
                asChild
              >
                <span className="flex items-center gap-2">
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploading ? 'Uploading...' : 'Upload Avatar'}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RapperAvatarUpload;
