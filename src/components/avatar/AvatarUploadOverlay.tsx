
import React, { useState } from "react";
import { Camera } from "lucide-react";
import AvatarCropper from "../AvatarCropper";
import ModerationAlert from "../ModerationAlert";
import AvatarDisplay from "./AvatarDisplay";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";

interface AvatarUploadOverlayProps {
  currentAvatarUrl?: string;
  onAvatarUpdate: (url: string) => void;
  userId: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

const AvatarUploadOverlay = ({ currentAvatarUrl, onAvatarUpdate, userId, size = 'xlarge' }: AvatarUploadOverlayProps) => {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  
  const {
    uploading,
    selectedFile,
    showCropper,
    moderationError,
    setModerationError,
    handleFileSelect,
    handleCropComplete,
    closeCropper
  } = useAvatarUpload(userId, (url) => {
    setAvatarUrl(url);
    onAvatarUpdate(url);
  });

  return (
    <>
      <div className="relative inline-block">
        {moderationError && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20 w-64">
            <ModerationAlert
              type="inappropriate"
              message={moderationError}
              onEdit={() => setModerationError(null)}
              className="w-full text-xs"
            />
          </div>
        )}
        
        <AvatarDisplay avatarUrl={avatarUrl} size={size} />
        
        {/* Camera Button Overlay */}
        <div className="absolute -bottom-2 -right-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id={`avatar-upload-${userId}`}
          />
          <label htmlFor={`avatar-upload-${userId}`}>
            <div className="w-10 h-10 bg-rap-gold hover:bg-rap-gold-light border-2 border-carbon-fiber/90 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg">
              <Camera className="w-5 h-5 text-rap-carbon" />
            </div>
          </label>
        </div>
        
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="text-white text-xs font-medium">Uploading...</div>
          </div>
        )}
      </div>

      {selectedFile && (
        <AvatarCropper
          isOpen={showCropper}
          onClose={closeCropper}
          onCropComplete={handleCropComplete}
          imageFile={selectedFile}
        />
      )}
    </>
  );
};

export default AvatarUploadOverlay;
