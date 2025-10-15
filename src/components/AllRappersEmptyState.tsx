import React, { useState } from "react";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { ThemedButton } from "@/components/ui/themed-button";
import { Music, Plus } from "lucide-react";
import { useCanSuggestRappers } from "@/hooks/useCanSuggestRappers";
import RapperSuggestionModal from "./RapperSuggestionModal";

const AllRappersEmptyState = () => {
  const { canSuggest } = useCanSuggestRappers();
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);

  return (
    <>
      <ThemedCard>
        <ThemedCardContent className="p-8 text-center">
          <Music className="w-16 h-16 text-[var(--theme-accent)] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[var(--theme-text)] mb-2">No Rappers Found</h3>
          <p className="text-[var(--theme-textMuted)] mb-4">
            Try adjusting your search or filter criteria.
          </p>
          
          {canSuggest && (
            <ThemedButton
              variant="outline"
              onClick={() => setSuggestionModalOpen(true)}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Suggest a Rapper to Admins
            </ThemedButton>
          )}
        </ThemedCardContent>
      </ThemedCard>

      <RapperSuggestionModal
        open={suggestionModalOpen}
        onOpenChange={setSuggestionModalOpen}
      />
    </>
  );
};

export default AllRappersEmptyState;
