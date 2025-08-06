import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import ShareableTopFive from "./ShareableTopFive";
import { Download, Copy, Loader2 } from "lucide-react";

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

const ShareTopFiveModal: React.FC<ShareTopFiveModalProps> = ({
  isOpen,
  onClose,
  slots,
  username
}) => {
  const [format, setFormat] = useState<'square' | 'landscape'>('square');
  const [isGenerating, setIsGenerating] = useState(false);
  const shareableRef = useRef<HTMLDivElement>(null);

  const generateImage = async (action: 'download' | 'copy') => {
    if (!shareableRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(shareableRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      if (action === 'download') {
        // Download the image
        const link = document.createElement('a');
        link.download = `${username}-top5-${format}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success("Image downloaded successfully!");
      } else if (action === 'copy') {
        // Copy to clipboard
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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
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
            <div className="flex justify-center gap-2">
              <Badge 
                variant={format === 'square' ? 'default' : 'outline'}
                className="cursor-pointer text-xs px-2 py-1"
                onClick={() => setFormat('square')}
              >
                Square - Instagram
              </Badge>
              <Badge 
                variant={format === 'landscape' ? 'default' : 'outline'}
                className="cursor-pointer text-xs px-2 py-1"
                onClick={() => setFormat('landscape')}
              >
                Landscape - Twitter/Facebook
              </Badge>
            </div>

            {/* Preview */}
            <div className="flex justify-center">
              <div 
                className="transform scale-[0.5] origin-top border border-border rounded-lg overflow-hidden"
                style={{ 
                  width: format === 'square' ? '1080px' : '1200px',
                  height: format === 'square' ? '1080px' : '630px'
                }}
              >
                <div ref={shareableRef}>
                  <ShareableTopFive 
                    slots={slots}
                    username={username}
                    format={format}
                  />
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
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download
              </Button>
              
              <Button
                onClick={() => generateImage('copy')}
                disabled={isGenerating}
                variant="outline"
                className="flex items-center gap-2"
                size="sm"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Copy to Clipboard
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareTopFiveModal;