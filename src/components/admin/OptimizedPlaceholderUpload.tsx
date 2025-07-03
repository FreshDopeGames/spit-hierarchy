
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateRapperImageSizes } from "@/utils/imageUtils";

const OptimizedPlaceholderUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const uploadOptimizedPlaceholders = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      const blob = new Blob([file], { type: file.type });
      
      // Generate all sizes using the existing image utility
      const resizedImages = await generateRapperImageSizes(blob);
      
      // Upload each size
      const uploadResults = [];
      
      for (const { name, blob: resizedBlob } of resizedImages) {
        const fileName = `placeholder-${name}.jpg`;
        
        const { error } = await supabase.storage
          .from('rapper-images')
          .upload(fileName, new File([resizedBlob], fileName, { type: 'image/jpeg' }), {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          throw error;
        }

        const { data } = supabase.storage
          .from('rapper-images')
          .getPublicUrl(fileName);

        uploadResults.push({ size: name, url: data.publicUrl });
      }

      console.log("Optimized placeholders uploaded:", uploadResults);
      toast.success(`Successfully uploaded ${uploadResults.length} optimized placeholder sizes!`);
      
      // Display the URLs for reference
      uploadResults.forEach(result => {
        console.log(`${result.size}: ${result.url}`);
      });
      
    } catch (error) {
      console.error('Error uploading optimized placeholders:', error);
      toast.error('Failed to upload optimized placeholders');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Upload Optimized Placeholder Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Upload a high-quality placeholder image to create optimized versions for all sizes (thumb, medium, large, xlarge).
        </p>
        
        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          
          <Button 
            onClick={uploadOptimizedPlaceholders}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? 'Generating & Uploading...' : 'Create Optimized Placeholders'}
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          <p><strong>Expected results:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>thumb (64x64) - ~2-5KB</li>
            <li>medium (128x128) - ~5-10KB</li>
            <li>large (256x256) - ~10-20KB</li>
            <li>xlarge (400x400) - ~20-30KB</li>
          </ul>
          <p className="mt-2">Total size reduction: ~95% compared to current 1.14MB placeholder</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizedPlaceholderUpload;
