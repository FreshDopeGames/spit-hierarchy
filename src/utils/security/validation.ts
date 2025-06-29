
// Core security validation logic
import { FileValidationResult, validateFileHeader, calculateFileEntropy } from '../fileValidation';
import { validateImageContent, ImageContentValidationResult } from '../imageContentValidation';
import { SecurityValidationOptions, DEFAULT_SECURITY_OPTIONS } from './types';

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
        if (config.isAdminUpload) {
          // For admin uploads, convert errors to warnings
          result.warnings.push(...headerResult.errors);
        } else {
          result.isValid = false;
          result.errors.push(...headerResult.errors);
        }
      }
      
      result.warnings.push(...headerResult.warnings);
      
      // Merge metadata
      if (headerResult.metadata) {
        result.metadata = { ...result.metadata, ...headerResult.metadata };
      }
    }

    // 3. Content validation (with admin mode support)
    if (config.enableContentValidation && result.isValid) {
      console.log('Running content validation...');
      const contentResult = await validateImageContent(file, config.isAdminUpload);
      
      if (!contentResult.isValid) {
        if (config.isAdminUpload) {
          // For admin uploads, be more lenient - convert some errors to warnings
          const criticalErrors = contentResult.errors.filter(error => 
            error.includes('corrupted') || 
            error.includes('malformed') ||
            error.includes('zero dimensions')
          );
          
          if (criticalErrors.length > 0) {
            result.isValid = false;
            result.errors.push(...criticalErrors);
          }
          
          // Non-critical errors become warnings for admin
          const nonCriticalErrors = contentResult.errors.filter(error => 
            !criticalErrors.includes(error)
          );
          result.warnings.push(...nonCriticalErrors);
        } else {
          result.isValid = false;
          result.errors.push(...contentResult.errors);
        }
      }
      
      result.warnings.push(...contentResult.warnings);
      result.securityFlags = { ...result.securityFlags, ...contentResult.securityFlags };
      
      if (contentResult.imageMetadata) {
        result.imageMetadata = contentResult.imageMetadata;
      }
    }

    // 4. Entropy analysis for advanced threat detection (more lenient for admin)
    if (config.enableEntropyAnalysis && result.isValid) {
      console.log('Running entropy analysis...');
      const entropy = await calculateFileEntropy(file);
      
      // More lenient thresholds for admin uploads
      const minEntropy = config.isAdminUpload ? 2 : 4;
      const maxEntropy = config.isAdminUpload ? 9 : 8.5;
      
      if (entropy < minEntropy || entropy > maxEntropy) {
        result.securityFlags.unusualEntropy = true;
        result.warnings.push(`Unusual file entropy detected: ${entropy.toFixed(2)} bits/byte`);
        
        if (config.blockSuspiciousFiles && !config.isAdminUpload && (entropy < 2 || entropy > 8.8)) {
          result.isValid = false;
          result.errors.push('File has suspicious entropy patterns that may indicate malicious content');
        }
      }
    }

    // 5. Filename security validation
    const filename = file.name.toLowerCase();
    const suspiciousExtensions = ['.php', '.asp', '.jsp', '.exe', '.scr', '.bat', '.cmd', '.js', '.vbs'];
    
    if (suspiciousExtensions.some(ext => filename.includes(ext))) {
      if (config.isAdminUpload) {
        result.warnings.push('Filename contains potentially dangerous extensions');
      } else {
        result.isValid = false;
        result.errors.push('Filename contains potentially dangerous extensions');
      }
    }

    // 6. Final security assessment (more lenient for admin)
    const securityScore = calculateSecurityScore(result, config.isAdminUpload);
    
    const minScore = config.isAdminUpload ? 50 : 70;
    
    if (securityScore < minScore && config.blockSuspiciousFiles && !config.isAdminUpload) {
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
      warnings: result.warnings.length,
      adminMode: config.isAdminUpload
    });

  } catch (error) {
    result.isValid = false;
    result.errors.push(`Security validation failed: ${error}`);
    console.error('Security validation error:', error);
  }

  return result;
};

// Calculate a security score based on validation results (adjusted for admin mode)
const calculateSecurityScore = (result: ImageContentValidationResult, isAdminUpload: boolean = false): number => {
  let score = 100;
  
  // More lenient scoring for admin uploads
  const multiplier = isAdminUpload ? 0.5 : 1;
  
  // Deduct points for each security flag
  if (result.securityFlags.malformedStructure) score -= 30 * multiplier;
  if (result.securityFlags.embeddedScripts) score -= 40 * multiplier;
  if (result.securityFlags.suspiciousSize) score -= 10 * multiplier;
  if (result.securityFlags.unusualEntropy) score -= 15 * multiplier;
  
  // Deduct points for each error
  score -= result.errors.length * 5 * multiplier;
  
  // Deduct points for each warning (less for admin)
  score -= result.warnings.length * (isAdminUpload ? 1 : 2);
  
  return Math.max(0, score);
};
