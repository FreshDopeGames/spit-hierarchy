
// Enhanced image resizing with superior quality control and sharpening
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
      try {
        console.log(`Resizing image to ${width}x${height}. Original: ${img.naturalWidth}x${img.naturalHeight}`);
        
        canvas.width = width;
        canvas.height = height;
        
        // Enable highest quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Calculate dimensions to maintain aspect ratio with center crop
        const sourceAspect = img.naturalWidth / img.naturalHeight;
        const targetAspect = width / height;
        
        let sourceX = 0, sourceY = 0, sourceWidth = img.naturalWidth, sourceHeight = img.naturalHeight;
        
        if (sourceAspect > targetAspect) {
          // Source is wider - crop sides
          sourceWidth = img.naturalHeight * targetAspect;
          sourceX = (img.naturalWidth - sourceWidth) / 2;
        } else {
          // Source is taller - crop top/bottom
          sourceHeight = img.naturalWidth / targetAspect;
          sourceY = (img.naturalHeight - sourceHeight) / 2;
        }
        
        // Clear canvas (no background fill for transparency support)
        ctx.clearRect(0, 0, width, height);
        
        // Draw the image with precise cropping
        ctx.drawImage(
          img, 
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, width, height
        );
        
        // Apply sharpening filter for small images to counteract softening
        if (width <= 128) {
          const imageData = ctx.getImageData(0, 0, width, height);
          const sharpened = applySharpeningFilter(imageData);
          ctx.putImageData(sharpened, 0, 0);
        }
        
        // Use premium quality settings based on size
        const quality = getPremiumQuality(width);
        console.log(`Using premium quality ${quality} for size ${width}x${height}`);
        
        canvas.toBlob((resizedBlob) => {
          if (!resizedBlob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }
          
          console.log(`High-quality resize to ${width}x${height}: ${resizedBlob.size} bytes`);
          resolve(resizedBlob);
        }, 'image/jpeg', quality);
        
      } catch (error) {
        console.error('Error during high-quality image resize:', error);
        reject(error);
      }
    };

    img.onerror = (error) => {
      console.error('Error loading image for resize:', error);
      reject(new Error('Failed to load image for resizing'));
    };
    
    img.src = URL.createObjectURL(blob);
  });
};

// Apply sharpening filter to counteract resize softening
const applySharpeningFilter = (imageData: ImageData): ImageData => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const output = new ImageData(width, height);
  
  // Sharpening kernel
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      for (let c = 0; c < 3; c++) { // RGB channels only
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const kidx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += data[kidx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        output.data[idx + c] = Math.max(0, Math.min(255, sum));
      }
      output.data[idx + 3] = data[idx + 3]; // Keep original alpha
    }
  }
  
  // Copy edges without sharpening
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        const idx = (y * width + x) * 4;
        for (let c = 0; c < 4; c++) {
          output.data[idx + c] = data[idx + c];
        }
      }
    }
  }
  
  return output;
};

// Premium quality settings optimized for avatar sharpness
const getPremiumQuality = (size: number): number => {
  if (size <= 128) return 0.98;     // Maximum quality for small sizes
  if (size <= 256) return 0.95;    // Very high quality for medium images
  if (size <= 400) return 0.92;    // High quality for large images
  return 0.88;                     // Good quality for xlarge images
};

// User avatar sizes - optimized progression for better quality
export const generateAvatarSizes = async (originalBlob: Blob) => {
  console.log('Generating premium avatar sizes from blob:', originalBlob.size, 'bytes');
  
  const sizes = [
    { name: 'thumb', size: 128 },   // Increased from 64 for crisp small displays
    { name: 'medium', size: 256 },  // Doubled from 128 for sharper medium
    { name: 'large', size: 400 },   // Increased from 256 for crisp large
    { name: 'xlarge', size: 600 }   // Increased from 400 for premium quality
  ];

  const resizedImages = [];
  
  for (const { name, size } of sizes) {
    try {
      console.log(`Generating premium ${name} size (${size}x${size})...`);
      const resizedBlob = await resizeImage(originalBlob, size, size);
      console.log(`Generated premium ${name}: ${resizedBlob.size} bytes`);
      resizedImages.push({ name, blob: resizedBlob });
    } catch (error) {
      console.error(`Failed to generate premium ${name} size:`, error);
      throw new Error(`Failed to generate premium ${name} avatar size: ${error.message}`);
    }
  }

  console.log('Premium avatar size generation completed');
  return resizedImages;
};

// Rapper image sizes - enhanced quality for all rapper displays
export const generateRapperImageSizes = async (originalBlob: Blob) => {
  console.log('Starting premium rapper image generation from blob:', originalBlob.size, 'bytes', originalBlob.type);
  
  // Validate input blob
  if (!originalBlob.type.startsWith('image/')) {
    throw new Error('Invalid blob type - not an image');
  }
  
  if (originalBlob.size === 0) {
    throw new Error('Empty blob provided');
  }
  
  const sizes = [
    { name: 'thumb', size: 128 },   // Doubled from 64 for crisp thumbnails
    { name: 'medium', size: 256 },  // Doubled from 128 for sharp medium
    { name: 'large', size: 512 },   // Doubled from 256 for HD large
    { name: 'xlarge', size: 800 }   // Doubled from 400 for premium detail
  ];

  const resizedImages = [];
  
  for (const { name, size } of sizes) {
    try {
      console.log(`Generating premium rapper ${name} size (${size}x${size})...`);
      const startTime = Date.now();
      
      const resizedBlob = await resizeImage(originalBlob, size, size);
      
      const endTime = Date.now();
      console.log(`Generated premium ${name} in ${endTime - startTime}ms: ${resizedBlob.size} bytes`);
      
      // Validate the generated blob
      if (resizedBlob.size === 0) {
        throw new Error(`Generated ${name} blob is empty`);
      }
      
      resizedImages.push({ name, blob: resizedBlob });
      
    } catch (error) {
      console.error(`Failed to generate premium ${name} size:`, error);
      throw new Error(`Failed to generate premium ${name} rapper image size: ${error.message}`);
    }
  }

  console.log('Premium rapper image generation completed successfully');
  return resizedImages;
};
