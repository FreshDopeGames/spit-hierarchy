
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
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((resizedBlob) => {
        if (!resizedBlob) {
          reject(new Error('Failed to resize image'));
          return;
        }
        resolve(resizedBlob);
      }, 'image/jpeg', 0.9);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(blob);
  });
};

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
