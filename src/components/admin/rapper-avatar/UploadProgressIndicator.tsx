
import React from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ValidationProgress } from "@/hooks/useEnhancedFileValidation";

interface UploadProgressIndicatorProps {
  uploadProgress: string;
  validating: boolean;
  validationProgress: ValidationProgress;
}

const UploadProgressIndicator = ({ 
  uploadProgress, 
  validating, 
  validationProgress 
}: UploadProgressIndicatorProps) => {
  if (!uploadProgress && !validating) return null;

  return (
    <div className="space-y-3 p-4 bg-rap-gold/10 rounded-lg border border-rap-gold/30">
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-rap-gold" />
        <span className="text-rap-gold text-sm">
          {uploadProgress || validationProgress.message}
        </span>
      </div>
      
      {validating && validationProgress.progress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-rap-gold/70">
            <span>Security Validation (Admin Mode)</span>
            <span>{validationProgress.progress}%</span>
          </div>
          <Progress value={validationProgress.progress} className="h-2" />
        </div>
      )}
      
      {validationProgress.stage === 'complete' && (
        <div className="flex items-center gap-1 text-xs text-green-400">
          <CheckCircle className="w-3 h-3" />
          <span>Enhanced admin security validation passed</span>
        </div>
      )}
    </div>
  );
};

export default UploadProgressIndicator;
