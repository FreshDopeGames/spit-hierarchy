
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { generateRapperImageSizes } from "@/utils/imageUtils";
import { useEnhancedFileValidation } from "@/hooks/useEnhancedFileValidation";

type Rapper = Tables<"rappers">;

export const useRapperAvatarUpload = (rapper: Rapper) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { validating, validationProgress, validateFile } = useEnhancedFileValidation({
    enableHeaderValidation: true,
    enableContentValidation: true,
    enableEntropyAnalysis: false,
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    blockSuspiciousFiles: false,
    isAdminUpload: true
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log('=== STARTING RAPPER AVATAR UPLOAD ===');
      console.log('File info:', { name: file.name, size: file.size, type: file.type });
      
      const validationResult = await validateFile(file, `admin-${rapper.id}`);
      
      if (!validationResult.isValid) {
        throw new Error(validationResult.error || 'File validation failed');
      }

      if (validationResult.result?.warnings.length) {
        console.log('Upload validation warnings (non-blocking):', validationResult.result.warnings);
        toast.warning("Upload succeeded with warnings", {
          description: `${validationResult.result.warnings.length} validation warnings were noted but upload proceeded`
        });
      }

      console.log('Validation passed, proceeding with upload');
      
      const sanitizedName = rapper.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      console.log('Sanitized folder name:', sanitizedName);
      
      setUploadProgress("Validating image...");
      
      const blob = new Blob([file], { type: file.type });
      console.log('Created blob:', blob.size, 'bytes');
      
      setUploadProgress("Generating optimized image sizes...");
      
      let resizedImages;
      try {
        resizedImages = await generateRapperImageSizes(blob);
        console.log('Generated sizes:', resizedImages.map(img => `${img.name}: ${img.blob.size} bytes`));
      } catch (error) {
        console.error('Image generation failed:', error);
        throw new Error(`Image optimization failed: ${error.message}`);
      }
      
      setUploadProgress("Uploading original image...");
      
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
        throw new Error(`Original upload failed: ${originalUploadError.message}`);
      }
      
      console.log('Original upload successful');
      setUploadProgress("Uploading optimized sizes...");

      const uploadResults = [];
      
      for (let i = 0; i < resizedImages.length; i++) {
        const { name, blob: resizedBlob } = resizedImages[i];
        const fileName = `${sanitizedName}/${name}.jpg`;
        const file = new File([resizedBlob], fileName, { type: 'image/jpeg' });
        
        setUploadProgress(`Uploading ${name} size (${i + 1}/${resizedImages.length})...`);
        console.log(`Uploading ${name} (${resizedBlob.size} bytes) to:`, fileName);
        
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
        
        console.log(`${name} upload successful`);
        uploadResults.push({ size: name, fileName, blobSize: resizedBlob.size });
      }

      console.log('All uploads completed:', uploadResults);
      setUploadProgress("Updating database...");

      const basePath = sanitizedName;

      const { data: existingImage } = await supabase
        .from("rapper_images")
        .select("id")
        .eq("rapper_id", rapper.id)
        .eq("style", "comic_book")
        .single();

      if (existingImage) {
        const { error: updateError } = await supabase
          .from("rapper_images")
          .update({ 
            image_url: basePath,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingImage.id);

        if (updateError) {
          console.error('Database update failed:', updateError);
          throw new Error(`Database update failed: ${updateError.message}`);
        }
        console.log('Updated existing rapper_images record');
      } else {
        const { error: insertError } = await supabase
          .from("rapper_images")
          .insert({
            rapper_id: rapper.id,
            style: "comic_book",
            image_url: basePath
          });

        if (insertError) {
          console.error('Database insert failed:', insertError);
          throw new Error(`Database insert failed: ${insertError.message}`);
        }
        console.log('Inserted new rapper_images record');
      }

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
        throw new Error(`Rapper table update failed: ${updateError.message}`);
      }

      console.log('=== UPLOAD PROCESS COMPLETED SUCCESSFULLY ===');
      
      setUploadProgress("Upload completed!");
      return { basePath, xlarge_url: fullXlargeUrl };
    },
    onSuccess: (result) => {
      // Set the new image URL for immediate display
      setNewImageUrl(result.xlarge_url);
      
      // Invalidate all related queries with more specific cache busting
      queryClient.invalidateQueries({ queryKey: ["admin-rappers"] });
      queryClient.invalidateQueries({ queryKey: ["rapper-images"] });
      queryClient.invalidateQueries({ queryKey: ["rapper-image", rapper.id] });
      queryClient.invalidateQueries({ queryKey: ["rapper-image", rapper.id, "comic_book"] });
      queryClient.invalidateQueries({ queryKey: ["rapper-image", rapper.id, "comic_book", "xlarge"] });
      queryClient.invalidateQueries({ queryKey: ["rappers"] });
      queryClient.invalidateQueries({ queryKey: ["rapper", rapper.id] });
      
      // Force refetch of the specific rapper image
      queryClient.refetchQueries({ queryKey: ["rapper-image", rapper.id, "comic_book", "xlarge"] });
      
      console.log('Upload successful, queries invalidated');
      toast.success(`Avatar uploaded successfully for ${rapper.name}`, {
        description: "All image sizes have been optimized and uploaded. The new image should appear immediately."
      });
      setUploadProgress("");
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`, {
        description: "Please try again or contact support if the issue persists."
      });
      setUploadProgress("");
    }
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected for upload:', { name: file.name, size: file.size, type: file.type });

    setUploading(true);
    setUploadProgress("Starting upload...");
    setNewImageUrl(null); // Reset any previous new image
    
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const isProcessing = uploading || validating;

  return {
    uploading,
    uploadProgress,
    validating,
    validationProgress,
    isProcessing,
    handleFileSelect,
    newImageUrl // Expose the new image URL for immediate display
  };
};
