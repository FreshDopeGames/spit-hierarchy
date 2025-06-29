
// Security validation types and interfaces
import { ImageContentValidationResult } from '../validation/types';

export interface SecurityValidationOptions {
  enableHeaderValidation: boolean;
  enableContentValidation: boolean;
  enableEntropyAnalysis: boolean;
  maxFileSize: number;
  allowedTypes: string[];
  blockSuspiciousFiles: boolean;
  isAdminUpload?: boolean;
}

export const DEFAULT_SECURITY_OPTIONS: SecurityValidationOptions = {
  enableHeaderValidation: true,
  enableContentValidation: true,
  enableEntropyAnalysis: false, // Can be performance intensive
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  blockSuspiciousFiles: true,
  isAdminUpload: false
};

export interface UploadAttempt {
  timestamp: number;
  filename: string;
  success: boolean;
}
