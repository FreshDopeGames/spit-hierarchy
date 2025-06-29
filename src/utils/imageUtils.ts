
// Enhanced image resizing with anti-aliasing and optimization
export const resizeImage = (blob: Blob, width: number, height: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Unable to create canvas context'));
      return;
    }

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      
      // Enable high-quality anti-aliasing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      const sourceWidth = img.naturalWidth;
      const sourceHeight = img.naturalHeight;
      const targetWidth = width;
      const targetHeight = height;
      
      // Calculate scaling factor to determine if we need multi-step downsampling
      const scaleFactor = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
      
      // Use multi-step downsampling for large reductions (>50% reduction)
      if (scaleFactor < 0.5) {
        performMultiStepResize(img, ctx, sourceWidth, sourceHeight, targetWidth, targetHeight);
      } else {
        // Single-step resize for smaller reductions
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      }
      
      // Apply post-processing based on target size
      if (targetWidth <= 128) {
        // Apply sharpening for small images to maintain detail
        applySharpeningFilter(ctx, targetWidth, targetHeight);
      }
      
      // Determine optimal quality and format based on size
      const quality = getOptimalQuality(targetWidth);
      const format = getOptimalFormat(targetWidth);
      
      canvas.toBlob((resizedBlob) => {
        if (!resizedBlob) {
          reject(new Error('Failed to resize image'));
          return;
        }
        resolve(resizedBlob);
      }, format, quality);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(blob);
  });
};

// Multi-step downsampling to prevent aliasing artifacts
const performMultiStepResize = (
  img: HTMLImageElement, 
  ctx: CanvasRenderingContext2D, 
  sourceWidth: number, 
  sourceHeight: number, 
  targetWidth: number, 
  targetHeight: number
) => {
  let currentWidth = sourceWidth;
  let currentHeight = sourceHeight;
  
  // Create temporary canvas for intermediate steps
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) return;
  
  // Enable anti-aliasing on temp context
  tempCtx.imageSmoothingEnabled = true;
  tempCtx.imageSmoothingQuality = 'high';
  
  // Reduce by half in each step until we reach target size
  while (currentWidth > targetWidth * 2 || currentHeight > targetHeight * 2) {
    currentWidth = Math.max(currentWidth * 0.5, targetWidth);
    currentHeight = Math.max(currentHeight * 0.5, targetHeight);
    
    tempCanvas.width = currentWidth;
    tempCanvas.height = currentHeight;
    
    if (currentWidth === sourceWidth && currentHeight === sourceHeight) {
      // First step: draw original image
      tempCtx.drawImage(img, 0, 0, currentWidth, currentHeight);
    } else {
      // Subsequent steps: draw from previous step
      tempCtx.drawImage(tempCanvas, 0, 0, currentWidth, currentHeight);
    }
  }
  
  // Final step: draw to target canvas
  ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);
};

// Apply sharpening filter for small images
const applySharpeningFilter = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const sharpened = new Uint8ClampedArray(data);
    
    // Simple unsharp mask filter
    const strength = 0.3; // Subtle sharpening
    
    for (let i = 4; i < data.length - 4; i += 4) {
      if (i % (width * 4) !== 0 && i % (width * 4) !== (width - 1) * 4) {
        // Apply sharpening kernel to RGB channels
        for (let c = 0; c < 3; c++) {
          const current = data[i + c];
          const left = data[i - 4 + c];
          const right = data[i + 4 + c];
          const up = data[i - width * 4 + c];
          const down = data[i + width * 4 + c];
          
          const sharpened_value = current + strength * (4 * current - left - right - up - down);
          sharpened[i + c] = Math.max(0, Math.min(255, sharpened_value));
        }
      }
    }
    
    const sharpenedImageData = new ImageData(sharpened, width, height);
    ctx.putImageData(sharpenedImageData, 0, 0);
  } catch (error) {
    // If sharpening fails, continue without it
    console.warn('Sharpening filter failed:', error);
  }
};

// Determine optimal quality based on image size
const getOptimalQuality = (size: number): number => {
  if (size <= 64) return 0.95;      // Highest quality for thumbnails
  if (size <= 128) return 0.90;     // High quality for small images
  if (size <= 256) return 0.85;     // Good quality for medium images
  return 0.80;                      // Standard quality for large images
};

// Determine optimal format based on size and browser support
const getOptimalFormat = (size: number): string => {
  // Check for WebP support
  const canvas = document.createElement('canvas');
  const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  
  if (webpSupported) {
    return 'image/webp'; // WebP provides better compression
  }
  
  // For very small images, PNG might be better to preserve sharp edges
  if (size <= 64) {
    return 'image/png';
  }
  
  return 'image/jpeg'; // Default to JPEG for larger images
};

// User avatar sizes - kept as is for user profile avatars
export const generateAvatarSizes = async (originalBlob: Blob) => {
  const sizes = [
    { name: 'thumb', size: 32 },
    { name: 'medium', size: 64 },
    { name: 'large', size: 128 },
    { name: 'xlarge', size: 140 }
  ];

  const resizedImages = await Promise.all(
    sizes.map(async ({ name, size }) => {
      const resizedBlob = await resizeImage(originalBlob, size, size);
      return { name, blob: resizedBlob };
    })
  );

  return resizedImages;
};

// Rapper image sizes - optimized for rapper displays and admin interface
export const generateRapperImageSizes = async (originalBlob: Blob) => {
  const sizes = [
    { name: 'thumb', size: 64 },    // Small cards/lists
    { name: 'medium', size: 128 },  // Medium cards
    { name: 'large', size: 256 },   // Large cards and admin table
    { name: 'xlarge', size: 400 }   // Detail views (matches 366x354 display area)
  ];

  const resizedImages = await Promise.all(
    sizes.map(async ({ name, size }) => {
      const resizedBlob = await resizeImage(originalBlob, size, size);
      return { name, blob: resizedBlob };
    })
  );

  return resizedImages;
};
