import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AvatarCropper from "./AvatarCropper";
import { generateAvatarSizes } from "@/utils/imageUtils";
import { validateImageFile, validateImageContent } from "@/utils/contentModeration";
import ModerationAlert from "./ModerationAlert";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarUpdate: (url: string) => void;
  userId: string;
  size?: 'small' | 'medium' | 'large';
}

const AvatarUpload = ({ currentAvatarUrl, onAvatarUpdate, userId, size = 'large' }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const { toast } = useToast();

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'w-8 h-8';
      case 'medium': return 'w-16 h-16';
      case 'large': return 'w-24 h-24';
      default: return 'w-24 h-24';
    }
  };

  const getAvatarUrl = (baseUrl?: string) => {
    if (!baseUrl) return undefined;
    
    // If it's already a full URL, return as is
    if (baseUrl.startsWith('http')) return baseUrl;
    
    // If it's a path, construct the appropriate size URL
    const sizeMap = {
      small: 'thumb',
      medium: 'medium', 
      large: 'large'
    };
    
    const sizeName = sizeMap[size];
    
    // Construct the full Supabase storage URL
    return `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/avatars/${baseUrl}/${sizeName}.jpg`;
  };

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

      // Additional validation on cropped image
      const croppedFile = new File([croppedBlob], `${userId}-cropped.jpg`, { type: 'image/jpeg' });
      const finalValidation = await validateImageContent(croppedFile);
      
      if (!finalValidation.isValid) {
        setModerationError(finalValidation.message || "Cropped image not allowed");
        return;
      }

      // Generate multiple resolutions
      const resizedImages = await generateAvatarSizes(croppedBlob);

      // Upload original cropped image
      const originalFile = new File([croppedBlob], `${userId}-original.jpg`, { type: 'image/jpeg' });
      const originalPath = `${userId}/original.jpg`;

      const { error: originalUploadError } = await supabase.storage
        .from('avatars')
        .upload(originalPath, originalFile, { upsert: true });

      if (originalUploadError) {
        throw originalUploadError;
      }

      // Upload resized versions
      await Promise.all(
        resizedImages.map(async ({ name, blob }) => {
          const file = new File([blob], `${userId}-${name}.jpg`, { type: 'image/jpeg' });
          const path = `${userId}/${name}.jpg`;
          
          const { error } = await supabase.storage
            .from('avatars')
            .upload(path, file, { upsert: true });
          
          if (error) throw error;
        })
      );

      // Update user profile with new avatar URL base path
      const avatarBasePath = userId;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: avatarBasePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      onAvatarUpdate(avatarBasePath);
      toast({
        title: "Avatar updated successfully!",
        description: "Your profile picture has been updated.",
      });

    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Error uploading avatar",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const displayUrl = getAvatarUrl(currentAvatarUrl);

  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        {moderationError && (
          <ModerationAlert
            type="inappropriate"
            message={moderationError}
            onEdit={() => setModerationError(null)}
            className="w-full"
          />
        )}
        
        <div className={`relative ${getSizeClass()} bg-gradient-to-r from-rap-burgundy to-rap-forest rounded-full flex items-center justify-center shadow-lg border-2 border-rap-gold/50`}>
          {displayUrl ? (
            <img 
              src={displayUrl} 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-1/2 h-1/2 text-rap-silver" />
          )}
        </div>
        
        {size === 'large' && (
          <div className="flex flex-col items-center space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id="avatar-upload"
            />
            <label htmlFor="avatar-upload">
              <Button 
                variant="outline" 
                className="border-rap-gold/50 text-rap-gold hover:bg-rap-gold/20 cursor-pointer font-merienda"
                disabled={uploading}
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Update Avatar'}
                </span>
              </Button>
            </label>
          </div>
        )}
      </div>

      {selectedFile && (
        <AvatarCropper
          isOpen={showCropper}
          onClose={() => {
            setShowCropper(false);
            setSelectedFile(null);
          }}
          onCropComplete={handleCropComplete}
          imageFile={selectedFile}
        />
      )}
    </>
  );
};

export default AvatarUpload;
