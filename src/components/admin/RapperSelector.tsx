import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRapperAutocomplete } from "@/hooks/useRapperAutocomplete";
import { Loader2, Search, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RapperSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  excludeIds: string[];
  placeholder?: string;
  required?: boolean;
}

const RapperSelector = ({
  label,
  value,
  onChange,
  excludeIds,
  placeholder = "Type to search rappers...",
  required = false
}: RapperSelectorProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRapper, setSelectedRapper] = useState<{id: string, name: string, real_name: string | null} | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    hasMinLength
  } = useRapperAutocomplete({
    excludeIds
  });

  // Find selected rapper when value changes externally
  useEffect(() => {
    if (value && searchResults.length > 0) {
      const rapper = searchResults.find(r => r.id === value);
      if (rapper) {
        setSelectedRapper(rapper);
        setSearchTerm(rapper.name);
      }
    } else if (!value) {
      setSelectedRapper(null);
      setSearchTerm("");
    }
  }, [value, searchResults]);

  // Show dropdown when typing
  useEffect(() => {
    setShowDropdown(hasMinLength && searchResults.length > 0);
  }, [hasMinLength, searchResults.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRapperSelect = (rapper: typeof searchResults[0]) => {
    setSelectedRapper(rapper);
    setSearchTerm(rapper.name);
    onChange(rapper.id);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setSelectedRapper(null);
    setSearchTerm("");
    onChange("");
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (selectedRapper) {
      setSelectedRapper(null);
      onChange("");
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-[var(--theme-text)]">{label}</Label>
      
      {/* Autocomplete Input */}
      <div className="relative" ref={dropdownRef}>
        <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--theme-text-secondary)]" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => hasMinLength && setShowDropdown(true)}
          className="pl-10 pr-10 bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)]"
          required={required}
        />
        
        {/* Clear button */}
        {(searchTerm || selectedRapper) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-[var(--theme-surface)]"
            onClick={clearSelection}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Selected indicator */}
        {selectedRapper && (
          <Check className="absolute right-9 top-3 h-4 w-4 text-[var(--theme-accent)]" />
        )}

        {/* Autocomplete Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
            {isSearching ? (
              <div className="flex items-center gap-2 p-3 text-[var(--theme-text-secondary)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-3 text-[var(--theme-text-secondary)]">
                No rappers found
              </div>
            ) : (
              searchResults.map((rapper) => (
                <button
                  key={rapper.id}
                  type="button"
                  className="w-full text-left p-3 hover:bg-[var(--theme-primary)]/10 focus:bg-[var(--theme-primary)]/10 focus:outline-none border-b border-[var(--theme-border)] last:border-b-0"
                  onClick={() => handleRapperSelect(rapper)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-[var(--theme-text)]">{rapper.name}</span>
                    {rapper.real_name && (
                      <span className="text-sm text-[var(--theme-text-secondary)]">{rapper.real_name}</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Rapper Display */}
      {selectedRapper && (
        <div className="flex items-center justify-between p-2 bg-[var(--theme-primary)]/10 rounded border border-[var(--theme-primary)]/30">
          <span className="text-sm text-[var(--theme-text)]">
            Selected: <strong>{selectedRapper.name}</strong>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-6 px-2 text-xs hover:bg-[var(--theme-primary)]/20"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};

export default RapperSelector;