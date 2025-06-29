
// Enhanced security utilities for file uploads and content validation
import { FileValidationResult, validateFileHeader, calculateFileEntropy } from './fileValidation';
import { validateImageContent, ImageContentValidationResult } from './imageContentValidation';

export interface SecurityValidationOptions {
  enableHeaderValidation: boolean;
  enableContentValidation: boolean;
  enableEntropyAnalysis: boolean;
  maxFileSize: number;
  allowedTypes: string[];
  blockSuspiciousFiles: boolean;
}

export const DEFAULT_SECURITY_OPTIONS: SecurityValidationOptions = {
  enableHeaderValidation: true,
  enableContentValidation: true,
  enableEntropyAnalysis: false, // Can be performance intensive
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  blockSuspiciousFiles: true
};

// Comprehensive file security validation
export const validateFileSecurely = async (
  file: File,
  options: Partial<SecurityValidationOptions> = {}
): Promise<ImageContentValidationResult> => {
  const config = { ...DEFAULT_SECURITY_OPTIONS, ...options };
  
  console.log('Starting comprehensive security validation for:', file.name, 'with options:', config);

  let result: ImageContentValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    metadata: {
      actualMimeType: file.type,
      hasEXIF: false,
      fileSize: file.size
    },
    securityFlags: {
      suspiciousSize: false,
      unusualEntropy: false,
      malformedStructure: false,
      embeddedScripts: false
    }
  };

  try {
    // 1. Basic file validation
    if (!config.allowedTypes.includes(file.type)) {
      result.isValid = false;
      result.errors.push(`File type ${file.type} is not allowed`);
      return result;
    }

    if (file.size > config.maxFileSize) {
      result.isValid = false;
      result.errors.push(`File size exceeds maximum allowed size of ${config.maxFileSize / 1024 / 1024}MB`);
      return result;
    }

    if (file.size === 0) {
      result.isValid = false;
      result.errors.push('File is empty');
      return result;
    }

    // 2. File header validation
    if (config.enableHeaderValidation) {
      console.log('Running header validation...');
      const headerResult = await validateFileHeader(file);
      
      if (!headerResult.isValid) {
        result.isValid = false;
        result.errors.push(...headerResult.errors);
      }
      
      result.warnings.push(...headerResult.warnings);
      
      // Merge metadata
      if (headerResult.metadata) {
        result.metadata = { ...result.metadata, ...headerResult.metadata };
      }
    }

    // 3. Content validation
    if (config.enableContentValidation && result.isValid) {
      console.log('Running content validation...');
      const contentResult = await validateImageContent(file);
      
      if (!contentResult.isValid) {
        result.isValid = false;
        result.errors.push(...contentResult.errors);
      }
      
      result.warnings.push(...contentResult.warnings);
      result.securityFlags = { ...result.securityFlags, ...contentResult.securityFlags };
      
      if (contentResult.imageMetadata) {
        result.imageMetadata = contentResult.imageMetadata;
      }
    }

    // 4. Entropy analysis for advanced threat detection
    if (config.enableEntropyAnalysis && result.isValid) {
      console.log('Running entropy analysis...');
      const entropy = await calculateFileEntropy(file);
      
      // Typical image entropy is between 6-8 bits per byte
      if (entropy < 4 || entropy > 8.5) {
        result.securityFlags.unusualEntropy = true;
        result.warnings.push(`Unusual file entropy detected: ${entropy.toFixed(2)} bits/byte`);
        
        if (config.blockSuspiciousFiles && (entropy < 2 || entropy > 8.8)) {
          result.isValid = false;
          result.errors.push('File has suspicious entropy patterns that may indicate malicious content');
        }
      }
    }

    // 5. Filename security validation
    const filename = file.name.toLowerCase();
    const suspiciousExtensions = ['.php', '.asp', '.jsp', '.exe', '.scr', '.bat', '.cmd', '.js', '.vbs'];
    
    if (suspiciousExtensions.some(ext => filename.includes(ext))) {
      result.isValid = false;
      result.errors.push('Filename contains potentially dangerous extensions');
    }

    // 6. Final security assessment
    const securityScore = calculateSecurityScore(result);
    
    if (securityScore < 70 && config.blockSuspiciousFiles) {
      result.isValid = false;
      result.errors.push(`File failed security assessment (score: ${securityScore}/100)`);
    } else if (securityScore < 85) {
      result.warnings.push(`File has moderate security concerns (score: ${securityScore}/100)`);
    }

    console.log('Security validation completed:', {
      fileName: file.name,
      isValid: result.isValid,
      securityScore,
      errors: result.errors.length,
      warnings: result.warnings.length
    });

  } catch (error) {
    result.isValid = false;
    result.errors.push(`Security validation failed: ${error}`);
    console.error('Security validation error:', error);
  }

  return result;
};

// Calculate a security score based on validation results
const calculateSecurityScore = (result: ImageContentValidationResult): number => {
  let score = 100;
  
  // Deduct points for each security flag
  if (result.securityFlags.malformedStructure) score -= 30;
  if (result.securityFlags.embeddedScripts) score -= 40;
  if (result.securityFlags.suspiciousSize) score -= 10;
  if (result.securityFlags.unusualEntropy) score -= 15;
  
  // Deduct points for each error
  score -= result.errors.length * 5;
  
  // Deduct points for each warning
  score -= result.warnings.length * 2;
  
  return Math.max(0, score);
};

// Enhanced filename sanitization
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^[._-]+|[._-]+$/g, '') // Remove leading/trailing dots/underscores/hyphens
    .toLowerCase()
    .slice(0, 100); // Limit length
};

// Rate limiting for file uploads
interface UploadAttempt {
  timestamp: number;
  filename: string;
  success: boolean;
}

class UploadRateLimiter {
  private attempts: Map<string, UploadAttempt[]> = new Map();
  private readonly maxAttempts: number = 10;
  private readonly windowMs: number = 60 * 1000; // 1 minute

  canUpload(identifier: string, filename: string): { allowed: boolean; reason?: string } {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Filter out old attempts
    const recentAttempts = userAttempts.filter(attempt => 
      now - attempt.timestamp < this.windowMs
    );

    if (recentAttempts.length >= this.maxAttempts) {
      return { 
        allowed: false, 
        reason: `Upload rate limit exceeded. Try again in ${Math.ceil((this.windowMs - (now - recentAttempts[0].timestamp)) / 1000)} seconds.`
      };
    }

    // Record this attempt
    recentAttempts.push({ timestamp: now, filename, success: false });
    this.attempts.set(identifier, recentAttempts);

    return { allowed: true };
  }

  recordSuccess(identifier: string): void {
    const attempts = this.attempts.get(identifier);
    if (attempts && attempts.length > 0) {
      attempts[attempts.length - 1].success = true;
    }
  }
}

export const uploadRateLimiter = new UploadRateLimiter();
