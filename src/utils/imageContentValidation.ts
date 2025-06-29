
// Advanced image content validation and security checks
import { FileValidationResult } from './fileValidation';

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

// Validate image dimensions and structure
const validateImageStructure = async (file: File): Promise<{
  isValid: boolean;
  dimensions?: { width: number; height: number };
  errors: string[];
}> => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const result = {
      isValid: true,
      errors: [] as string[]
    };

    img.onload = () => {
      try {
        // Validate dimensions
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          result.isValid = false;
          result.errors.push('Image has zero dimensions');
          resolve(result);
          return;
        }

        if (img.naturalWidth < 10 || img.naturalHeight < 10) {
          result.isValid = false;
          result.errors.push('Image is too small (minimum 10x10 pixels)');
          resolve(result);
          return;
        }

        if (img.naturalWidth > 8000 || img.naturalHeight > 8000) {
          result.isValid = false;
          result.errors.push('Image is too large (maximum 8000x8000 pixels)');
          resolve(result);
          return;
        }

        // Test canvas rendering to detect malformed images
        canvas.width = Math.min(img.naturalWidth, 100);
        canvas.height = Math.min(img.naturalHeight, 100);
        
        if (!ctx) {
          result.isValid = false;
          result.errors.push('Unable to create canvas context for validation');
          resolve(result);
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Try to get image data to ensure it's not corrupted
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        if (!imageData || imageData.data.length === 0) {
          result.isValid = false;
          result.errors.push('Image data is corrupted or unreadable');
          resolve(result);
          return;
        }

        resolve({
          ...result,
          dimensions: { width: img.naturalWidth, height: img.naturalHeight }
        });

      } catch (error) {
        result.isValid = false;
        result.errors.push(`Image structure validation failed: ${error}`);
        resolve(result);
      }
    };

    img.onerror = () => {
      result.isValid = false;
      result.errors.push('Image failed to load - possibly corrupted or malformed');
      resolve(result);
    };

    img.src = URL.createObjectURL(file);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!result.dimensions) {
        result.isValid = false;
        result.errors.push('Image validation timeout - file may be corrupted');
        resolve(result);
      }
    }, 10000);
  });
};

// Check for embedded scripts or suspicious content in image metadata
const scanForEmbeddedThreats = async (file: File): Promise<{
  hasThreats: boolean;
  threats: string[];
}> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const threats: string[] = [];
    
    reader.onload = () => {
      const content = reader.result as string;
      
      // Check for common script patterns
      const scriptPatterns = [
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /eval\s*\(/i,
        /document\./i,
        /window\./i
      ];

      scriptPatterns.forEach((pattern, index) => {
        if (pattern.test(content)) {
          threats.push(`Suspicious script pattern detected: ${pattern.toString()}`);
        }
      });

      // Check for suspicious URLs
      const urlPattern = /https?:\/\/[^\s"'<>]+/gi;
      const urls = content.match(urlPattern);
      if (urls && urls.length > 0) {
        threats.push(`Embedded URLs detected: ${urls.length} URLs found`);
      }

      resolve({
        hasThreats: threats.length > 0,
        threats
      });
    };

    reader.onerror = () => {
      resolve({ hasThreats: false, threats: [] });
    };

    // Read as text to scan for embedded content
    reader.readAsText(file.slice(0, 1024 * 1024)); // First 1MB
  });
};

// Comprehensive image content validation
export const validateImageContent = async (file: File): Promise<ImageContentValidationResult> => {
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
    console.log('Starting comprehensive image validation for:', file.name);

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

    // 2. Check for suspicious file size vs. dimensions ratio
    if (structureValidation.dimensions) {
      const expectedSize = structureValidation.dimensions.width * structureValidation.dimensions.height * 3; // rough estimate
      const actualSize = file.size;
      
      if (actualSize < expectedSize * 0.01) {
        result.securityFlags.suspiciousSize = true;
        result.warnings.push('File size is unusually small for the image dimensions');
      } else if (actualSize > expectedSize * 10) {
        result.securityFlags.suspiciousSize = true;
        result.warnings.push('File size is unusually large for the image dimensions');
      }
    }

    // 3. Scan for embedded threats
    const threatScan = await scanForEmbeddedThreats(file);
    
    if (threatScan.hasThreats) {
      result.isValid = false;
      result.securityFlags.embeddedScripts = true;
      result.errors.push('Potentially malicious content detected in image metadata');
      result.errors.push(...threatScan.threats);
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
      warnings: result.warnings
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
