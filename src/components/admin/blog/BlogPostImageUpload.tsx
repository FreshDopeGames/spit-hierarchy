
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { resizeImage } from "@/utils/imageUtils";
import { BLOG_IMAGE_SIZES } from "@/utils/blogImageUtils";

interface BlogPostImageUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
  label?: string;
}

const BlogPostImageUpload = ({ imageUrl, onImageChange, label = "Featured Image" }: BlogPostImageUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB for original)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10MB');
      return;
    }

    try {
      setUploading(true);

      // Generate multiple image sizes
      const timestamp = Date.now();
      const fileExt = 'jpg'; // Always use jpg for consistent format
      
      const sizes = {
        thumbnail: await resizeImage(file, BLOG_IMAGE_SIZES.thumbnail.width, BLOG_IMAGE_SIZES.thumbnail.height),
        medium: await resizeImage(file, BLOG_IMAGE_SIZES.medium.width, BLOG_IMAGE_SIZES.medium.height),
        large: await resizeImage(file, BLOG_IMAGE_SIZES.large.width, BLOG_IMAGE_SIZES.large.height),
        hero: await resizeImage(file, BLOG_IMAGE_SIZES.hero.width, BLOG_IMAGE_SIZES.hero.height)
      };

      // Upload all sizes
      const filenames = {
        thumbnail: `blog-thumb-${timestamp}.${fileExt}`,
        medium: `blog-medium-${timestamp}.${fileExt}`,
        large: `blog-large-${timestamp}.${fileExt}`,
        hero: `blog-hero-${timestamp}.${fileExt}`
      };

      const uploads = await Promise.all([
        supabase.storage.from('blog-images').upload(filenames.thumbnail, sizes.thumbnail, { cacheControl: '3600', upsert: false }),
        supabase.storage.from('blog-images').upload(filenames.medium, sizes.medium, { cacheControl: '3600', upsert: false }),
        supabase.storage.from('blog-images').upload(filenames.large, sizes.large, { cacheControl: '3600', upsert: false }),
        supabase.storage.from('blog-images').upload(filenames.hero, sizes.hero, { cacheControl: '3600', upsert: false })
      ]);

      // Check for errors
      const failedUploads = uploads.filter(upload => upload.error);
      if (failedUploads.length > 0) {
        throw new Error(`Failed to upload some image sizes: ${failedUploads[0].error?.message}`);
      }

      // Get public URLs
      const urls = {
        thumbnail: supabase.storage.from('blog-images').getPublicUrl(filenames.thumbnail).data.publicUrl,
        medium: supabase.storage.from('blog-images').getPublicUrl(filenames.medium).data.publicUrl,
        large: supabase.storage.from('blog-images').getPublicUrl(filenames.large).data.publicUrl,
        hero: supabase.storage.from('blog-images').getPublicUrl(filenames.hero).data.publicUrl
      };

      // Store as JSON string in the database for now
      // In a real implementation, you might want separate columns or a related table
      const imageData = JSON.stringify(urls);
      onImageChange(imageData);
      
      toast.success('Images uploaded successfully in multiple sizes');

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageChange('');
  };

  // Parse image data to display the appropriate size
  const getDisplayImage = () => {
    if (!imageUrl) return null;
    
    try {
      const parsed = JSON.parse(imageUrl);
      return parsed.medium || parsed.large || parsed.hero || parsed.thumbnail;
    } catch {
      // Fallback for single URL format
      return imageUrl;
    }
  };

  const displayImage = getDisplayImage();

  return (
    <div className="space-y-2">
      <Label className="text-rap-platinum text-sm sm:text-base">{label}</Label>
      
      {displayImage ? (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded border border-rap-smoke overflow-hidden">
            <img 
              src={displayImage} 
              alt="Featured image preview" 
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-rap-smoke mt-1">
            Multiple sizes automatically generated for optimal performance
          </p>
        </div>
      ) : (
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="blog-image-upload"
          />
          <Label
            htmlFor="blog-image-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-rap-smoke rounded bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <div className="text-rap-carbon">Uploading and optimizing...</div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-2 text-rap-carbon" />
                  <p className="text-sm text-rap-carbon">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-rap-carbon">PNG, JPG, WEBP up to 10MB (auto-optimized)</p>
                </>
              )}
            </div>
          </Label>
        </div>
      )}
    </div>
  );
};

export default BlogPostImageUpload;
