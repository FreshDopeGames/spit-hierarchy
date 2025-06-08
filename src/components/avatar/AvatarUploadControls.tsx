
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface AvatarUploadControlsProps {
  uploading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AvatarUploadControls = ({ uploading, onFileSelect }: AvatarUploadControlsProps) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <Input
        type="file"
        accept="image/*"
        onChange={onFileSelect}
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
  );
};

export default AvatarUploadControls;
