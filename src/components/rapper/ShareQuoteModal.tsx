import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemedButton } from "@/components/ui/themed-button";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { Download, Copy, Loader2, Quote } from "lucide-react";
import { useRapperImage } from "@/hooks/useImageStyle";

interface ShareQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: string;
  rapperName: string;
  rapperId: string;
}

const ShareQuoteModal: React.FC<ShareQuoteModalProps> = ({
  isOpen,
  onClose,
  quote,
  rapperName,
  rapperId,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const { data: avatarUrl } = useRapperImage(rapperId, "xlarge");

  const generateImage = async (action: "download" | "copy") => {
    if (!exportRef.current) return;
    setIsGenerating(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready;

      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      if (action === "download") {
        const link = document.createElement("a");
        link.download = `${rapperName.replace(/\s+/g, "-").toLowerCase()}-quote.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.success("Image downloaded!");
      } else {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            toast.success("Copied to clipboard!");
          } catch {
            // Fallback: download instead
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `${rapperName.replace(/\s+/g, "-").toLowerCase()}-quote.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            toast.info("Downloaded image (clipboard not available)");
          }
        }
      }
    } catch (err) {
      console.error("Image generation failed:", err);
      toast.error("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-[hsl(var(--theme-surface))] border-[hsl(var(--theme-border))]">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--theme-text))] font-[var(--theme-font-heading)]">
            Share Quote
          </DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="flex justify-center my-4">
          <div
            style={{
              width: 320,
              height: "auto",
              overflow: "hidden",
            }}
          >
            <div
              ref={exportRef}
              style={{
                width: 600,
                transform: `scale(${320 / 600})`,
                transformOrigin: "top left",
                padding: 40,
                background: "#000",
                border: "4px solid",
                borderColor: "hsl(var(--theme-primary))",
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontFamily: "sans-serif",
              }}
            >
              {/* Avatar */}
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={rapperName}
                  crossOrigin="anonymous"
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 16,
                    objectFit: "cover",
                    marginBottom: 24,
                    border: "3px solid hsl(var(--theme-primary))",
                  }}
                />
              )}

              {/* Quote icon */}
              <Quote
                size={32}
                style={{ color: "hsl(var(--theme-primary))", marginBottom: 12 }}
              />

              {/* Quote text */}
              <p
                style={{
                  color: "#fff",
                  fontSize: 24,
                  fontStyle: "italic",
                  textAlign: "center",
                  lineHeight: 1.5,
                  margin: "0 0 16px 0",
                  fontWeight: "bold",
                }}
              >
                "{quote}"
              </p>

              {/* Attribution */}
              <p
                style={{
                  color: "hsl(var(--theme-primary))",
                  fontSize: 18,
                  fontWeight: "bold",
                  margin: "0 0 24px 0",
                }}
              >
                — {rapperName}
              </p>

              {/* Watermark */}
              <p
                style={{
                  color: "#666",
                  fontSize: 12,
                  margin: 0,
                }}
              >
                spithierarchy.com
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <ThemedButton
            variant="default"
            onClick={() => generateImage("download")}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download
          </ThemedButton>
          <ThemedButton
            variant="outline"
            onClick={() => generateImage("copy")}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            Copy
          </ThemedButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareQuoteModal;
