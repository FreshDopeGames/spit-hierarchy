import React, { useState, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import ShareableTopFive from "./ShareableTopFive";
import { Download, Copy, Loader2 } from "lucide-react";
import { useRapperImages } from "@/hooks/useImageStyle";

interface ShareTopFiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: Array<{
    position: number;
    rapper: {
      id: string;
      name: string;
      image_url?: string;
    } | null;
  }>;
  username: string;
}

const FORMATS = {
  portrait: { w: 1080, h: 1920, label: 'Portrait', sub: 'Instagram Story' },
  square: { w: 1080, h: 1080, label: 'Square', sub: 'Instagram Post' },
  landscape: { w: 1200, h: 630, label: 'Landscape', sub: 'Twitter/Facebook' },
} as const;

const ShareTopFiveModal: React.FC<ShareTopFiveModalProps> = ({
  isOpen,
  onClose,
  slots,
  username
}) => {
  const [format, setFormat] = useState<keyof typeof FORMATS>('portrait');
  const [isGenerating, setIsGenerating] = useState(false);
  const shareableRef = useRef<HTMLDivElement>(null);

  const { w, h } = FORMATS[format];

  // Fetch high-res images for all rappers in the top 5
  const rapperIds = useMemo(
    () => slots.filter(s => s.rapper).map(s => s.rapper!.id),
    [slots]
  );
  const { data: hiResImages } = useRapperImages(rapperIds, 'xlarge');

  // Map high-res URLs into slots
  const enhancedSlots = useMemo(() => {
    if (!hiResImages) return slots;
    return slots.map(slot => {
      if (!slot.rapper) return slot;
      const hiResUrl = hiResImages[slot.rapper.id];
      if (hiResUrl) {
        return {
          ...slot,
          rapper: { ...slot.rapper, image_url: hiResUrl },
        };
      }
      return slot;
    });
  }, [slots, hiResImages]);

  // Compute scale so the preview fits within max 320px wide
  const maxPreviewWidth = 320;
  const scale = useMemo(() => Math.min(maxPreviewWidth / w, 1), [w]);
  const previewW = w * scale;
  const previewH = h * scale;

  const generateImage = async (action: 'download' | 'copy') => {
    if (!shareableRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(shareableRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      if (action === 'download') {
        const link = document.createElement('a');
        link.download = `${username}-top5-${format}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success("Image downloaded successfully!");
      } else if (action === 'copy') {
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);
              toast.success("Image copied to clipboard!");
            } catch (err) {
              console.error('Failed to copy image:', err);
              toast.error("Failed to copy image. Try downloading instead.");
            }
          }
        }, 'image/png');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const hasAnyRappers = slots.some(slot => slot.rapper);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[95vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-center">Share Your Top 5</DialogTitle>
        </DialogHeader>

        {!hasAnyRappers ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              You need to add at least one rapper to your Top 5 before sharing.
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Format Selection */}
            <div className="flex justify-center gap-2 flex-wrap">
              {(Object.entries(FORMATS) as [keyof typeof FORMATS, typeof FORMATS[keyof typeof FORMATS]][]).map(([key, { label, sub }]) => (
                <Badge
                  key={key}
                  variant={format === key ? 'default' : 'outline'}
                  className="cursor-pointer text-xs px-3 py-2 text-center"
                  onClick={() => setFormat(key)}
                >
                  {label}
                  <span className="hidden sm:inline"> - {sub}</span>
                </Badge>
              ))}
            </div>

            {/* Preview — fixed-size container, no overflow */}
            <div className="flex justify-center">
              <div
                className="border border-border rounded-lg overflow-hidden"
                style={{
                  width: previewW,
                  height: previewH,
                }}
              >
                <div
                  style={{
                    width: w,
                    height: h,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <div ref={shareableRef}>
                    <ShareableTopFive
                      slots={enhancedSlots}
                      username={username}
                      format={format}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => generateImage('download')}
                disabled={isGenerating}
                className="flex items-center gap-2"
                size="sm"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download
              </Button>
              <Button
                onClick={() => generateImage('copy')}
                disabled={isGenerating}
                variant="outline"
                className="flex items-center gap-2"
                size="sm"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                Copy
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareTopFiveModal;
