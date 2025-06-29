
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateAvatarSizes } from "@/utils/imageUtils";
import { validateImageFile, validateImageContent } from "@/utils/contentModeration";

export const useAvatarUpload = (userId: string, onAvatarUpdate: (url: string) => void) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setModerationError(null);
    
    // Validate file type and size
    const fileValidation = validateImageFile(file);
    if (!fileValidation.isValid) {
      setModerationError(fileValidation.message || "Invalid file");
      return;
    }

    // Validate image content
    try {
      const contentValidation = await validateImageContent(file);
      if (!contentValidation.isValid) {
        setModerationError(contentValidation.message || "Image content not allowed");
        return;
      }
    } catch (error) {
      setModerationError("Error validating image content");
      return;
    }

    setSelectedFile(file);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      setUploading(true);
      setModerationError(null);

      console.log('Starting avatar upload for user:', userId);

      // Additional validation on cropped image
      const croppedFile = new File([croppedBlob], `${userId}-cropped.jpg`, { type: 'image/jpeg' });
      const finalValidation = await validateImageContent(croppedFile);
      
      if (!finalValidation.isValid) {
        setModerationError(finalValidation.message || "Cropped image not allowed");
        return;
      }

      // Generate multiple resolutions
      console.log('Generating avatar sizes...');
      const resizedImages = await generateAvatarSizes(croppedBlob);
      console.log('Generated sizes:', resizedImages.map(img => img.name));

      // Upload original cropped image
      const originalFile = new File([croppedBlob], `${userId}-original.jpg`, { type: 'image/jpeg' });
      const originalPath = `${userId}/original.jpg`;

      console.log('Uploading original to:', originalPath);
      const { error: originalUploadError } = await supabase.storage
        .from('avatars')
        .upload(originalPath, originalFile, { upsert: true });

      if (originalUploadError) {
        console.error('Original upload failed:', originalUploadError);
        throw originalUploadError;
      }

      // Upload resized versions
      console.log('Uploading resized versions...');
      await Promise.all(
        resizedImages.map(async ({ name, blob }) => {
          const file = new File([blob], `${userId}-${name}.jpg`, { type: 'image/jpeg' });
          const path = `${userId}/${name}.jpg`;
          
          console.log(`Uploading ${name} to:`, path);
          const { error } = await supabase.storage
            .from('avatars')
            .upload(path, file, { upsert: true });
          
          if (error) {
            console.error(`Upload failed for ${name}:`, error);
            throw error;
          }
        })
      );

      // Update user profile with new avatar URL base path
      const avatarBasePath = userId;
      console.log('Updating profile with avatar base path:', avatarBasePath);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: avatarBasePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Profile update failed:', updateError);
        throw updateError;
      }

      console.log('Avatar upload completed successfully');
      onAvatarUpdate(avatarBasePath);
      toast.success("Your profile picture has been updated.");

    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const closeCropper = () => {
    setShowCropper(false);
    setSelectedFile(null);
  };

  return {
    uploading,
    selectedFile,
    showCropper,
    moderationError,
    setModerationError,
    handleFileSelect,
    handleCropComplete,
    closeCropper
  };
};
