
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
      
      console.log('Starting upload for rapper:', rapper.name, 'Folder:', sanitizedName);
      
      // Convert file to blob for processing
      const blob = new Blob([file], { type: file.type });
      
      // Generate multiple resolutions with enhanced quality
      console.log('Generating rapper image sizes...');
      const resizedImages = await generateRapperImageSizes(blob);
      console.log('Generated sizes:', resizedImages.map(img => img.name));

      // Upload original image first
      const originalFileName = `${sanitizedName}/original.jpg`;
      const originalFile = new File([blob], originalFileName, { type: 'image/jpeg' });

      console.log('Uploading original to:', originalFileName);
      const { error: originalUploadError } = await supabase.storage
        .from('rapper-images')
        .upload(originalFileName, originalFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (originalUploadError) {
        console.error('Original upload failed:', originalUploadError);
        throw originalUploadError;
      }

      // Upload all resized versions with proper error handling
      console.log('Uploading resized versions...');
      const uploadPromises = resizedImages.map(async ({ name, blob: resizedBlob }) => {
        const fileName = `${sanitizedName}/${name}.jpg`;
        const file = new File([resizedBlob], fileName, { type: 'image/jpeg' });
        
        console.log(`Uploading ${name} size to:`, fileName);
        const { error } = await supabase.storage
          .from('rapper-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (error) {
          console.error(`Upload failed for ${name}:`, error);
          throw new Error(`Failed to upload ${name} size: ${error.message}`);
        }
        
        return { size: name, fileName };
      });

      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromises);
      console.log('All uploads completed:', uploadResults);

      // Verify uploads by checking if files exist
      for (const { size, fileName } of uploadResults) {
        const { data: fileData, error: checkError } = await supabase.storage
          .from('rapper-images')
          .list(sanitizedName);
        
        if (checkError) {
          console.warn(`Could not verify ${size} upload:`, checkError);
        } else {
          const fileExists = fileData?.some(f => f.name === `${size}.jpg`);
          console.log(`${size} file exists:`, fileExists);
        }
      }

      // Store the base path in rapper_images table
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
          .update({ 
            image_url: basePath,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingImage.id);

        if (updateError) {
          console.error('Database update failed:', updateError);
          throw updateError;
        }
      } else {
        // Insert new record with base path
        const { error: insertError } = await supabase
          .from("rapper_images")
          .insert({
            rapper_id: rapper.id,
            style: "comic_book",
            image_url: basePath
          });

        if (insertError) {
          console.error('Database insert failed:', insertError);
          throw insertError;
        }
      }

      // Update the legacy image_url field for backwards compatibility (use xlarge for best quality)
      const fullXlargeUrl = `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images/${sanitizedName}/xlarge.jpg`;
      const { error: updateError } = await supabase
        .from("rappers")
        .update({ 
          image_url: fullXlargeUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", rapper.id);

      if (updateError) {
        console.error('Rapper table update failed:', updateError);
        throw updateError;
      }

      console.log('Upload process completed successfully');
      return { basePath, xlarge_url: fullXlargeUrl };
    },
    onSuccess: (result) => {
      // Invalidate all relevant queries to ensure images update everywhere
      queryClient.invalidateQueries({ queryKey: ["admin-rappers"] });
      queryClient.invalidateQueries({ queryKey: ["rapper-images"] });
      queryClient.invalidateQueries({ queryKey: ["rapper-image", rapper.id] });
      queryClient.invalidateQueries({ queryKey: ["rappers"] });
      
      console.log('Upload successful, queries invalidated');
      toast.success(`Avatar uploaded successfully for ${rapper.name}`);
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

    // Validate file size (max 10MB for better quality)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Please select an image smaller than 10MB");
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
              className="w-64 h-64 object-cover border-2 border-rap-gold/30 rounded-lg"
              onError={(e) => {
                console.error('Image failed to load:', rapper.image_url);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
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
                  {uploading ? 'Uploading & Optimizing...' : 'Upload Avatar'}
                </span>
              </Button>
            </label>
          </div>
          
          <p className="text-rap-smoke text-sm text-center">
            Upload a high-quality image. Multiple optimized sizes will be generated automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RapperAvatarUpload;
