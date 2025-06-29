
// Shared types for image validation
import { FileValidationResult } from '../fileValidation';

export interface ImageContentValidationResult extends FileValidationResult {
  imageMetadata?: {
    width: number;
    height: number;
    aspectRatio: number;
    colorDepth?: number;
    hasTransparency?: boolean;
  };
  securityFlags: {
    suspiciousSize: boolean;
    unusualEntropy: boolean;
    malformedStructure: boolean;
    embeddedScripts: boolean;
  };
}

export interface ImageStructureValidationResult {
  isValid: boolean;
  dimensions?: { width: number; height: number };
  errors: string[];
}

export interface ThreatScanResult {
  hasThreats: boolean;
  threats: string[];
}
