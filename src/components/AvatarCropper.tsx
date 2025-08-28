
import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import 'react-image-crop/dist/ReactCrop.css';

interface AvatarCropperProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageBlob: Blob) => void;
  imageFile: File;
}

const AvatarCropper = ({ isOpen, onClose, onCropComplete, imageFile }: AvatarCropperProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imageSrc, setImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        1, // aspect ratio 1:1 for square avatar
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }, []);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      toast.error("Please select a crop area");
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      toast.error("Unable to create canvas context");
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Use high resolution canvas for maximum quality
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;
    
    // Set canvas to high resolution for crisp output
    canvas.width = Math.max(cropWidth, 800); // Minimum 800px for quality
    canvas.height = Math.max(cropHeight, 800);

    // Enable highest quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the cropped image at high resolution
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.98); // Maximum quality for cropped output
    });
  }, [completedCrop]);

  const handleCropComplete = async () => {
    try {
      const croppedBlob = await getCroppedImg();
      if (croppedBlob) {
        onCropComplete(croppedBlob);
        onClose();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to crop image");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--theme-surface)] border-[var(--theme-border)] max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[var(--theme-primary)] font-[var(--theme-font-heading)]">Crop Your Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {imageSrc && (
            <div className="flex justify-center items-center min-h-0">
              <div className="w-full max-h-[60vh] overflow-hidden flex justify-center items-center">
                <ReactCrop
                  crop={crop}
                  onChange={(newCrop) => setCrop(newCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  className="max-w-full max-h-full"
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                    onLoad={onImageLoad}
                    style={{ display: 'block', maxWidth: '90vw', maxHeight: '55vh' }}
                  />
                </ReactCrop>
              </div>
            </div>
          )}
          
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />
          
          <div className="flex justify-end space-x-2 pt-4 border-t border-[var(--theme-border)]">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-surface)]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCropComplete}
              className="bg-[var(--theme-primary)] text-[var(--theme-background)] hover:bg-[var(--theme-primaryDark)] font-[var(--theme-font-heading)]"
              disabled={!completedCrop}
            >
              Apply Crop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarCropper;
