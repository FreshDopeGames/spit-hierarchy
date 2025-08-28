
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PlaceholderImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const uploadPlaceholderImage = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `spit-hierarchy-logo.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('rapper-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('rapper-images')
        .getPublicUrl(filePath);

      toast.success(`Placeholder image uploaded successfully! URL: ${data.publicUrl}`);
      console.log("Placeholder image URL:", data.publicUrl);
      
    } catch (error) {
      console.error('Error uploading placeholder image:', error);
      toast.error('Failed to upload placeholder image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold text-[var(--theme-text)] font-[var(--theme-font-heading)]">Upload Placeholder Image</h3>
      <p className="text-sm text-[var(--theme-text-secondary)] font-[var(--theme-font-body)]">
        Upload the "Spit Hierarchy" logo to use as the default placeholder image.
      </p>
      
      <div className="space-y-2">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        
        <Button 
          onClick={uploadPlaceholderImage}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Placeholder Image'}
        </Button>
      </div>

      <div className="text-xs text-[var(--theme-text-secondary)] font-[var(--theme-font-body)]">
        <p>Once uploaded, copy the URL from the success message and update the PLACEHOLDER_IMAGE constant.</p>
      </div>
    </div>
  );
};

export default PlaceholderImageUpload;
