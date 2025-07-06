
// Premium placeholder image utility for enhanced quality
const PLACEHOLDER_BASE_URL = "https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images";

// High-quality placeholder images with optimal sizing - corrected URLs
export const PLACEHOLDER_IMAGES = {
  thumb: `${PLACEHOLDER_BASE_URL}/placeholder-thumb.jpg`, // Corrected filename
  medium: `${PLACEHOLDER_BASE_URL}/placeholder-medium.jpg`, // Corrected filename
  large: `${PLACEHOLDER_BASE_URL}/placeholder-large.jpg`, // Corrected filename
  xlarge: `${PLACEHOLDER_BASE_URL}/placeholder-xlarge.jpg`, // Corrected filename
  original: `${PLACEHOLDER_BASE_URL}/Rapper_Placeholder_01.png` // Fallback to current
};

// Get premium placeholder based on size context
export const getOptimizedPlaceholder = (size?: 'thumb' | 'medium' | 'large' | 'xlarge'): string => {
  switch (size) {
    case 'thumb':
      return PLACEHOLDER_IMAGES.thumb;
    case 'medium':
      return PLACEHOLDER_IMAGES.medium;
    case 'large':
      return PLACEHOLDER_IMAGES.large;
    case 'xlarge':
      return PLACEHOLDER_IMAGES.xlarge;
    default:
      // For contexts where size isn't specified, use original as fallback
      return PLACEHOLDER_IMAGES.original;
  }
};

// Premium WebP support with fallback
export const getOptimizedPlaceholderWithWebP = (size?: 'thumb' | 'medium' | 'large' | 'xlarge'): string => {
  // Future enhancement: WebP versions for even better quality/size ratio
  return getOptimizedPlaceholder(size);
};

// Cache-busting utility for placeholder updates
export const getCacheBustedPlaceholder = (size?: 'thumb' | 'medium' | 'large' | 'xlarge'): string => {
  const baseUrl = getOptimizedPlaceholder(size);
  return `${baseUrl}?v=${Math.floor(Date.now() / (1000 * 60 * 10))}`; // Cache for 10 minutes
};
