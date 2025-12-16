// Enhanced security utility functions for input validation and sanitization

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/[<>\"'&]/g, '') // Remove potential XSS characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length (removed trim)
};

export const sanitizeForSubmission = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/[<>\"'&]/g, '') // Remove potential XSS characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length and trim for submission
};

// Admin-specific sanitization - more permissive for trusted users
export const sanitizeAdminInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object[^>]*>.*?<\/object>/gi, '') // Remove object tags
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '') // Remove embed tags
    .slice(0, 2000); // Higher limit for admin content
};

// Admin content sanitization - very permissive for rich text content
export const sanitizeAdminContent = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object[^>]*>.*?<\/object>/gi, '') // Remove object tags
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '') // Remove embed tags
    .slice(0, 50000); // Generous limit for long-form blog content
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254 && !email.includes('<') && !email.includes('>');
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'admin', 'letmein'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password contains common words that make it weak');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

export const validateSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 100 && slug.length >= 3;
};

export const validateUsername = (username: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  if (/^[_-]|[_-]$/.test(username)) {
    errors.push('Username cannot start or end with underscore or hyphen');
  }
  
  const reservedNames = ['admin', 'root', 'system', 'api', 'www', 'mail', 'ftp'];
  if (reservedNames.includes(username.toLowerCase())) {
    errors.push('This username is reserved and cannot be used');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateTextInput = (text: string, minLength: number = 1, maxLength: number = 500): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (text.length < minLength) {
    errors.push(`Input must be at least ${minLength} characters long`);
  }
  
  if (text.length > maxLength) {
    errors.push(`Input must be less than ${maxLength} characters long`);
  }
  
  // Check for potential XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  
  if (xssPatterns.some(pattern => pattern.test(text))) {
    errors.push('Input contains potentially dangerous content');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const generateSecureId = (): string => {
  return crypto.getRandomValues(new Uint32Array(4)).join('-');
};

// Enhanced rate limiting utilities
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();
  
  return (identifier: string): { allowed: boolean; resetTime?: number } => {
    const now = Date.now();
    const userRequests = requests.get(identifier) || [];
    
    // Filter out old requests
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = oldestRequest + windowMs;
      return { allowed: false, resetTime };
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
    return { allowed: true };
  };
};

// Input sanitization for different contexts
export const sanitizeForDatabase = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/['";\\]/g, '') // Remove SQL injection chars
    .trim()
    .slice(0, 2000);
};

export const sanitizeForUrl = (input: string): string => {
  if (!input) return '';
  return encodeURIComponent(input.replace(/[<>\"']/g, ''));
};

// Security header utilities
export const getSecurityHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
});
