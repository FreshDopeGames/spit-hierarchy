
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useRapperAvatarUpload } from "@/hooks/useRapperAvatarUpload";
import UploadProgressIndicator from "./rapper-avatar/UploadProgressIndicator";
import RapperImageDisplay from "./rapper-avatar/RapperImageDisplay";
import UploadControls from "./rapper-avatar/UploadControls";

type Rapper = Tables<"rappers">;

interface RapperAvatarUploadProps {
  rapper: Rapper;
}

const RapperAvatarUpload = ({ rapper }: RapperAvatarUploadProps) => {
  const {
    uploadProgress,
    validating,
    validationProgress,
    isProcessing,
    handleFileSelect,
    newImageUrl
  } = useRapperAvatarUpload(rapper);

  // Create a temporary rapper object with the new image URL for immediate display
  const displayRapper = newImageUrl 
    ? { ...rapper, image_url: newImageUrl }
    : rapper;

  return (
    <Card className="bg-carbon-fiber border border-rap-gold/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-rap-gold font-ceviche text-lg font-normal flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Avatar Upload
          {newImageUrl && (
            <span className="text-sm text-green-400 font-normal">✓ Updated</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <UploadProgressIndicator
          uploadProgress={uploadProgress}
          validating={validating}
          validationProgress={validationProgress}
        />

        <RapperImageDisplay rapper={displayRapper} />
        
        <UploadControls
          rapperId={rapper.id}
          isProcessing={isProcessing}
          onFileSelect={handleFileSelect}
        />
      </CardContent>
    </Card>
  );
};

export default RapperAvatarUpload;
