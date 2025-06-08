
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

// Detect potentially inappropriate image content (basic checks)
export const validateImageContent = async (file: File): Promise<{ isValid: boolean; message?: string }> => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) {
        resolve({ isValid: false, message: "Unable to process image" });
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      // Basic checks - you could integrate with AI services here
      // For now, just check dimensions and basic properties
      if (img.width < 50 || img.height < 50) {
        resolve({ isValid: false, message: "Image is too small (minimum 50x50 pixels)" });
        return;
      }
      
      if (img.width > 2000 || img.height > 2000) {
        resolve({ isValid: false, message: "Image is too large (maximum 2000x2000 pixels)" });
        return;
      }
      
      resolve({ isValid: true });
    };
    
    img.onerror = () => {
      resolve({ isValid: false, message: "Invalid image file" });
    };
    
    img.src = URL.createObjectURL(file);
  });
};
