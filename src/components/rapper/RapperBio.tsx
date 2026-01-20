import { useState } from "react";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface RapperBioProps {
  rapper: Rapper;
}

const RapperBio = ({ rapper }: RapperBioProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!rapper.bio) return null;

  // Split bio into paragraphs (by double newlines or single newlines)
  const paragraphs = rapper.bio
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  return (
    <Card className="bg-black border-4 border-[hsl(var(--theme-primary))]/30 rounded-lg shadow-lg shadow-[hsl(var(--theme-primary))]/20 mb-8">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-[hsl(var(--theme-primary))] mb-4 font-[var(--theme-font-heading)]">
          About
        </h2>
        
        <div className="relative">
          {!isExpanded ? (
            // Collapsed view - show first paragraph with line clamp
            <div>
              <p className="leading-relaxed font-[var(--theme-font-body)] text-[hsl(var(--theme-text))] line-clamp-3">
                {paragraphs[0]}
              </p>
              {(paragraphs.length > 1 || (paragraphs[0] && paragraphs[0].length > 300)) && (
                <Button
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="mt-3 bg-[hsl(var(--theme-primary))] text-black hover:bg-[hsl(var(--theme-primary))]/90 border border-[hsl(var(--theme-primary))]/50 font-medium px-4 py-2"
                >
                  ...More <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            // Expanded view - show all paragraphs
            <div className="space-y-4">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="leading-relaxed font-[var(--theme-font-body)] text-[hsl(var(--theme-text))]"
                >
                  {paragraph}
                </p>
              ))}
              <Button
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="mt-2 bg-[hsl(var(--theme-primary))] text-black hover:bg-[hsl(var(--theme-primary))]/90 border border-[hsl(var(--theme-primary))]/50 font-medium px-4 py-2"
              >
                Less <ChevronUp className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RapperBio;
