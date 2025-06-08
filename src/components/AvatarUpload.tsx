
import React, { useState } from "react";
import AvatarCropper from "./AvatarCropper";
import ModerationAlert from "./ModerationAlert";
import AvatarDisplay from "./avatar/AvatarDisplay";
import AvatarUploadControls from "./avatar/AvatarUploadControls";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarUpdate: (url: string) => void;
  userId: string;
  size?: 'small' | 'medium' | 'large';
}

const AvatarUpload = ({ currentAvatarUrl, onAvatarUpdate, userId, size = 'large' }: AvatarUploadProps) => {
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
        
        {size === 'large' && (
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
