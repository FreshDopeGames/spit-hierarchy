
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
      <DialogContent 
        className="max-w-md"
        style={{
          backgroundColor: 'hsl(var(--theme-surface))',
          borderColor: 'hsl(var(--theme-border))'
        }}
      >
        <DialogHeader>
          <DialogTitle 
            className="text-center"
            style={{ 
              color: 'hsl(var(--theme-primary))',
              fontFamily: 'var(--theme-font-heading)'
            }}
          >
            Select Rapper for Position #{position}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(var(--theme-textMuted))' }} />
            <Input
              type="text"
              placeholder="Type rapper name (min 2 characters)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              style={{
                backgroundColor: 'hsl(var(--theme-surface))',
                borderColor: 'hsl(var(--theme-border))',
                color: 'hsl(var(--theme-text))'
              }}
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {!hasMinLength && (
              <div 
                className="text-center text-sm py-4"
                style={{ 
                  color: 'hsl(var(--theme-textMuted))',
                  fontFamily: 'var(--theme-font-body)'
                }}
              >
                Type at least 2 characters to search
              </div>
            )}

            {hasMinLength && isSearching && (
              <div 
                className="text-center text-sm py-4"
                style={{ 
                  color: 'hsl(var(--theme-textMuted))',
                  fontFamily: 'var(--theme-font-body)'
                }}
              >
                Searching...
              </div>
            )}

            {hasMinLength && !isSearching && searchResults.length === 0 && (
              <div 
                className="text-center text-sm py-4"
                style={{ 
                  color: 'hsl(var(--theme-textMuted))',
                  fontFamily: 'var(--theme-font-body)'
                }}
              >
                No rappers found
              </div>
            )}

            {searchResults.map((rapper) => (
              <div
                key={rapper.id}
                onClick={() => handleRapperClick(rapper.id)}
                className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors hover:opacity-90"
                style={{
                  backgroundColor: 'hsl(var(--theme-surfaceSecondary))',
                  borderColor: 'hsl(var(--theme-border))'
                }}
              >
                <div 
                  className="w-10 h-10 rounded-full overflow-hidden border flex-shrink-0"
                  style={{
                    backgroundColor: 'hsl(var(--theme-surface))',
                    borderColor: 'hsl(var(--theme-border))'
                  }}
                >
                  {rapper.image_url ? (
                    <img 
                      src={rapper.image_url} 
                      alt={rapper.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-5 h-5" style={{ color: 'hsl(var(--theme-textMuted))' }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div 
                    className="text-sm truncate"
                    style={{ 
                      color: 'hsl(var(--theme-text))',
                      fontFamily: 'var(--theme-font-body)'
                    }}
                  >
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
