
// Enhanced image resizing with proper quality control and error handling
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
        
        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Calculate dimensions to maintain aspect ratio
        const sourceAspect = img.naturalWidth / img.naturalHeight;
        const targetAspect = width / height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (sourceAspect > targetAspect) {
          // Source is wider than target
          drawHeight = height;
          drawWidth = height * sourceAspect;
          drawX = (width - drawWidth) / 2;
          drawY = 0;
        } else {
          // Source is taller than target
          drawWidth = width;
          drawHeight = width / sourceAspect;
          drawX = 0;
          drawY = (height - drawHeight) / 2;
        }
        
        // Clear canvas with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // Draw the image
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        
        // Determine quality based on size
        const quality = getOptimalQuality(width);
        console.log(`Using quality ${quality} for size ${width}x${height}`);
        
        canvas.toBlob((resizedBlob) => {
          if (!resizedBlob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }
          
          console.log(`Resized to ${width}x${height}: ${resizedBlob.size} bytes`);
          
          // Validate the blob size (should be reasonable for the dimensions)
          const minExpectedSize = width * height * 0.1; // Very conservative minimum
          if (resizedBlob.size < minExpectedSize) {
            console.warn(`Resized blob seems too small: ${resizedBlob.size} bytes for ${width}x${height}`);
          }
          
          resolve(resizedBlob);
        }, 'image/jpeg', quality);
        
      } catch (error) {
        console.error('Error during image resize:', error);
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

// Determine optimal quality based on image size
const getOptimalQuality = (size: number): number => {
  if (size <= 64) return 0.9;       // High quality for thumbnails
  if (size <= 128) return 0.85;     // Good quality for small images
  if (size <= 256) return 0.8;      // Standard quality for medium images
  return 0.75;                      // Efficient quality for large images
};

// User avatar sizes - kept as is for user profile avatars
export const generateAvatarSizes = async (originalBlob: Blob) => {
  console.log('Generating avatar sizes from blob:', originalBlob.size, 'bytes');
  
  const sizes = [
    { name: 'thumb', size: 32 },
    { name: 'medium', size: 64 },
    { name: 'large', size: 128 },
    { name: 'xlarge', size: 140 }
  ];

  const resizedImages = [];
  
  for (const { name, size } of sizes) {
    try {
      console.log(`Generating ${name} size (${size}x${size})...`);
      const resizedBlob = await resizeImage(originalBlob, size, size);
      console.log(`Generated ${name}: ${resizedBlob.size} bytes`);
      resizedImages.push({ name, blob: resizedBlob });
    } catch (error) {
      console.error(`Failed to generate ${name} size:`, error);
      throw new Error(`Failed to generate ${name} avatar size: ${error.message}`);
    }
  }

  console.log('Avatar size generation completed');
  return resizedImages;
};

// Rapper image sizes - optimized for rapper displays with better error handling
export const generateRapperImageSizes = async (originalBlob: Blob) => {
  console.log('Starting rapper image size generation from blob:', originalBlob.size, 'bytes', originalBlob.type);
  
  // Validate input blob
  if (!originalBlob.type.startsWith('image/')) {
    throw new Error('Invalid blob type - not an image');
  }
  
  if (originalBlob.size === 0) {
    throw new Error('Empty blob provided');
  }
  
  const sizes = [
    { name: 'thumb', size: 64 },    // Small cards/lists
    { name: 'medium', size: 128 },  // Medium cards
    { name: 'large', size: 256 },   // Large cards and admin table
    { name: 'xlarge', size: 400 }   // Detail views
  ];

  const resizedImages = [];
  
  for (const { name, size } of sizes) {
    try {
      console.log(`Generating rapper ${name} size (${size}x${size})...`);
      const startTime = Date.now();
      
      const resizedBlob = await resizeImage(originalBlob, size, size);
      
      const endTime = Date.now();
      console.log(`Generated ${name} in ${endTime - startTime}ms: ${resizedBlob.size} bytes`);
      
      // Validate the generated blob
      if (resizedBlob.size === 0) {
        throw new Error(`Generated ${name} blob is empty`);
      }
      
      // Test that the blob is a valid image by creating a temporary object URL
      const testUrl = URL.createObjectURL(resizedBlob);
      const testImg = new Image();
      
      await new Promise((resolve, reject) => {
        testImg.onload = () => {
          console.log(`Validated ${name} image: ${testImg.width}x${testImg.height}`);
          URL.revokeObjectURL(testUrl);
          resolve(true);
        };
        testImg.onerror = () => {
          URL.revokeObjectURL(testUrl);
          reject(new Error(`Generated ${name} blob is not a valid image`));
        };
        testImg.src = testUrl;
      });
      
      resizedImages.push({ name, blob: resizedBlob });
      
    } catch (error) {
      console.error(`Failed to generate ${name} size:`, error);
      throw new Error(`Failed to generate ${name} rapper image size: ${error.message}`);
    }
  }

  console.log('Rapper image size generation completed successfully');
  return resizedImages;
};
