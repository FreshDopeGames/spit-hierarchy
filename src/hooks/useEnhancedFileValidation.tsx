
import { useState } from "react";
import { validateFileSecurely, SecurityValidationOptions, uploadRateLimiter } from "@/utils/enhancedSecurity";
import { ImageContentValidationResult } from "@/utils/imageContentValidation";
import { toast } from "sonner";

export interface ValidationProgress {
  stage: 'idle' | 'basic' | 'header' | 'content' | 'entropy' | 'complete' | 'error';
  message: string;
  progress: number; // 0-100
}

export const useEnhancedFileValidation = (
  options?: Partial<SecurityValidationOptions>
) => {
  const [validating, setValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState<ValidationProgress>({
    stage: 'idle',
    message: '',
    progress: 0
  });

  const validateFile = async (
    file: File,
    userId?: string
  ): Promise<{ isValid: boolean; result?: ImageContentValidationResult; error?: string }> => {
    try {
      setValidating(true);
      
      // Rate limiting check
      if (userId) {
        const rateLimitCheck = uploadRateLimiter.canUpload(userId, file.name);
        if (!rateLimitCheck.allowed) {
          toast.error("Upload rate limit exceeded", {
            description: rateLimitCheck.reason
          });
          return { isValid: false, error: rateLimitCheck.reason };
        }
      }

      // Progress tracking
      setValidationProgress({
        stage: 'basic',
        message: 'Performing basic file validation...',
        progress: 10
      });

      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UX

      setValidationProgress({
        stage: 'header',
        message: 'Validating file headers and structure...',
        progress: 30
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      setValidationProgress({
        stage: 'content',
        message: 'Analyzing image content and metadata...',
        progress: 60
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      if (options?.enableEntropyAnalysis) {
        setValidationProgress({
          stage: 'entropy',
          message: 'Performing advanced security analysis...',
          progress: 80
        });
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Perform the actual validation
      const result = await validateFileSecurely(file, options);

      setValidationProgress({
        stage: 'complete',
        message: result.isValid ? 'Validation completed successfully' : 'Validation completed with issues',
        progress: 100
      });

      if (result.isValid && userId) {
        uploadRateLimiter.recordSuccess(userId);
      }

      // Show user-friendly messages
      if (!result.isValid) {
        const mainError = result.errors[0] || 'File validation failed';
        toast.error("File validation failed", {
          description: mainError
        });
      } else if (result.warnings.length > 0) {
        const mainWarning = result.warnings[0];
        toast.warning("File validation warnings", {
          description: `${mainWarning}${result.warnings.length > 1 ? ` (and ${result.warnings.length - 1} more)` : ''}`
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500)); // Show complete state

      return { isValid: result.isValid, result };

    } catch (error) {
      console.error('Enhanced file validation error:', error);
      
      setValidationProgress({
        stage: 'error',
        message: 'Validation failed due to an error',
        progress: 0
      });

      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      toast.error("Validation error", {
        description: errorMessage
      });

      return { isValid: false, error: errorMessage };
      
    } finally {
      setValidating(false);
      
      // Reset progress after a delay
      setTimeout(() => {
        setValidationProgress({
          stage: 'idle',
          message: '',
          progress: 0
        });
      }, 2000);
    }
  };

  const validateMultipleFiles = async (
    files: File[],
    userId?: string
  ): Promise<{ validFiles: File[]; invalidFiles: { file: File; reason: string }[] }> => {
    const validFiles: File[] = [];
    const invalidFiles: { file: File; reason: string }[] = [];

    for (const file of files) {
      const validation = await validateFile(file, userId);
      
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({
          file,
          reason: validation.error || 'Validation failed'
        });
      }
    }

    return { validFiles, invalidFiles };
  };

  return {
    validating,
    validationProgress,
    validateFile,
    validateMultipleFiles
  };
};
