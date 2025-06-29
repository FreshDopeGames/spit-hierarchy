
// Enhanced content moderation with security integration
import { validateFileSecurely, SecurityValidationOptions } from './enhancedSecurity';
import { quickImageValidation } from './imageContentValidation';

// Simple profanity filter - you can enhance this with external APIs
const PROFANITY_WORDS = [
  // Add your list of inappropriate words here
  'badword1', 'badword2', 'inappropriate', 'offensive'
  // Note: This is a basic example - consider using services like:
  // - Perspective API by Google
  // - Azure Content Moderator
  // - AWS Comprehend
];

export const containsProfanity = (text: string): boolean => {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  return PROFANITY_WORDS.some(word => lowerText.includes(word.toLowerCase()));
};

export const filterProfanity = (text: string): string => {
  if (!text) return text;
  
  let filteredText = text;
  PROFANITY_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(word.length));
  });
  
  return filteredText;
};

export const validateContent = (content: string): { isValid: boolean; message?: string } => {
  if (!content.trim()) {
    return { isValid: false, message: "Content cannot be empty" };
  }
  
  if (containsProfanity(content)) {
    return { isValid: false, message: "Content contains inappropriate language" };
  }
  
  if (content.length > 1000) {
    return { isValid: false, message: "Content is too long (max 1000 characters)" };
  }
  
  return { isValid: true };
};

// Basic file validation (kept for backward compatibility)
export const validateImageFile = (file: File): { isValid: boolean; message?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: "Only JPEG, PNG, and WebP images are allowed" 
    };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      message: "Image must be smaller than 5MB" 
    };
  }
  
  return { isValid: true };
};

// Enhanced image validation (replaces the old validateImageContent)
export const validateImageContent = async (file: File, useEnhancedValidation: boolean = false): Promise<{ isValid: boolean; message?: string }> => {
  if (useEnhancedValidation) {
    // Use the new enhanced validation system
    const options: Partial<SecurityValidationOptions> = {
      enableHeaderValidation: true,
      enableContentValidation: true,
      enableEntropyAnalysis: false, // Keep disabled for performance
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      blockSuspiciousFiles: true
    };

    try {
      const result = await validateFileSecurely(file, options);
      
      if (!result.isValid) {
        const mainError = result.errors[0] || 'Enhanced validation failed';
        return { isValid: false, message: mainError };
      }

      // Log any warnings but don't fail validation
      if (result.warnings.length > 0) {
        console.log('Image validation warnings:', result.warnings);
      }

      return { isValid: true };
      
    } catch (error) {
      console.error('Enhanced validation error:', error);
      return { isValid: false, message: 'Enhanced validation failed due to an error' };
    }
  } else {
    // Use quick validation for backward compatibility
    try {
      const result = await quickImageValidation(file);
      return result;
    } catch (error) {
      return { isValid: false, message: 'Image validation failed' };
    }
  }
};
