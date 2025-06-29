
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

interface UploadControlsProps {
  rapperId: string;
  isProcessing: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadControls = ({ rapperId, isProcessing, onFileSelect }: UploadControlsProps) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          disabled={isProcessing}
          className="hidden"
          id={`avatar-upload-${rapperId}`}
        />
        <label htmlFor={`avatar-upload-${rapperId}`}>
          <Button 
            type="button"
            variant="outline" 
            className="w-full cursor-pointer bg-rap-gold text-rap-charcoal border-rap-gold hover:bg-rap-gold/90"
            disabled={isProcessing}
            asChild
          >
            <span className="flex items-center gap-2">
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isProcessing ? 'Processing...' : 'Upload Avatar'}
            </span>
          </Button>
        </label>
      </div>
      
      <p className="text-rap-smoke text-sm text-center">
        Upload a high-quality image with enhanced security validation (Admin Mode).
        <br />
        <span className="text-xs text-rap-smoke/70">
          Supported formats: JPG, PNG, WebP (max 15MB) • Enhanced validation with admin privileges for more lenient security checks
        </span>
      </p>
    </div>
  );
};

export default UploadControls;
