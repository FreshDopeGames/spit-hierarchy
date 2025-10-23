
import { useState, useRef, useEffect } from "react";
import { ThemedInput } from "@/components/ui/themed-input";
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
  const prevValueRef = useRef<string>(value);

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
    const prevValue = prevValueRef.current;
    
    if (value && searchResults.length > 0) {
      const rapper = searchResults.find(r => r.id === value);
      if (rapper) {
        setSelectedRapper(rapper);
        setSearchTerm(rapper.name);
      }
    } else if (!value && prevValue) {
      // Only clear when value changes from truthy to empty (external clear)
      setSelectedRapper(null);
      setSearchTerm("");
    }
    
    prevValueRef.current = value;
  }, [value, searchResults]);

  // Show dropdown when typing and has enough characters
  useEffect(() => {
    if (hasMinLength && !selectedRapper) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [hasMinLength, selectedRapper]);

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
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    if (selectedRapper) {
      setSelectedRapper(null);
      onChange("");
    }
  };

  const handleInputFocus = () => {
    if (hasMinLength && !selectedRapper) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-[var(--theme-text)]">{label}</Label>
      
      {/* Autocomplete Input */}
      <div className="relative" ref={dropdownRef}>
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 z-10" />
        <ThemedInput
          ref={inputRef}
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="pl-10 pr-10 !bg-white !text-black border-gray-300 placeholder:!text-gray-500"
          required={required}
          autoComplete="off"
        />
        
        {/* Clear button */}
        {(searchTerm || selectedRapper) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-gray-100 z-10"
            onClick={clearSelection}
          >
            <X className="h-4 w-4 text-gray-600" />
          </Button>
        )}

        {/* Selected indicator */}
        {selectedRapper && (
          <Check className="absolute right-9 top-3 h-4 w-4 text-green-600 z-10" />
        )}

        {/* Autocomplete Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 !bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-[9999]">
            {isSearching ? (
              <div className="flex items-center gap-2 p-3 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-3 text-gray-600">
                No rappers found matching "{searchTerm}"
              </div>
            ) : (
              searchResults.map((rapper) => (
                <button
                  key={rapper.id}
                  type="button"
                  className="w-full text-left p-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-200 last:border-b-0 transition-colors"
                  onClick={() => handleRapperSelect(rapper)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-black">{rapper.name}</span>
                    {rapper.real_name && (
                      <span className="text-sm text-gray-600">{rapper.real_name}</span>
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
        <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
          <span className="text-sm text-gray-800">
            Selected: <strong>{selectedRapper.name}</strong>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-6 px-2 text-xs hover:bg-green-100 text-gray-600"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};

export default RapperSelector;
