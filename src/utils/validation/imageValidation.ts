
import { ImageContentValidationResult } from './types';
import { validateImageStructure } from './imageStructure';
import { scanForEmbeddedThreats } from './imageThreatDetection';

// Comprehensive image content validation with admin mode
export const validateImageContent = async (file: File, isAdminUpload: boolean = false): Promise<ImageContentValidationResult> => {
  const result: ImageContentValidationResult = {
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
    console.log('Starting comprehensive image validation for:', file.name, 'Admin mode:', isAdminUpload);

    // 1. Validate image structure and dimensions
    const structureValidation = await validateImageStructure(file);
    
    if (!structureValidation.isValid) {
      result.isValid = false;
      result.errors.push(...structureValidation.errors);
      result.securityFlags.malformedStructure = true;
    } else if (structureValidation.dimensions) {
      result.imageMetadata = {
        width: structureValidation.dimensions.width,
        height: structureValidation.dimensions.height,
        aspectRatio: structureValidation.dimensions.width / structureValidation.dimensions.height
      };
    }

    // 2. Check for suspicious file size vs. dimensions ratio (more lenient for admin)
    if (structureValidation.dimensions) {
      const expectedSize = structureValidation.dimensions.width * structureValidation.dimensions.height * 3;
      const actualSize = file.size;
      
      const minRatio = isAdminUpload ? 0.001 : 0.01;
      const maxRatio = isAdminUpload ? 50 : 10;
      
      if (actualSize < expectedSize * minRatio) {
        result.securityFlags.suspiciousSize = true;
        result.warnings.push('File size is unusually small for the image dimensions');
      } else if (actualSize > expectedSize * maxRatio) {
        result.securityFlags.suspiciousSize = true;
        result.warnings.push('File size is unusually large for the image dimensions');
      }
    }

    // 3. Scan for embedded threats (less aggressive for admin)
    const threatScan = await scanForEmbeddedThreats(file, isAdminUpload);
    
    if (threatScan.hasThreats) {
      if (isAdminUpload) {
        // For admin uploads, log threats as warnings instead of errors
        result.warnings.push('Potentially suspicious content detected in image metadata');
        result.warnings.push(...threatScan.threats);
        result.securityFlags.embeddedScripts = true;
      } else {
        result.isValid = false;
        result.securityFlags.embeddedScripts = true;
        result.errors.push('Potentially malicious content detected in image metadata');
        result.errors.push(...threatScan.threats);
      }
    }

    // 4. Additional security checks for specific file types
    if (file.name.toLowerCase().includes('.php') || 
        file.name.toLowerCase().includes('.asp') || 
        file.name.toLowerCase().includes('.jsp')) {
      result.isValid = false;
      result.errors.push('Filename contains potentially dangerous server-side script extensions');
    }

    console.log('Image content validation completed:', {
      fileName: file.name,
      isValid: result.isValid,
      securityFlags: result.securityFlags,
      errors: result.errors,
      warnings: result.warnings,
      adminMode: isAdminUpload
    });

  } catch (error) {
    result.isValid = false;
    result.errors.push(`Image content validation failed: ${error}`);
    console.error('Image validation error:', error);
  }

  return result;
};

// Quick validation for performance-critical scenarios
export const quickImageValidation = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
  try {
    // Basic checks only
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'File is not an image' };
    }

    if (file.size === 0) {
      return { isValid: false, error: 'File is empty' };
    }

    if (file.size > 50 * 1024 * 1024) {
      return { isValid: false, error: 'File is too large (max 50MB)' };
    }

    // Quick header check
    const header = await new Promise<Uint8Array>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.readAsArrayBuffer(file.slice(0, 8));
    });

    // Very basic magic number validation
    const isValidHeader = 
      (header[0] === 0xFF && header[1] === 0xD8) || // JPEG
      (header[0] === 0x89 && header[1] === 0x50) || // PNG
      (header[0] === 0x52 && header[1] === 0x49) || // WebP (RIFF)
      (header[0] === 0x47 && header[1] === 0x49);   // GIF

    if (!isValidHeader) {
      return { isValid: false, error: 'Invalid image file header' };
    }

    return { isValid: true };

  } catch (error) {
    return { isValid: false, error: `Validation failed: ${error}` };
  }
};
