import React, { useState } from "react";
import AvatarCropper from "./AvatarCropper";
import ModerationAlert from "./ModerationAlert";
import AvatarDisplay from "./avatar/AvatarDisplay";
import AvatarUploadControls from "./avatar/AvatarUploadControls";
import AvatarUploadOverlay from "./avatar/AvatarUploadOverlay";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarUpdate: (url: string) => void;
  userId: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'default' | 'overlay';
}

const AvatarUpload = ({ currentAvatarUrl, onAvatarUpdate, userId, size = 'xlarge', variant = 'overlay' }: AvatarUploadProps) => {
  // Use overlay variant for profile pages
  if (variant === 'overlay') {
    return (
      <AvatarUploadOverlay
        currentAvatarUrl={currentAvatarUrl}
        onAvatarUpdate={onAvatarUpdate}
        userId={userId}
        size={size}
      />
    );
  }

  // Keep existing implementation for other uses
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
      <div className="flex flex-col items-center space-y-4">
        {moderationError && (
          <ModerationAlert
            type="inappropriate"
            message={moderationError}
            onEdit={() => setModerationError(null)}
            className="w-full"
          />
        )}
        
        <AvatarDisplay avatarUrl={avatarUrl} size={size} />
        
        {(size === 'large' || size === 'xlarge') && (
          <AvatarUploadControls 
            uploading={uploading}
            onFileSelect={handleFileSelect}
          />
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

export default AvatarUpload;
