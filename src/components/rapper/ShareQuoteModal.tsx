import React, { useState, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemedButton } from "@/components/ui/themed-button";
import { Badge } from "@/components/ui/badge";
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
  songTitle?: string;
}

const FORMATS = {
  square: { w: 1080, h: 1080, label: "Square", sub: "Post", avatar: 320, font: 36, nameFont: 24 },
  portrait: { w: 1080, h: 1920, label: "Portrait", sub: "Story", avatar: 400, font: 40, nameFont: 28 },
} as const;

type FormatKey = keyof typeof FORMATS;

const ShareQuoteModal: React.FC<ShareQuoteModalProps> = ({
  isOpen,
  onClose,
  quote,
  rapperName,
  rapperId,
  songTitle,
}) => {
  const [format, setFormat] = useState<FormatKey>("square");
  const [isGenerating, setIsGenerating] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const { data: avatarUrl } = useRapperImage(rapperId, "xlarge");

  const { w, h, avatar, font, nameFont } = FORMATS[format];

  const maxPreviewWidth = format === "portrait" ? 280 : 320;
  const scale = useMemo(() => Math.min(maxPreviewWidth / w, 1), [w, maxPreviewWidth]);
  const previewW = w * scale;
  const previewH = h * scale;

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

      const filename = `${rapperName.replace(/\s+/g, "-").toLowerCase()}-quote-${format}.png`;

      if (action === "download") {
        const link = document.createElement("a");
        link.download = filename;
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
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = filename;
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

  const renderCard = (forExport = false) => (
    <div
      style={{
        width: w,
        height: h,
        padding: 60,
        background: "#000",
        border: "4px solid",
        borderColor: "hsl(var(--theme-primary))",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        boxSizing: "border-box",
      }}
    >
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={rapperName}
          {...(forExport ? { crossOrigin: "anonymous" as const } : {})}
          style={{
            width: avatar,
            height: avatar,
            borderRadius: 24,
            objectFit: "cover",
            marginBottom: 32,
            border: "3px solid hsl(var(--theme-primary))",
          }}
        />
      )}

      <Quote
        size={40}
        style={{ color: "hsl(var(--theme-primary))", marginBottom: 16 }}
      />

      <p
        style={{
          color: "#fff",
          fontSize: font,
          fontStyle: "italic",
          textAlign: "center",
          lineHeight: 1.5,
          margin: "0 0 24px 0",
          fontWeight: "bold",
          whiteSpace: "pre-line",
        }}
      >
        "{quote}"
      </p>

      <p
        style={{
          color: "hsl(var(--theme-primary))",
          fontSize: nameFont,
          fontWeight: "bold",
          margin: "0 0 32px 0",
          textAlign: "center",
        }}
      >
        — {rapperName}{songTitle && `, "${songTitle}"`}
      </p>

      <p style={{ color: "#666", fontSize: 28, margin: 0 }}>
        spithierarchy.com
      </p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-[hsl(var(--theme-surface))] border-[hsl(var(--theme-border))] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--theme-text))] font-[var(--theme-font-heading)]">
            Share Quote
          </DialogTitle>
        </DialogHeader>

        {/* Format Selection */}
        <div className="flex justify-center gap-2">
          {(Object.entries(FORMATS) as [FormatKey, typeof FORMATS[FormatKey]][]).map(([key, { label, sub }]) => (
            <Badge
              key={key}
              variant={format === key ? "default" : "outline"}
              className="cursor-pointer text-xs px-3 py-2 text-center"
              onClick={() => setFormat(key)}
            >
              {label}
              <span className="hidden sm:inline"> — {sub}</span>
            </Badge>
          ))}
        </div>

        {/* Preview */}
        <div className="flex justify-center my-4">
          <div
            className="border border-[hsl(var(--theme-border))] rounded-lg overflow-hidden"
            style={{ width: previewW, height: previewH }}
          >
            <div
              style={{
                width: w,
                height: h,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              {renderCard()}
            </div>
          </div>
        </div>

        {/* Hidden full-size export target */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: w,
            height: h,
            pointerEvents: "none",
            opacity: 0,
            zIndex: -9999,
          }}
        >
          <div ref={exportRef}>{renderCard()}</div>
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
