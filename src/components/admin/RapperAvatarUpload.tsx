
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, ImageIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { generateRapperImageSizes } from "@/utils/imageUtils";
import { useEnhancedFileValidation } from "@/hooks/useEnhancedFileValidation";
import { Progress } from "@/components/ui/progress";

type Rapper = Tables<"rappers">;

interface RapperAvatarUploadProps {
  rapper: Rapper;
}

const RapperAvatarUpload = ({ rapper }: RapperAvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const queryClient = useQueryClient();

  const { validating, validationProgress, validateFile } = useEnhancedFileValidation({
    enableHeaderValidation: true,
    enableContentValidation: true,
    enableEntropyAnalysis: false, // Performance consideration
    maxFileSize: 15 * 1024 * 1024, // 15MB for admin uploads
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    blockSuspiciousFiles: false, // More lenient for admin
    isAdminUpload: true // Enable admin mode
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log('=== STARTING ENHANCED RAPPER AVATAR UPLOAD (ADMIN MODE) ===');
      console.log('File info:', { name: file.name, size: file.size, type: file.type });
      
      // Enhanced security validation with admin mode
      const validationResult = await validateFile(file, `admin-${rapper.id}`);
      
      if (!validationResult.isValid) {
        throw new Error(validationResult.error || 'File validation failed');
      }

      // Log any warnings but don't fail the upload
      if (validationResult.result?.warnings.length) {
        console.log('Admin upload validation warnings (non-blocking):', validationResult.result.warnings);
        toast.warning("Upload succeeded with warnings", {
          description: `${validationResult.result.warnings.length} validation warnings were noted but upload proceeded`
        });
      }

      console.log('Enhanced validation passed (admin mode), proceeding with upload');
      
      // Create a sanitized name for the rapper folder
      const sanitizedName = rapper.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      console.log('Sanitized folder name:', sanitizedName);
      
      setUploadProgress("Validating image...");
      
      // Convert file to blob for processing
      const blob = new Blob([file], { type: file.type });
      console.log('Created blob:', blob.size, 'bytes');
      
      setUploadProgress("Generating optimized image sizes...");
      
      // Generate multiple resolutions with enhanced quality
      let resizedImages;
      try {
        resizedImages = await generateRapperImageSizes(blob);
        console.log('Generated sizes:', resizedImages.map(img => `${img.name}: ${img.blob.size} bytes`));
      } catch (error) {
        console.error('Image generation failed:', error);
        throw new Error(`Image optimization failed: ${error.message}`);
      }
      
      setUploadProgress("Uploading original image...");
      
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
        throw new Error(`Original upload failed: ${originalUploadError.message}`);
      }
      
      console.log('Original upload successful');
      setUploadProgress("Uploading optimized sizes...");

      // Upload all resized versions with detailed progress tracking
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
          throw new Error(`Database update failed: ${updateError.message}`);
        }
        console.log('Updated existing rapper_images record');
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
          throw new Error(`Database insert failed: ${insertError.message}`);
        }
        console.log('Inserted new rapper_images record');
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
        throw new Error(`Rapper table update failed: ${updateError.message}`);
      }

      console.log('=== ENHANCED ADMIN UPLOAD PROCESS COMPLETED SUCCESSFULLY ===');
      console.log('Security validation passed with admin mode leniency');
      
      setUploadProgress("Upload completed!");
      return { basePath, xlarge_url: fullXlargeUrl };
    },
    onSuccess: (result) => {
      // Invalidate all relevant queries to ensure images update everywhere
      queryClient.invalidateQueries({ queryKey: ["admin-rappers"] });
      queryClient.invalidateQueries({ queryKey: ["rapper-images"] });
      queryClient.invalidateQueries({ queryKey: ["rapper-image", rapper.id] });
      queryClient.invalidateQueries({ queryKey: ["rappers"] });
      
      console.log('Enhanced admin upload successful, queries invalidated');
      toast.success(`Avatar uploaded successfully for ${rapper.name}`, {
        description: "Enhanced security validation passed with admin privileges - all image sizes have been optimized and uploaded"
      });
      setUploadProgress("");
    },
    onError: (error: any) => {
      console.error('Enhanced admin upload error:', error);
      toast.error(`Upload failed: ${error.message}`, {
        description: "Enhanced security validation or upload process failed. Admin mode was enabled for more lenient validation."
      });
      setUploadProgress("");
    }
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected for enhanced admin validation:', { name: file.name, size: file.size, type: file.type });

    setUploading(true);
    setUploadProgress("Starting enhanced security validation (admin mode)...");
    
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const isProcessing = uploading || validating;

  return (
    <Card className="bg-carbon-fiber border border-rap-gold/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-rap-gold font-ceviche text-lg font-normal flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Enhanced Avatar Upload (Admin)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enhanced Progress indicator */}
        {(uploadProgress || validating) && (
          <div className="space-y-3 p-4 bg-rap-gold/10 rounded-lg border border-rap-gold/30">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-rap-gold" />
              <span className="text-rap-gold text-sm">
                {uploadProgress || validationProgress.message}
              </span>
            </div>
            
            {validating && validationProgress.progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-rap-gold/70">
                  <span>Security Validation (Admin Mode)</span>
                  <span>{validationProgress.progress}%</span>
                </div>
                <Progress value={validationProgress.progress} className="h-2" />
              </div>
            )}
            
            {validationProgress.stage === 'complete' && (
              <div className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle className="w-3 h-3" />
                <span>Enhanced admin security validation passed</span>
              </div>
            )}
          </div>
        )}

        {rapper.image_url && (
          <div className="flex justify-center">
            <img 
              src={rapper.image_url} 
              alt={rapper.name}
              className="w-64 h-64 object-cover border-2 border-rap-gold/30 rounded-lg"
              onLoad={() => console.log('Current image loaded successfully:', rapper.image_url)}
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
              disabled={isProcessing}
              className="hidden"
              id={`avatar-upload-${rapper.id}`}
            />
            <label htmlFor={`avatar-upload-${rapper.id}`}>
              <Button 
                type="button"
                variant="outline" 
                className="w-full cursor-pointer bg-rap-gold text-rap-charcoal border-rap-gold hover:bg-rap-gold/90"
                disabled={isProcessing}
                asChild
              >
                <span className="flex items-center gap-2">
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isProcessing ? 'Processing...' : 'Upload Avatar'}
                </span>
              </Button>
            </label>
          </div>
          
          <p className="text-rap-smoke text-sm text-center">
            Upload a high-quality image with enhanced security validation (Admin Mode).
            <br />
            <span className="text-xs text-rap-smoke/70">
              Supported formats: JPG, PNG, WebP (max 15MB) • Enhanced validation with admin privileges for more lenient security checks
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RapperAvatarUpload;
