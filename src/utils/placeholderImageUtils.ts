
// Optimized placeholder image utility for better performance
const PLACEHOLDER_BASE_URL = "https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images";

// Optimized placeholder images (these would need to be uploaded as smaller, compressed versions)
export const PLACEHOLDER_IMAGES = {
  thumb: `${PLACEHOLDER_BASE_URL}/placeholder-thumb.jpg`, // 64x64, ~2-5KB
  medium: `${PLACEHOLDER_BASE_URL}/placeholder-medium.jpg`, // 128x128, ~5-10KB
  large: `${PLACEHOLDER_BASE_URL}/placeholder-large.jpg`, // 256x256, ~10-20KB
  xlarge: `${PLACEHOLDER_BASE_URL}/placeholder-xlarge.jpg`, // 400x400, ~20-30KB
  original: `${PLACEHOLDER_BASE_URL}/Rapper_Placeholder_01.png` // Fallback to current
};

// Get appropriate placeholder based on size context
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
      // For contexts where size isn't specified, use medium as a good balance
      return PLACEHOLDER_IMAGES.medium;
  }
};

// WebP support detection and fallback
export const getOptimizedPlaceholderWithWebP = (size?: 'thumb' | 'medium' | 'large' | 'xlarge'): string => {
  // For now, return JPEG versions. WebP versions can be added later
  return getOptimizedPlaceholder(size);
};
