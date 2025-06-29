
// Filename security and sanitization utilities

// Enhanced filename sanitization
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^[._-]+|[._-]+$/g, '') // Remove leading/trailing dots/underscores/hyphens
    .toLowerCase()
    .slice(0, 100); // Limit length
};
