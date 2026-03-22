import { useState } from "react";
import { Quote, Share2 } from "lucide-react";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { ThemedButton } from "@/components/ui/themed-button";
import ShareQuoteModal from "./ShareQuoteModal";

interface RapperBestQuoteProps {
  topQuote: string;
  rapperName: string;
  rapperId: string;
  songTitle?: string;
}

const RapperBestQuote = ({ topQuote, rapperName, rapperId, songTitle }: RapperBestQuoteProps) => {
  const [showShare, setShowShare] = useState(false);

  if (!topQuote) return null;

  return (
    <div className="mb-8">
      <ThemedCard className="relative overflow-hidden bg-black border-[hsl(var(--theme-primary))]">
        <ThemedCardContent className="p-6 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-[var(--theme-font-heading)] text-[hsl(var(--theme-primary))] uppercase tracking-widest">
              Best Quote
            </h3>
            <ThemedButton
              variant="outline"
              size="sm"
              className="border-[hsl(var(--theme-primary))]/50 text-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary))]/10 h-8 px-3"
              onClick={() => setShowShare(true)}
            >
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
              Share
            </ThemedButton>
          </div>
          <div className="relative pl-8">
            <Quote className="absolute left-0 top-0 w-6 h-6 text-[hsl(var(--theme-primary))]/60" />
            <p className="text-lg md:text-xl italic font-[var(--theme-font-body)] text-[hsl(var(--theme-text))] leading-relaxed whitespace-pre-line">
              "{topQuote}"
            </p>
            <p className="mt-3 text-sm font-[var(--theme-font-heading)] text-[hsl(var(--theme-textMuted))] text-right">
              — {rapperName}{songTitle && `, "${songTitle}"`}
            </p>
          </div>
        </ThemedCardContent>
      </ThemedCard>

      <ShareQuoteModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        quote={topQuote}
        rapperName={rapperName}
        rapperId={rapperId}
        songTitle={songTitle}
      />
    </div>
  );
};

export default RapperBestQuote;
