
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Music, Search } from "lucide-react";
import { useRapperSearch } from "@/hooks/useRapperSearch";

interface RapperSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRapper: (rapperId: string) => void;
  excludeIds: string[];
  position: number;
}

const RapperSearchOverlay = ({
  isOpen,
  onClose,
  onSelectRapper,
  excludeIds,
  position,
}: RapperSearchOverlayProps) => {
  const { searchTerm, setSearchTerm, searchResults, isSearching, hasMinLength } = useRapperSearch(excludeIds);

  const handleRapperClick = (rapperId: string) => {
    onSelectRapper(rapperId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-carbon-fiber border border-rap-gold/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-rap-gold font-merienda text-center">
            Select Rapper for Position #{position}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-rap-smoke" />
            <Input
              type="text"
              placeholder="Type rapper name (min 2 characters)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-rap-carbon border-rap-gold/30 text-rap-platinum placeholder:text-rap-smoke"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {!hasMinLength && (
              <div className="text-center text-rap-smoke font-merienda text-sm py-4">
                Type at least 2 characters to search
              </div>
            )}

            {hasMinLength && isSearching && (
              <div className="text-center text-rap-smoke font-merienda text-sm py-4">
                Searching...
              </div>
            )}

            {hasMinLength && !isSearching && searchResults.length === 0 && (
              <div className="text-center text-rap-smoke font-merienda text-sm py-4">
                No rappers found
              </div>
            )}

            {searchResults.map((rapper) => (
              <div
                key={rapper.id}
                onClick={() => handleRapperClick(rapper.id)}
                className="flex items-center space-x-3 p-3 bg-rap-carbon/30 border border-rap-gold/20 rounded-lg cursor-pointer hover:border-rap-gold/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-rap-carbon to-rap-carbon-light border border-rap-gold/30 flex-shrink-0">
                  {rapper.image_url ? (
                    <img 
                      src={rapper.image_url} 
                      alt={rapper.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-5 h-5 text-rap-platinum/50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-rap-platinum font-merienda text-sm truncate">
                    {rapper.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RapperSearchOverlay;
