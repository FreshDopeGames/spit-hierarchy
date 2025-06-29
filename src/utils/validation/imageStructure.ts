
import { ImageStructureValidationResult } from './types';

// Validate image dimensions and structure
export const validateImageStructure = async (file: File): Promise<ImageStructureValidationResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const result: ImageStructureValidationResult = {
      isValid: true,
      dimensions: undefined,
      errors: []
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

        result.dimensions = { width: img.naturalWidth, height: img.naturalHeight };
        resolve(result);

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
