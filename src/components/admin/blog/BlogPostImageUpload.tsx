
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Image } from "lucide-react";
import { toast } from "sonner";

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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `blog-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(data.path);

      onImageChange(publicUrl);
      toast.success('Image uploaded successfully');

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

  return (
    <div className="space-y-2">
      <Label className="text-rap-platinum text-sm sm:text-base">{label}</Label>
      
      {imageUrl ? (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded border border-rap-smoke overflow-hidden">
            <img 
              src={imageUrl} 
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
                <div className="text-rap-carbon">Uploading...</div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-2 text-rap-carbon" />
                  <p className="text-sm text-rap-carbon">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-rap-carbon">PNG, JPG, WEBP up to 5MB</p>
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
