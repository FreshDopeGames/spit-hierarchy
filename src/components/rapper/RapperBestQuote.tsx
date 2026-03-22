import { Quote } from "lucide-react";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";

interface RapperBestQuoteProps {
  topQuote: string;
  rapperName: string;
}

const RapperBestQuote = ({ topQuote, rapperName }: RapperBestQuoteProps) => {
  if (!topQuote) return null;

  return (
    <div className="mb-8">
      <ThemedCard className="relative overflow-hidden border-[hsl(var(--theme-primary))]/40 bg-gradient-to-br from-[hsl(var(--theme-surface))] to-[hsl(var(--theme-backgroundLight))]">
        <ThemedCardContent className="p-6 pt-6">
          <h3 className="text-sm font-[var(--theme-font-heading)] text-[hsl(var(--theme-primary))] uppercase tracking-widest mb-4">
            Best Quote
          </h3>
          <div className="relative pl-8">
            <Quote className="absolute left-0 top-0 w-6 h-6 text-[hsl(var(--theme-primary))]/60" />
            <p className="text-lg md:text-xl italic font-[var(--theme-font-body)] text-[hsl(var(--theme-text))] leading-relaxed">
              "{topQuote}"
            </p>
            <p className="mt-3 text-sm font-[var(--theme-font-heading)] text-[hsl(var(--theme-textMuted))] text-right">
              — {rapperName}
            </p>
          </div>
        </ThemedCardContent>
      </ThemedCard>
    </div>
  );
};

export default RapperBestQuote;
